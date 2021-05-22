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

module.exports = (err, ctx, bot) => {
    ctx?.reply?.("⚠️ Sorry, I had an problem. Try again later.")
    // if (!ctx || !ctx.reply) console.log(`[${new Date().toLocaleString()}]`, "Ué", err)
	// console.log(`[${new Date().toLocaleString()}]`, `Ooops, encountered an error for ${ctx.updateType}`, err)

    const telegram = ctx?.telegram || bot?.telegram
    if (process.env.BOT_ERROR_CHAT)
        telegram?.sendMessage?.(Number(process.env.BOT_ERROR_CHAT), `Ctx: ${JSON.stringify(replaceCircular(ctx))}

${err}`)

	fs.appendFile("./log.txt", `
\n======[START]======\n
[${new Date().toLocaleString()}]

${err}

${err.stack}

${JSON.stringify(replaceCircular(ctx))}
\n======[STOP]=======\n
	`, {})
}
