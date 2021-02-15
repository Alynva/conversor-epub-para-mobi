
function replyWithHelp(ctx) {
	return ctx.reply(`
Just simple send to me any eBook-like files (\`.epub\`, \`.mobi\`, etc) and I will try to convert it to \`.mobi\` file and/or send it to your Kindle with the [Send to Kindle](https://www.amazon.com/gp/sendtokindle) service.

I use my own email \`convert2mobibot@gmail.com\` to do it, so you have to autorize it in your Amazon preferences. Later, you can remove the authorization at any time. As the [Amazon's Help Page](https://www.amazon.com/gp/help/customer/display.html?nodeId=GX9XLEVV8G4DB28H) says:

1. Go to [your preferences](https://www.amazon.com.br/hz/mycd/myx#/home/settings/pdoc#pdoc)
2. Under ***Approved Personal Document Email List***, select ***Add a new approved e-mail address***.
3. Enter my \`convert2mobibot@gmail.com\` email address and select ***Add Address***.

Tip: if you are in mobile, touch on the email address to copy it.

***Note***: if you don't autorize my email, you will receive an email from Amazon saying that I tried send an document and they blocked it. You will receive this email only the first time I try without the authorization and any subsequente attempt will fail without any warning.
	`, { parse_mode: "Markdown" })
}

module.exports = replyWithHelp
