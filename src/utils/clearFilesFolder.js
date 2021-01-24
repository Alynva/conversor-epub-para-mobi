const fs = require('fs/promises')
const findRemoveSync = require('find-remove')

async function clearFilesFolder() {
	const result = findRemoveSync('./files', {
		files: '*.*',
		age: { seconds: 60 * 60 * 24 },
		ignore: '.gitkeep',
		// test: true,
	})

	let rawSession = await fs.readFile("./session_db.json"),
		{ sessions } = JSON.parse(rawSession)

	let users = {}
	for (const path of Object.keys(result)) {
		const res = /output\\(\d*)\\(.*)/g.exec(path)
		users[res[1]] = [
			...(users[res[1]] || []),
			res[2]
		]
	}

	const toRemoveList = []
	for (const user of Object.keys(users)) {
		const session = sessions
			.find(x => x.id.startsWith(`${user}:`) || x.id.endsWith(`:${user}`))
		const sessionIndex = sessions.indexOf(session)
		const docIds = []
		
		users[user].forEach(book => {
			for (const docId of Object.keys(session.data.documentHistory)) {
				const doc = session.data.documentHistory[docId]
				if (doc.file_name + ".mobi" === book) { // TODO: remove the original extension
					docIds.push(docId)
				}
			}
		})

		toRemoveList.push({ sessionIndex, docIds })
	}

	rawSession = await fs.readFile("./session_db.json"),
		{ sessions } = JSON.parse(rawSession)

	toRemoveList.forEach(toRemove => {
		toRemove.docIds.forEach(docId => {
			delete sessions[toRemove.sessionIndex].data.documentHistory[docId]
		})
	})

	await fs.writeFile("./session_db.json", JSON.stringify({ sessions }, null, 2))
}
setInterval(clearFilesFolder, 1000 * 60 * 60)
clearFilesFolder()
