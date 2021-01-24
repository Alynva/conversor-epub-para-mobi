const validator = require("email-validator")
const { Scenes } = require('telegraf')

const replyWithHelp = require('../utils/replyWithHelp')

const emailScene = new Scenes.BaseScene("email")

emailScene.enter(ctx => ctx.reply("🧾 What is your Kindle email? (use /cancel to stop)"))

emailScene.command('start', ctx => ctx.reply("Did you mean /cancel ?"))

emailScene.command('cancel', async ctx => {
	await ctx.reply("Ok")
	return ctx.scene.leave()
})

emailScene.help(replyWithHelp)

emailScene.on('text', async ctx => {
	if (ctx.scene.state.filled) return ctx.reply("Did you mean /cancel ?")

	ctx.session.email = ctx.session.email || {}

	if (!validator.validate(ctx.message.text)) {
		await ctx.reply("⚠️ This is not a valid email. Try again.")
		return
	}

	if (!ctx.message.text.toLocaleLowerCase().endsWith("@kindle.com") &&
		!ctx.message.text.toLocaleLowerCase().endsWith("@free.kindle.com")) {
		await ctx.reply("⚠️ This is not a valid Kindle email, it should ends with `@kindle.com` or with `@free.kindle.com`. Try again.", {
			parse_mode: "Markdown",
		})
		return
	}

	ctx.session.email.kindle = ctx.message.text
	ctx.scene.state.filled = true
	await ctx.reply(
		"✅ Ok, I'll save this email:\n" + ctx.session.email.kindle
	)

	if (!ctx.session.email.approved) {
		await ctx.reply("⚠️ Remember to add my email address in your approved emails list: `convert2mobibot@gmail.com`. Use /help for more details.", {
			parse_mode: "Markdown",
			reply_markup: {
				inline_keyboard: [
					[{
						text: "I approved the email",
						callback_data: "email-approved",
					}]
				]
			}
		})

		if (ctx.session.ebookToSend) {
			await ctx.reply("⚠️ Waiting you confirm that you have approved my email before send the ebook...")
		} else {
			await ctx.reply("⚠️ Please confirm that you have approved my email.")
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
				ctx.reply("⚠️ Sorry, I had an problem. Try again later.")
				console.error(err)
			})

		ctx.session.ebookToSend = null
	}

	ctx.scene.leave()
})

module.exports = emailScene
