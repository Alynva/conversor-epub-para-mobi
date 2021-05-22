module.exports = (ctx, next) => {
	console.log(`[${new Date().toLocaleString()}]`)
	if (process.env.BOT_MAINTENACE_CHAT && ctx.from.id !== Number(process.env.BOT_MAINTENACE_CHAT))
		return ctx.reply("⚠️ It's the maintenance time, sorry")
	else
		return next()
}
