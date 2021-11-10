module.exports = (ctx, next) => {
	ctx.session.profile = ctx.from
	ctx.session.lastMessage = new Date().toLocaleString()
	return next()
}
