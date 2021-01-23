const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	service: "gmail",
	host: "smtp.gmail.com",
	port: 587,
	secure: true,
	auth: {
		user: "convert2mobibot@gmail.com",
		pass: "q1W@e3R$",
	},
})

/** @param {import('telegraf').Context} ctx */
async function sendToKindle(ctx) {
	const ebookToSend = ctx.session.ebookToSend,
		eBookName = ebookToSend.replace(/\.\/output\/\d*\//g, "")
		userEmail = ctx.session.email.amazon,
		userKindleEmail = ctx.session.email.kindle
	
	await ctx.reply("📧 Sending email to Kindle `" + userKindleEmail + "` with this eBook: `" + eBookName + "`", { parse_mode: "Markdown" })

	await transporter.sendMail({
		// subject: "",
		// from: userEmail,
		to: userKindleEmail,
		text: eBookName,
		attachments: [{
			path: ebookToSend,

			// contentType: 'application/x-mobipocket-ebook ',
		}]
	})

	await ctx.reply("📨 Email sended.")
}

module.exports = sendToKindle