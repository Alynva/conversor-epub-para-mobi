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

module.exports = (err, ctx) => {
	ctx.reply("⚠️ Sorry, I had an problem. Try again later.")
	console.log(`[${new Date().toLocaleString()}]`, `Ooops, encountered an error for ${ctx.updateType}`, err)
	fs.appendFile("./log.txt", `
\n======[START]======\n
[${new Date().toLocaleString()}]

${err}

${err.stack}

${console.trace()}

${JSON.stringify(replaceCircular(ctx))}
\n======[STOP]=======\n
	`, {})
}
