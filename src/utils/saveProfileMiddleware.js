module.exports = (ctx, next) => {
	ctx.session.profile = ctx.from
	return next()
}
