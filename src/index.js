const { Telegraf, Scenes } = require('telegraf')
const LocalSession = require('telegraf-session-local')
const ebookConverter =  require('node-ebook-converter');
const axios = require('axios');
const fs = require('fs/promises')
const fsSync = require('fs')

require('dotenv').config()

const sendToKindle = require('./utils/sendToKindle')
const maintenanceMiddleware = require('./utils/maintenanceMiddleware')
const saveProfileMiddleware = require('./utils/saveProfileMiddleware')
const replyWithHelp = require('./utils/replyWithHelp')
require('./utils/clearFilesFolder')
const i18n = require("./i18n.js")
const catchErrors = require('./utils/catchErrors')(i18n);
require('./utils/resetTasksStatus')()

const emailScene = require('./schenes/email')(i18n);

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
}, {
	command: '/set_lang',
	description: 'Change my language'
}, {
	command: '/cancel',
	description: 'Cancel currently running task'
}]).catch(e => console.error('aff', e))

bot.use(maintenanceMiddleware)

bot.use((new LocalSession({ database: './session_db.json' })).middleware())

bot.use((ctx, next) => {
	ctx.session.profile = ctx.from
	ctx.session.lang = ctx.session.lang || ctx.from.language_code || 'en'
	return next()
})

bot.use(saveProfileMiddleware)

const stage = new Scenes.Stage([emailScene])
bot.use(stage.middleware())

////////////////////////////

bot.start(ctx => ctx?.reply(i18n(ctx.session.lang, 'start')))

bot.help(replyWithHelp(i18n))

bot.command("email", ctx => ctx.scene.enter("email"))

bot.command("channels", ctx => ctx?.reply(i18n(ctx.session.lang, 'channels')))

bot.command("set_lang", ctx => {
	const newLang = ctx.message.text.replace(/\/set_lang ?/g, "")
	if (newLang === '') {
		return ctx.reply(i18n(ctx.session.lang, 'no_lang', i18n.available))
	} else if (i18n.available.includes(newLang)) {
		const messageWithOldLang = i18n(ctx.session.lang, 'lang_changed', ctx.session.lang, newLang)
		const messageWithNewLang = i18n(newLang, 'lang_changed', ctx.session.lang, newLang)
		ctx.session.lang = newLang
		return ctx.reply(`${messageWithNewLang} (${messageWithOldLang})`)
	} else {
		return ctx.reply(i18n(ctx.session.lang, 'lang_unavailable', newLang, i18n.available, ctx.session.lang))
	}
})

bot.on('document', async ctx => {
	if (ctx.session.downloading) {
		ctx?.reply(i18n(ctx.session.lang, 'wait_download', ctx.session.downloading))
		return;
	} else if (ctx.session.converting) {
		ctx?.reply(i18n(ctx.session.lang, 'wait_conversion', ctx.session.converting))
		return;
	} else if (ctx.session.sending) {
		ctx?.reply(i18n(ctx.session.lang, 'wait_upload', ctx.session.sending))
		return;
	}

	// Pega as informações do documento enviado pelo usuário
	const { file_name: tempFileNAme, file_unique_id, file_id, file_size } = ctx.message.document

	const file_name = tempFileNAme.replace(/\n/g, "")

	const max_size = 20_000_000
	if (file_size > max_size) {
		ctx?.reply(i18n(ctx.session.lang, 'too_big_download', file_name, file_size / (10 ** 6), max_size / (10 ** 6)), { parse_mode: "Markdown" })
		return;
	}

	if (!/^.*\.[^\\]+$/g.test(file_name)) {
		ctx?.reply(i18n(ctx.session.lang, 'no_extension', file_name), { parse_mode: "Markdown" })
		return;
	}

	// Salva o documento no histórico do usuário
	ctx.session.documentHistory = {
		...(ctx.session.documentHistory || {}),
		[ctx.message.document.file_unique_id]: ctx.message.document
	}

	// Atualiza o status da conversa
	await ctx?.replyWithChatAction("typing")
	await ctx?.reply(i18n(ctx.session.lang, 'downloading', file_name), { parse_mode: "Markdown" })

	ctx.session.downloading = file_name

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

	if (!ctx.session.downloading) return

	await ctx?.reply(i18n(ctx.session.lang, 'downloaded', file_name), { parse_mode: "Markdown" })

	delete ctx.session.downloading

	// Avisa que o arquivo será excluído depois de 24 horas
	if (!ctx.session.lastCleanUpWarning || ctx.session.lastCleanUpWarning < Date.now() - 1000 * 60 * 60 * 24) {
		ctx.session.lastCleanUpWarning = Date.now()
		await ctx?.reply(i18n(ctx.session.lang, 'file_remove_warning'))
	}

	const keyboard = [[{
		text: i18n(ctx.session.lang, 'btn_convert'),
		callback_data: 'convert2Mobi:' + file_unique_id,
	}]]

	if (!file_name.endsWith(".epub")) {
		keyboard.push([{
			text: i18n(ctx.session.lang, 'btn_send'),
			callback_data: 'send2KindleO:' + file_unique_id,
		}])
	}

	// Pergunta qual ação o usuário quer fazer
	await ctx?.reply(i18n(ctx.session.lang, 'task_question', file_name), {
		parse_mode: "Markdown",
		reply_markup: { inline_keyboard: keyboard }
	})
})

bot.command('cancel', async ctx => {
	let message

	if (ctx.session.downloading) {
		message = i18n(ctx.session.lang, 'stop_download', ctx.session.downloading)
		delete ctx.session.downloading
	} else if (ctx.session.converting) {
		message = i18n(ctx.session.lang, 'stop_conversion', ctx.session.converting)
		delete ctx.session.converting
	} else if (ctx.session.sending) {
		message = i18n(ctx.session.lang, 'stop_upload', ctx.session.sending)
		delete ctx.session.sending
	} else {
		message = i18n(ctx.session.lang, 'nothing_to_stop', ctx.session.sending)
	}

	return ctx?.reply(message)
})

bot.action(/convert2Mobi:(.*)/g, async ctx => {
	if (ctx.session.downloading) {
		ctx?.reply(i18n(ctx.session.lang, 'wait_download', ctx.session.downloading))
		return;
	} else if (ctx.session.converting) {
		ctx?.reply(i18n(ctx.session.lang, 'wait_conversion', ctx.session.converting))
		return;
	} else if (ctx.session.sending) {
		ctx?.reply(i18n(ctx.session.lang, 'wait_upload', ctx.session.sending))
		return;
	}

	await ctx.answerCbQuery()
	await ctx.editMessageReplyMarkup()

	const fileInput = (ctx.session.documentHistory || {})[ctx.match[1]]

	if (!fileInput) {
		ctx?.reply(i18n(ctx.session.lang, 'file_404'))
		return
	}

	const {
		file_name,
		file_unique_id
	} 					= fileInput,
		user_id			= ctx.session.profile.id,//ctx.message.from.id
		fileDir			= "./files/" + user_id,
		filePath		= fileDir + "/" + file_name

	await ctx?.reply(i18n(ctx.session.lang, 'converting', file_name))
	await ctx?.replyWithChatAction("typing")

	ctx.session.converting = file_name

	// Converte o documento
	ebookConverter.convert({
		input: "../"+filePath,
		output: "../"+filePath+".mobi", // TODO: remove the original extension
		silent: true,

		// "line-height": "50",

		"mobi-file-type": "both",

		"mobi-ignore-margins": true,

		"enable-heuristics": true,
	}).then(async () => {
		if (!ctx.session.converting) return

		await ctx.telegram.sendMessage(ctx.chat.id, i18n(ctx.session.lang, 'converted', file_name))
		delete ctx.session.converting

		const { size } = await fs.stat(filePath + ".mobi"),
			sizeInMB = size / (1024 * 1024)

		if (sizeInMB > 50) {
			await ctx.telegram.sendMessage(ctx.chat.id, i18n(ctx.session.lang, 'too_big_upload', sizeInMB.toFixed(2)), {
				reply_markup: {
					inline_keyboard: [
						[{
							text: i18n(ctx.session.lang, 'btn_send'),
							callback_data: 'send2KindleC:' + file_unique_id,
						}]
					]
				}
			})
			await ctx.telegram.sendMessage(ctx.chat.id, i18n(ctx.session.lang, 'too_big_reason'))
			return
		}

		await ctx.telegram.sendMessage(ctx.chat.id, i18n(ctx.session.lang, 'sending', file_name))
		ctx.session.sending = file_name

		// Atualiza o status da conversa
		await ctx.telegram.sendChatAction(ctx.chat.id, "upload_document")

		// Envia o arquivo de volta para o usuário
		await ctx.telegram.sendDocument(ctx.chat.id, {
			source: filePath+".mobi", // TODO: remove the original extension
		}, {
			reply_markup: {
				inline_keyboard: [
					[{
						text: i18n(ctx.session.lang, 'btn_send'),
						callback_data: 'send2KindleC:' + file_unique_id,
					}]
				]
			}
		}).catch(async err => {
			if (!ctx.session.sending) return

			// Avisa o usuário caso ocorra um erro ao enviar
			await ctx.telegram.sendMessage(ctx.chat.id, i18n(ctx.session.lang, 'sending_error', file_name))
			delete ctx.session.sending
			catchErrors(err, ctx, bot)
		})

		if (!ctx.session.sending) return

		await ctx.telegram.sendMessage(ctx.chat.id, i18n(ctx.session.lang, 'done'))
		delete ctx.session.sending
	}).catch(async err => {
		if (!ctx.session.converting) return

		// Avisa o usuário caso ocorra um erro ao converter
		await ctx.telegram.sendMessage(ctx.chat.id, i18n(ctx.session.lang, 'converting_error', file_name))
		delete ctx.session.converting
		console.error(err)
		throw err
	})
})

bot.action(/send2Kindle(O|C):(.*)/g, async ctx => {
	await ctx.answerCbQuery()
	await ctx.editMessageReplyMarkup()

	const fileInput = (ctx.session.documentHistory || {})[ctx.match[2]]

	if (!fileInput) {
		ctx?.reply(i18n(ctx.session.lang, 'file_404'))
		return
	}

	if (fileInput.lastTimeSend && fileInput.lastTimeSend < Date.now() - 1000 * 60 * 10) {
		ctx?.reply(i18n(ctx.session.lang, 'sent_too_quick'))
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
				ctx?.reply(i18n(ctx.session.lang, 'email_error'))
				console.error(err)
			})
		
		ctx.session.ebookToSend = null
	}
})

bot.on("text", ctx => ctx?.reply(i18n(ctx.session.lang, 'default_text')))

const launch = () => bot.launch()
	.then(() => {
		let message = `[${new Date().toLocaleString()}] Bot up and running.`
		console.log(message)
		bot?.telegram?.sendMessage?.(Number(process.env.BOT_ERROR_CHAT), message)
	})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

process.on('unhandledRejection', (reason, promise) => {
	try {
		bot.stop('unhandledRejection')
		// console.log(reason?.response?.error_code)
		catchErrors(reason, promise, bot)
	} catch (e) {
		catchErrors(e, null, bot)
	}
	launch()
})

launch()
