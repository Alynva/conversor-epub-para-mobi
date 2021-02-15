const { Telegraf, Scenes } = require('telegraf')
const LocalSession = require('telegraf-session-local')
const ebookConverter =  require('node-ebook-converter');
const axios = require('axios');
const fs = require('fs/promises')
const fsSync = require('fs')

const sendToKindle = require('./utils/sendToKindle')
const maintenanceMiddleware = require('./utils/maintenanceMiddleware')
const saveProfileMiddleware = require('./utils/saveProfileMiddleware')
const replyWithHelp = require('./utils/replyWithHelp')
require('./utils/clearFilesFolder')
const catchErrors = require('./utils/catchErrors');

const emailScene = require('./schenes/email');

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.catch(catchErrors)

bot.telegram.setMyCommands([{
	command: '/channels',
	description: 'List of useful ebook channels'
}, {
	command: '/email',
	description: 'Save/change your Kindle email',
}, {
	command: '/help',
	description: 'Need help?'
}]).catch(e => console.error('aff', e))

bot.use(maintenanceMiddleware)

bot.use((new LocalSession({ database: './session_db.json' })).middleware())

bot.use(saveProfileMiddleware)

const stage = new Scenes.Stage([emailScene])
bot.use(stage.middleware())

////////////////////////////

bot.start(ctx => ctx.reply("Hi, I'm ready to start converting your eBook files!"))

bot.help(replyWithHelp)

bot.command("email", ctx => ctx.scene.enter("email"))

bot.command("channels", ctx => ctx.reply(`
	Here is some useful channels:

	🇧🇷 PT-BR
	- @livros_compartilhados
	- @livromobi
	- @livrosvariados2019foxtrot
	- @livrosmobiptbr
	- @livrosmobi
	- @livrosmobiepub
`))

bot.on('document', async ctx => {
	// Pega as informações do documento enviado pelo usuário
	const { file_name, file_unique_id, file_id, file_size } = ctx.message.document

	if (file_size > 20000000) {
		ctx.reply(`❌ Sorry, but \`${file_name}\` is too big.`, { parse_mode: "Markdown" })
		return;
	}

	if (!/^.*\.[^\\]+$/g.test(file_name)) {
		ctx.reply(`❌ Sorry, but \`${file_name}\` doesn't have an extension. It is most common with PDFs and if it is your case try rename it with \".pdf\" at the end.`, { parse_mode: "Markdown" })
		return;
	}

	// Salva o documento no histórico do usuário
	ctx.session.documentHistory = {
		...(ctx.session.documentHistory || {}),
		[ctx.message.document.file_unique_id]: ctx.message.document
	}

	// Atualiza o status da conversa
	await ctx.replyWithChatAction("typing")
	await ctx.reply(`☁️ Ok, I'm downloading \`${file_name}\` right now.`, { parse_mode: "Markdown" })

	// Pega o ID do usuário para criar sua própria pasta de arquivos
	const user_id = ctx.session.profile.id//ctx.message.from.id
	const fileDir = "./files/" + user_id
	const filePath = fileDir + "/" + file_name

	// Garante que a pasta do usuário existe
	await fs.mkdir(fileDir, { recursive: true })

	// Acessa a URL do Telegram para baixar o documento e grava no disco
	const fileUrl = await ctx.telegram.getFileLink(file_id)
	const stream = fsSync.createWriteStream(filePath)
	await new Promise(res => {
		stream.on('finish', res)
		axios.get(fileUrl, { responseType: "stream" })
			.then(response => response.data.pipe(stream))
	})

	await ctx.reply(`✅ Download of \`${file_name}\` complete`, { parse_mode: "Markdown" })

	// Avisa que o arquivo será excluído depois de 24 horas
	if (!ctx.session.lastCleanUpWarning || ctx.session.lastCleanUpWarning < Date.now() - 1000 * 60 * 60 * 24) {
		ctx.session.lastCleanUpWarning = Date.now()
		await ctx.reply("🕒 Your file will stay with me in at least 24 hours. After that, I'll start some cleaning to keep this service up and running nice")
	}

	const keyboard = [[{
		text: "Convert to .mobi",
		callback_data: 'convert2Mobi:' + file_unique_id,
	}]]

	if (!file_name.endsWith(".epub")) {
		keyboard.push([{
			text: "Send to my Kindle",
			callback_data: 'send2KindleO:' + file_unique_id,
		}])
	}

	// Pergunta qual ação o usuário quer fazer
	await ctx.reply(`❓ Alright, what you want to do with \`${file_name}\`?`, {
		parse_mode: "Markdown",
		reply_markup: { inline_keyboard: keyboard }
	})
})

bot.action(/convert2Mobi:(.*)/g, async ctx => {
	await ctx.answerCbQuery()
	await ctx.editMessageReplyMarkup()

	const fileInput = (ctx.session.documentHistory || {})[ctx.match[1]]

	if (!fileInput) {
		ctx.reply("❌ Sorry, I didn't find this file.")
		return
	}

	const {
		file_name,
		file_unique_id
	} 					= fileInput,
		user_id			= ctx.session.profile.id,//ctx.message.from.id
		fileDir			= "./files/" + user_id,
		filePath		= fileDir + "/" + file_name

	await ctx.reply("📖 Starting converting...")
	await ctx.replyWithChatAction("typing")

	// Converte o documento
	await ebookConverter.convert({
		input: "../"+filePath,
		output: "../"+filePath+".mobi", // TODO: remove the original extension
		silent: true,

		// "line-height": "50",

		"mobi-file-type": "both",

		"mobi-ignore-margins": true,

		"enable-heuristics": true,
	}).then(async () => {
		await ctx.reply("✅ Conversion complete")
		await ctx.reply("📬 I'll send it for you now")

		// Atualiza o status da conversa
		await ctx.replyWithChatAction("upload_document")

		// Envia o arquivo de volta para o usuário
		await ctx.replyWithDocument({
			source: filePath+".mobi", // TODO: remove the original extension
		}, {
			reply_markup: {
				inline_keyboard: [
					[{
						text: "Send to my Kindle",
						callback_data: 'send2KindleC:' + file_unique_id,
					}]
				]
			}
		})

		await ctx.reply("❤️ Done")
	}).catch(async err => {
		// Avisa o usuário caso ocorra um erro ao converter
		await ctx.reply("❌ Sorry, I had a problem while converting this file.")
		console.error(err)
	})
})

bot.action(/send2Kindle(O|C):(.*)/g, async ctx => {
	await ctx.answerCbQuery()
	await ctx.editMessageReplyMarkup()

	const fileInput = (ctx.session.documentHistory || {})[ctx.match[2]]

	if (!fileInput) {
		ctx.reply("❌ Sorry, I didn't find this file.")
		return
	}

	if (fileInput.lastTimeSend && fileInput.lastTimeSend < Date.now() - 1000 * 60 * 10) {
		ctx.reply("⚠️ Please, wait at lease 10 minutes until try sending this file again.")
		return
	}

	ctx.session.documentHistory[ctx.match[2]].lastTimeSend = Date.now()

	const fileName = fileInput.file_name + ({ // TODO: remove the original extension
		"C": ".mobi" // o arquivo foi convertido
	}[ctx.match[1]] || "")
	const fileOutput = "./files/" + ctx.from.id + "/" + fileName

	ctx.session.ebookToSend = fileOutput

	if (!ctx.session.email || !ctx.session.email.kindle) {
		await ctx.scene.enter("email")
	} else {
		await sendToKindle(ctx)
			.catch(err => {
				ctx.reply("⚠️ Sorry, I had an problem sending the email. Try again later.")
				console.error(err)
			})
		
		ctx.session.ebookToSend = null
	}
})

bot.on("text", ctx => ctx.reply("Use /channels, /email, /help or send me a document."))

bot.launch().then(() => console.log('Bot up and running.'))

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
