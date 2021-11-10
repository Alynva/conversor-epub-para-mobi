const langs = {
	'en': require('./i18n/en'),
	'pt-br': require('./i18n/pt-br'),
	'es': require('./i18n/es'),
}

function getMessage(lang, id, ...props) {
	let message
	if (langs[lang] && langs[lang][id]) {
		message = langs[lang][id]
	} else {
		message = langs['en'][id]
	}

	return typeof message === 'function' ? message(...props) : message
}

getMessage.available = Object.keys(langs)

module.exports = getMessage
