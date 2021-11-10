
function replyWithHelp(i18n) {
	return function (ctx) {
		return ctx.reply(i18n(ctx.session.lang, 'help'), { parse_mode: "Markdown" })
	}
}

module.exports = replyWithHelp
