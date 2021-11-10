const fs = require('fs/promises')


var replaceCircular = function(val, cache) {

    cache = cache || new WeakSet();

    if (val && typeof(val) == 'object') {
        if (cache.has(val)) return '[Circular]';

        cache.add(val);

        var obj = (Array.isArray(val) ? [] : {});
        for(var idx in val) {
            obj[idx] = replaceCircular(val[idx], cache);
        }

        cache.delete(val);
        return obj;
    }

    return val;
};

module.exports = i18n => (err, ctx, bot) => {
    ctx?.reply?.(i18n(ctx.session.lang, 'generic_error'))
    // if (!ctx || !ctx.reply) console.log(`[${new Date().toLocaleString()}]`, "Ué", err)
	// console.log(`[${new Date().toLocaleString()}]`, `Ooops, encountered an error for ${ctx.updateType}`, err)

    const telegram = ctx?.telegram || bot?.telegram
    if (process.env.BOT_ERROR_CHAT) {
        let user = ctx?.update?.callback_query?.from?.username
        const data = Object.assign({}, ctx)
        delete data?.tg
        delete data?.botInfo
        delete data?.scene?.ctx?.tg
        telegram?.sendMessage?.(Number(process.env.BOT_ERROR_CHAT), `${err}

${user && `User: @${user}`}

Ctx: ${JSON.stringify(replaceCircular(data)).slice(0, 1024)}`)
    }

	fs.appendFile("./log.txt", `
\n======[START]======\n
[${new Date().toLocaleString()}]

${err}

${err?.stack}

${JSON.stringify(replaceCircular(ctx))}
\n======[STOP]=======\n
	`, {})
}
