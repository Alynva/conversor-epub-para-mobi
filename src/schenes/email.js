const validator = require("email-validator")
const { Scenes } = require('telegraf')
const sendToKindle = require('../utils/sendToKindle')

const replyWithHelp = require('../utils/replyWithHelp')

function emailSceneBuilder(i18n) {
	const emailScene = new Scenes.BaseScene("email")

	emailScene.enter(ctx => ctx.reply(i18n(ctx.session.lang, 'email_scene_enter')))

	emailScene.command('start', ctx => ctx.reply(i18n(ctx.session.lang, 'email_scene_start')))

	emailScene.command('cancel', async ctx => {
		await ctx.reply(i18n(ctx.session.lang, 'email_scene_cancel'))
		return ctx.scene.leave()
	})

	emailScene.help(replyWithHelp)

	emailScene.on('text', async ctx => {
		if (ctx.scene.state.filled) return ctx.reply(i18n(ctx.session.lang, 'email_scene_start'))

		ctx.session.email = ctx.session.email || {}

		if (!validator.validate(ctx.message.text)) {
			await ctx.reply(i18n(ctx.session.lang, 'invalid_email'))
			return
		}

		if (!ctx.message.text.toLocaleLowerCase().endsWith("@kindle.com") &&
			!ctx.message.text.toLocaleLowerCase().endsWith("@free.kindle.com")) {
			await ctx.reply(i18n(ctx.session.lang, 'invalid_kindle_email'), {
				parse_mode: "Markdown",
			})
			return
		}

		ctx.session.email.kindle = ctx.message.text
		ctx.scene.state.filled = true
		await ctx.reply(i18n(ctx.session.lang, 'email_saved', ctx.session.email.kindle))

		if (!ctx.session.email.approved) {
			await ctx.reply(i18n(ctx.session.lang, 'approved_warning'), {
				parse_mode: "Markdown",
				reply_markup: {
					inline_keyboard: [
						[{
							text: i18n(ctx.session.lang, 'approved_action'),
							callback_data: "email-approved",
						}]
					]
				}
			})

			if (ctx.session.ebookToSend) {
				await ctx.reply(i18n(ctx.session.lang, 'waiting_approve_to_send'))
			} else {
				await ctx.reply(i18n(ctx.session.lang, 'waiting_approve'))
			}
		}
	})

	emailScene.action("email-approved", async ctx => {
		await ctx.answerCbQuery()
		await ctx.editMessageReplyMarkup({})

		ctx.session.email.approved = true

		if (ctx.session.ebookToSend) {
			await sendToKindle(ctx)
				.catch(err => {
					ctx.reply(i18n(ctx.session.lang, 'generic_error'))
					console.error(err)
				})

			ctx.session.ebookToSend = null
		}

		ctx.scene.leave()
	})

	return emailScene
}

module.exports = emailSceneBuilder
