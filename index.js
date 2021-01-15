const { Telegraf, session } = require('telegraf')
const ebookConverter =  require('node-ebook-converter');
const axios = require('axios');
const fs = require('fs/promises')
const fsSync = require('fs')

const bot = new Telegraf('1557602085:AAG0wMJ4i8dahix9-1k5_UZfgA20lw-564Y')

bot.use(session())

bot.catch((err, ctx) => {
	ctx.reply("⚠️ Sorry, I had an problem. Try again later.")
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.start((ctx) => {
  ctx.reply("Hi, I'm ready to start converting your eBook files!")
})

bot.help(ctx => {
	ctx.reply("Just simple send to me any eBook-like files (.epub, .pdf, etc) what I will try to convert it to .mobi file.")
})

/** @param {import('telegraf').Context} ctx */
function addDocumentToTheHistory(ctx) {
	ctx.session = {
		...(ctx.session || {}),
		documentHistory: {
			...((ctx.session || {}).documentHistory || {}),
			[ctx.message.document.file_unique_id]: ctx.message.document
		}
	}
}

bot.on('document', async ctx => {
	// Atualiza o status da conversa
	await ctx.replyWithChatAction("typing")
	await ctx.reply("☁️ Ok, I'm downloading this file right now.")

	// Pega as informações do documento enviado pelo usuário
	const { file_name, file_id, file_unique_id } = ctx.message.document
	const fileUrl = await ctx.telegram.getFileLink(file_id)
	addDocumentToTheHistory(ctx)

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

		// "base-font-size": "20",
		"line-height": "50",
		// "margin-bottom": "20",
		// "margin-left": "40",
		// "margin-right": 40,
		// "margin-top": 20,

		"mobi-file-type": "both",

		"mobi-ignore-margins": true,
	}).catch(async err => {
		// Avisa o usuário caso ocorra um erro ao converter
		await ctx.reply("❌ Sorry, I had a problem while converting this file.")
		console.error(err)
	})
	
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
	await fs.rmdir(outputDir, { recursive: true })
})

bot.action(/send2Kindle:(.*)/g, async ctx => {
	await ctx.reply("🚧 This feature is under construction.")
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))