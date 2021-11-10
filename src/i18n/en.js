module.exports = {
	'start': "Hi, I'm ready to start converting your eBook files!",
	'channels': `
	Here is some useful channels:

	🇧🇷 PT-BR
	- @livros_compartilhados
	- @livromobi
	- @livrosvariados2019foxtrot
	- @livrosmobiptbr
	- @livrosmobi
	- @livrosmobiepub
`,
	'no_lang': availableList => `Please, set the language. The available ones are ${availableList.map(l => `'${l}'`).join(", ")}. Eg: "/set_lang en"`,
	'lang_unavailable': (lang, availableList, current) => `The language '${lang}' is not available. The available ones are ${availableList.map(l => `'${l}'`).join(", ")}. I'm currently using '${current}'.`,
	'lang_changed': (oldLang, newLang) => `The language was changed from '${oldLang}' to '${newLang}'`,
	'wait_download': file => `❌ Please, wait until the download of \`${file}\` is complete.`,
	'wait_conversion': file => `❌ Please, wait until the conversion of \`${file}\` is complete.`,
	'wait_upload': file => `❌ Please, wait until the upload of \`${file}\` is complete.`,
	'stop_download': file => `⚠️ Ok, I'll stop the download of \`${file}\`.`,
	'stop_conversion': file => `⚠️ Ok, I'll stop the conversion of \`${file}\`.`,
	'stop_upload': file => `⚠️ Ok, I'll stop the upload of \`${file}\`.It could be that the file still arrives for you.`,
	'nothing_to_stop': `I'm not doing anything right now. You can use this command to stop me from downloading, converting or sending some file for you.`,
	'too_big_download': (file, current, max) => `❌ Sorry, but \`${file}\` is too big. It has ${current}MB and the max is ${max}MB.`,
	'no_extension': file => `❌ Sorry, but \`${file}\` doesn't have an file extension. It is most common with PDFs and if it is your case try rename it with \".pdf\" at the end.`,
	'downloading': file => `☁️ Ok, I'm downloading \`${file}\` right now.`,
	'downloaded': file => `✅ Download of \`${file}\` complete`,
	'file_remove_warning': `🕒 Your file will stay with me in at least 24 hours. After that, I'll start some cleaning to keep this service up and running nice`,
	'btn_convert': `Convert to .mobi`,
	'btn_send': `Send to my Kindle`,
	'task_question': file => `❓ Alright, what you want to do with \`${file}\`?`,
	'file_404': `❌ Sorry, I didn't find this file.`,
	'converting': file => `📖 Starting converting \`${file}\`...`,
	'converted': file => `✅ Conversion of \`${file}\` complete`,
	'too_big_upload': size => `❌ Sorry, the converted file has ${size}MB and the Telegram limits me from sending files up to 50MB.`,
	'too_big_reason': `This may happen when the PDF was composed by images instead of raw text, and that's make the MOBI too large.`,
	'sending': file => `📬 I'll send \`${file}\` for you now`,
	'sending_error': file => `❌ Sorry, I had a problem while sending this file: \`${file}\``,
	'done': `❤️ Done`,
	'converting_error': file => `❌ Sorry, I had a problem while converting this file: \`${file}\`.`,
	'sent_too_quick': `⚠️ Please, wait at lease 10 minutes until try sending this file again.`,
	'email_error': `⚠️ Sorry, I had an problem sending the email. Try again later.`,
	'default_text': `Use /channels, /email, /set_lang, /help or send me a document.`,

	// EMAIL SCENE
	'email_scene_enter': `🧾 What is your Kindle email? (use /cancel to stop)`,
	'email_scene_start': `Did you mean /cancel ?`,
	'email_scene_cancel': `Ok`,
	'invalid_email': `⚠️ This is not a valid email. Try again.`,
	'invalid_kindle_email': `⚠️ This is not a valid Kindle email, it should ends with \`@kindle.com\` or with \`@free.kindle.com\`. Try again.`,
	'email_saved': email => `✅ Ok, I'll save this email:\n${email}`,
	'approved_warning': `⚠️ Remember to add my email address in your approved emails list: \`convert2mobibot@gmail.com\`. Use /help for more details.`,
	'approved_action': `I approved the email`,
	'waiting_approve_to_send': `⚠️ Waiting you confirm that you have approved my email before send the eBook...`,
	'waiting_approve': `⚠️ Please confirm that you have approved my email.`,

	'generic_error': `⚠️ Sorry, I had an problem. Try again later.`,
	'help': `
Just simple send to me any eBook-like files (\`.epub\`, \`.mobi\`, etc) and I will try to convert it to \`.mobi\` file and/or send it to your Kindle with the [Send to Kindle](https://www.amazon.com/gp/sendtokindle) service.

I use my own email \`convert2mobibot@gmail.com\` to do it, so you have to autorize it in your Amazon preferences. Later, you can remove the authorization at any time. As the [Amazon's Help Page](https://www.amazon.com/gp/help/customer/display.html?nodeId=GX9XLEVV8G4DB28H) says:

1. Go to [Manage Your Content and Devices](https://www.amazon.com/-/pt/mycd)
2. From ***Preferences*** scroll down to ***Personal Document Settings***.
3. Under ***Approved Personal Document Email List***, check if your email address is listed. If your email address is not listed, select ***Add a new approved e-mail address***.
4. Enter my \`convert2mobibot@gmail.com\` email address and select ***Add Address***.

Tip: if you are in mobile, touch on the email address to copy it.

***Note***: if you don't autorize my email, you will receive an email from Amazon saying that I tried send an document and they blocked it. You will receive this email only the first time I try without the authorization and any subsequente attempt will fail without any warning.

You can call my developer if have any problems: @alynva`,
}
