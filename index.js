const { Telegraf, Scenes } = require('telegraf')
const LocalSession = require('telegraf-session-local')
const ebookConverter =  require('node-ebook-converter');
const axios = require('axios');
const fs = require('fs/promises')
const fsSync = require('fs')
const validator = require("email-validator")
const sendToKindle = require('./utils/sendToKindle')
const findRemoveSync = require('find-remove')

async function clearOutputFolder() {
	const result = findRemoveSync('./output', {
		files: '*.*',
		age: { seconds: 60 * 60 * 24 },
		ignore: '.gitkeep',
		// test: true,
	})

	let rawSession = await fs.readFile("./session_db.json"),
		{ sessions } = JSON.parse(rawSession)

	let users = {}
	for (const path of Object.keys(result)) {
		const res = /output\\(\d*)\\(.*)/g.exec(path)
		users[res[1]] = [
			...(users[res[1]] || []),
			res[2]
		]
	}

	const toRemoveList = []
	for (const user of Object.keys(users)) {
		const session = sessions
			.find(x => x.id.startsWith(`${user}:`) || x.id.endsWith(`:${user}`))
		const sessionIndex = sessions.indexOf(session)
		const docIds = []
		
		users[user].forEach(book => {
			for (const docId of Object.keys(session.data.documentHistory)) {
				const doc = session.data.documentHistory[docId]
				if (doc.file_name + ".mobi" === book) {
					docIds.push(docId)
				}
			}
		})

		toRemoveList.push({ sessionIndex, docIds })
	}

	rawSession = await fs.readFile("./session_db.json"),
		{ sessions } = JSON.parse(rawSession)

	toRemoveList.forEach(toRemove => {
		toRemove.docIds.forEach(docId => {
			delete sessions[toRemove.sessionIndex].data.documentHistory[docId]
		})
	})

	await fs.writeFile("./session_db.json", JSON.stringify({ sessions }, null, 2))
}
setInterval(clearOutputFolder, 1000 * 60 * 60)
clearOutputFolder()

const emailScene = new Scenes.BaseScene("email")
emailScene.enter(ctx => {
	const { fillAmazon } = ctx.scene.state || {}
	if (!ctx.session.email || !ctx.session.email.amazon || fillAmazon) {
		ctx.reply("🛒 What is your **personal** Amazon email?", { parse_mode: "Markdown" })
	} else {
		ctx.reply("🧾 What is your Kindle email?")
	}
})
emailScene.command('start', ctx => ctx.reply("Did you mean /cancel ?"))
emailScene.command('cancel', ctx => {
	ctx.reply("Ok")
	ctx.scene.leave()
})
emailScene.on('text', async ctx => {
	ctx.session.email = ctx.session.email || {}
	const { fillAmazon, fillKindle } = ctx.scene.state || {}

	if (!validator.validate(ctx.message.text)) {
		await ctx.reply("⚠️ This is not a valid email. Try again.")
		return
	}

	if (!ctx.session.email.amazon || fillAmazon) {
		ctx.scene.state.fillAmazon = false

		ctx.session.email.amazon = ctx.message.text
		ctx.reply("🧾 What is your Kindle email?")
	} else if (!ctx.session.email.kindle || fillKindle) {
		if (!ctx.message.text.toLocaleLowerCase().endsWith("@kindle.com")) {
			await ctx.reply("⚠️ This is not a valid Kindle email, it should ends with '@kindle.com'. Try again.")
			return
		}

		ctx.scene.state.fillKindle = false

		ctx.session.email.kindle = ctx.message.text
		await ctx.reply(
			"✅ Ok, I'll save this emails:\n" +
			// "\n🛒 Amazon: " + ctx.session.email.amazon +
			"\n🧾 Kindle: " + ctx.session.email.kindle
		)

		if (ctx.session.ebookToSend) {
			await sendToKindle(ctx)
				.catch(err => {
					ctx.reply("⚠️ Sorry, I had an problem. Try again later.")
					console.error(err)
				})

			ctx.session.ebookToSend = null
		}

		ctx.scene.leave()
	} else {
		ctx.scene.leave()
	}
})

const bot = new Telegraf('1557602085:AAG0wMJ4i8dahix9-1k5_UZfgA20lw-564Y')

bot.use((new LocalSession({ database: 'session_db.json' })).middleware())

const stage = new Scenes.Stage([emailScene])

bot.use(stage.middleware())

bot.catch((err, ctx) => {
	ctx.reply("⚠️ Sorry, I had an problem. Try again later.")
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.start(ctx => {
	ctx.reply("Hi, I'm ready to start converting your eBook files!")
	ctx.session.profile = ctx.from
})

bot.help(ctx => {
	ctx.reply("Just simple send to me any eBook-like files (.epub, .mobi, etc) what I will try to convert it to .mobi file.")
})

bot.command("email", ctx => ctx.scene.enter("email", {
	// fillAmazon: true,
	fillKindle: true,
}))

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
	// Atualiza o status da conversa
	await ctx.replyWithChatAction("typing")
	await ctx.reply("☁️ Ok, I'm downloading this file right now.")

	// Pega as informações do documento enviado pelo usuário
	const { file_name, file_id, file_unique_id, file_size } = ctx.message.document

	if (file_size > 20000000) {
		ctx.reply("Sorry, but this file is too big.")
		return;
	}

	if (!/^.*\.[^\\]+$/g.test(file_name)) {
		ctx.reply("Sorry, but this file doesn't have an extension. It is most common with PDFs and if it is your case try rename it with \".pdf\" at the end.")
		return;
	}

	const fileUrl = await ctx.telegram.getFileLink(file_id)
	ctx.session.documentHistory = {
		...(ctx.session.documentHistory || {}),
		[ctx.message.document.file_unique_id]: ctx.message.document
	}

	// Pega o ID do usuário para criar sua própria pasta de arquivos
	const user_id = ctx.message.from.id
	const inputDir = "./input/" + user_id,
		outputDir = "./output/" + user_id

	// Garante que a pasta do usuário existe
	await fs.mkdir(inputDir, { recursive: true })
	await fs.mkdir(outputDir, { recursive: true })

	const inputFilePath = inputDir + "/" + file_name
	const outputFilePath = outputDir + "/" + file_name + ".mobi"

	// Acessa a URL do Telegram para baixar o documento e grava no disco
	const stream = fsSync.createWriteStream(inputFilePath)
	await new Promise(res => {
		stream.on('finish', res)
		axios.get(fileUrl, { responseType: "stream" })
			.then(response => response.data.pipe(stream))
	})

	await ctx.reply("✅ Download complete")
	await ctx.reply("📖 Starting converting...")
	await ctx.replyWithChatAction("typing")

	// Converte o documento
	await ebookConverter.convert({
		input: inputFilePath,
		output: outputFilePath,
		silent: true,

		"line-height": "50",

		"mobi-file-type": "both",

		"mobi-ignore-margins": true,
	}).catch(async err => {
		// Avisa o usuário caso ocorra um erro ao converter
		await ctx.reply("❌ Sorry, I had a problem while converting this file.")
		console.error(err)
	})
	
	await ctx.reply("✅ Conversion complete")
	await ctx.reply("📬 I'll send it for you now")

	// Atualiza o status da conversa
	await ctx.replyWithChatAction("upload_document")

	// Envia o arquivo de volta para o usuário
	await ctx.replyWithDocument({
		source: outputFilePath,
	}, {
		reply_markup: {
			inline_keyboard: [
				[{
					text: "Send to my Kindle",
					callback_data: 'send2Kindle:' + file_unique_id,
				}]
			]
		}
	})

	// Apaga as pastas do usuário, uma vez que já foi convertido e enviado
	await fs.rmdir(inputDir, { recursive: true })
	// await fs.rmdir(outputDir, { recursive: true })

	await ctx.reply("❤️ All done")

	if (!ctx.session.lastCleanUpWarning || ctx.session.lastCleanUpWarning < Date.now() - 1000 * 60 * 60 * 24) {
		ctx.session.lastCleanUpWarning = Date.now()
		await ctx.reply("🕒 Your file will stay with me in at least 24 hours. After that, I'll start some cleaning to keep this service up and running nice")
	}
})

bot.action(/send2Kindle:(.*)/g, async ctx => {
	const fileInput = (ctx.session.documentHistory || {})[ctx.match[1]]

	if (!fileInput) {
		ctx.reply("Sorry, I didn't find this file.")
		// todo reply
		return
	}

	if (fileInput.lastTimeSend && fileInput.lastTimeSend < Date.now() - 1000 * 60 * 10) {
		ctx.reply("Please, wait at lease 10 minutes until try sending this file again.")
		return
	}

	ctx.session.documentHistory[ctx.match[1]].lastTimeSend = Date.now()

	const fileOutput = "./output/" + ctx.from.id + "/" + fileInput.file_name + ".mobi"

	ctx.session.ebookToSend = fileOutput

	if (!ctx.session.email || !ctx.session.email.amazon || !ctx.session.email.kindle) {
		ctx.scene.enter("email")
	} else {
		await sendToKindle(ctx)
			.catch(err => {
				ctx.reply("⚠️ Sorry, I had an problem. Try again later.")
				console.error(err)
			})
		
		ctx.session.ebookToSend = null
	}
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))