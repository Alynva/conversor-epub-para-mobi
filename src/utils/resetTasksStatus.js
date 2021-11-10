const fs = require('fs/promises')

// TODO: its not working because its async, when the bot starts, the old session state is already in the memory
async function resetTasksStatus() {
	const rawSession = await fs.readFile("./session_db.json"),
		{ sessions } = JSON.parse(rawSession)
	
	for (const session of sessions) {
		delete session.data.downloading
		delete session.data.converting
		delete session.data.sending
	}

	await fs.writeFile("./session_db.json", JSON.stringify({ sessions }, null, 2))
}

module.exports = resetTasksStatus