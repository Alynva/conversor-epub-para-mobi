const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_ADDRESS,
		pass: process.env.GMAIL_PASSWORD,
	},
})

/** @param {import('telegraf').Context} ctx */
async function sendToKindle(ctx) {
	const ebookToSend = ctx.session.ebookToSend,
		eBookName = ebookToSend.replace(/\.\/files\/\d*\//g, "")
		userEmail = ctx.session.email.amazon,
		userKindleEmail = ctx.session.email.kindle
	
	await ctx.reply("📧 Sending email to Kindle `" + userKindleEmail + "` with this eBook: `" + eBookName + "`", { parse_mode: "Markdown" })

	await transporter.sendMail({
		to: userKindleEmail,
		text: eBookName,
		attachments: [{ path: ebookToSend }]
	})

	await ctx.reply("📨 Email sended.")
}

module.exports = sendToKindle