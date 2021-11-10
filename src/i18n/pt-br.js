module.exports = {
	'start': "Olá, estou pronto para começar converter seus arquivos de eBooks!",
	'channels': `
	Aqui está alguns canais úteis:

	🇧🇷 PT-BR
	- @livros_compartilhados
	- @livromobi
	- @livrosvariados2019foxtrot
	- @livrosmobiptbr
	- @livrosmobi
	- @livrosmobiepub
`,
	'no_lang': availableList => `Por favor, defina o idioma. Os disponíveis são ${availableList.map(l => `'${l}'`).join(", ")}. Ex: "/set_lang pt-br"`,
	'lang_unavailable': (lang, availableList, current) => `O idioma '${lang}' não está disponível. Os disponíveis são ${availableList.map(l => `'${l}'`).join(", ")}. Atualmente estou usando '${current}'.`,
	'lang_changed': (oldLang, newLang) => `O idioma foi alterado de '${oldLang}' para '${newLang}'`,
	'wait_download': file => `❌ Por favor, espere até que o download de \`${file}\` termine. Ou use /cancel para parar.`,
	'wait_conversion': file => `❌ Por favor, espere até que a conversão de \`${file}\` termine. Ou use /cancel para parar.`,
	'wait_upload': file => `❌ Por favor, espere até que o envio de \`${file}\` termine. Ou use /cancel para parar.`,
	'stop_download': file => `⚠️ Ok, eu vou parar o download de \`${file}\`. Você pode enviar ou converter outros arquivos agora.`,
	'stop_conversion': file => `⚠️ Ok, eu vou parar a conversão de \`${file}\`. Você pode enviar ou converter outros arquivos agora.`,
	'stop_upload': file => `⚠️ Ok, eu vou parar o envio de \`${file}\`. Pode ser que o arquivo ainda chegue pra você, mas você pode enviar ou converter outros arquivos agora.`,
	'nothing_to_stop': `Não estou fazendo nada agora. Você pode usar esse comando para me parar ao fazer download, converter ou enviar algum arquivo pra você.`,
	'too_big_download': (file, current, max) => `❌ Desculpa, mas \`${file}\` é muito grande. Ele tem ${current}MB e o máximo é ${max}MB.`,
	'no_extension': file => `❌ Desculpa, mas \`${file}\` não possuem uma extensão de arquivo. Isto é comum com PDFs e se este for o seu caso tente renomeá-lo com \".pdf\" no final.`,
	'downloading': file => `☁️ Ok, estou baixando \`${file}\` agora mesmo.`,
	'downloaded': file => `✅ Download de \`${file}\` completo`,
	'file_remove_warning': `🕒 Seu arquivo vai ficar comigo por pelo menos 24 horas. Depois disso, eu vou começar uma limpeza para manter esse serviço funcionando bem`,
	'btn_convert': `Converter para .mobi`,
	'btn_send': `Enviar para meu Kindle`,
	'task_question': file => `❓ Tá bem, o que você deseja fazer com \`${file}\`?`,
	'file_404': `❌ Desculpa, eu não encontrei esse arquivo.`,
	'converting': file => `📖 Começando a converter \`${file}\`...`,
	'converted': file => `✅ Conversão de \`${file}\` completa`,
	'too_big_upload': size => `❌ Desculpa, o arquivo convertido possui ${size}MB e o Telegram me limita a enviar arquivos até 50MB.`,
	'too_big_reason': `Isso pode acontecer quando o PDF é composto por imagens ao invés de texto normal, e isso faz o MOBI ficar grande demais.`,
	'sending': file => `📬 Vou enviar \`${file}\` pra você agora`,
	'sending_error': file => `❌ Desculpa, eu tive um problema enquanto enviava esse arquivo: \`${file}\``,
	'done': `❤️ Feito`,
	'converting_error': file => `❌ Desculpa, eu tive um problema enquanto convertia esse arquivo: \`${file}\`.`,
	'sent_too_quick': `⚠️ Por favor, espere pelo menos 10 minutos para tentar enviar esse arquivo novamente.`,
	'email_error': `⚠️ Desculpa, eu tive um problema enviando o email. Tente novamente mais tarde.`,
	'default_text': `Use /channels, /email, /set_lang, /help ou me envie um documento.`,

	// EMAIL SCENE
	'email_scene_enter': `🧾 Qual é o email do seu Kindle? (use /cancel para parar)`,
	'email_scene_start': `Você quis dizer /cancel ?`,
	'email_scene_cancel': `Ok`,
	'invalid_email': `⚠️ Este não é um email válido. Tente novamente.`,
	'invalid_kindle_email': `⚠️ Este não é um email de Kindle válido, ele deveria terminar com \`@kindle.com\` or com \`@free.kindle.com\`. Tente novamente.`,
	'email_saved': email => `✅ Ok, eu vou salvar esse email:\n${email}`,
	'approved_warning': `⚠️ Lembre-se de adicionar meu endereço de email na sua lista de emails aprovados: \`convert2mobibot@gmail.com\`. Use /help para mais detalhes.`,
	'approved_action': `Eu aprovei o email`,
	'waiting_approve_to_send': `⚠️ Esperando você confirmar que você aprovou o meu email antes de enviar o eBook...`,
	'waiting_approve': `⚠️ Por favor, confirme que você aprovou meu email.`,

	'generic_error': `⚠️ Desculpa, eu tive um problema. Tente novamente mais tarde.`,
	'help': `
Simplesmente me envie qualquer arquivo de eBook (\`.epub\`, \`.mobi\`, etc) e eu vou tentar converter ele para um arquivo \`.mobi\` e/ou enviar ele para seu Kindle com o serviço [Send to Kindle](https://www.amazon.com/gp/sendtokindle).

Eu uso meu próprio email \`convert2mobibot@gmail.com\` para fazer isso, portanto você precisa autorizar ele nas suas preferências da Amazon. Depois, você pode remover a autorização a qualquer momento. Como a [Página de Ajuda da Amazon](https://www.amazon.com.br/gp/help/customer/display.html?ref_=hp_left_v4_sib&nodeId=GX9XLEVV8G4DB28H) diz:

1. Acesse [Gerencie seu conteúdo e dispositivos](https://www.amazon.com.br/mycd).
2. Em ***Preferências*** role para baixo até ***Configurações de documentos pessoais***.
3. Em ***Lista aprovada de e-mails para documentos pessoais***, verifique se o seu endereço de e-mail está listado. Se o seu endereço de e-mail não estiver listado, selecione ***Adicionar um novo endereço de e-mail aprovado***.
3. Insira o meu endereço de email \`convert2mobibot@gmail.com\` e clique em ***Adicionar endereço***.

Dica: se você está em um dispositivo móvel, toque no endereço de email para copiá-lo.

***Note***:se você nao autorizar meu email, você vai receber um email da Amazon dizendo que eu tentei enviar um documento e eles me bloquearam. Você vai receber esse email somente na primeira vez que eu tentar sem a autorização e qualquer tentativa subsequente irá falhar sem nenhum aviso.

Você pode chamar meu desenvolvedor se tiver qualquer problema: @alynva`,
}
