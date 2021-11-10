module.exports = {
	'start': "Hola, estoy listo para comenzar a convertir sus archivos de eBooks",
	'channels': `
	A continuación, se muestran algunos canales útiles:

	🇧🇷 PT-BR
	- @livros_compartilhados
	- @livromobi
	- @livrosvariados2019foxtrot
	- @livrosmobiptbr
	- @livrosmobi
	- @livrosmobiepub"
`,
	'no_lang': availableList => `Configure el idioma. Los disponibles son ${availableList.map(l => `'${l}'`).join(", ")}. Ex: "/set_lang es"`,
	'lang_unavailable': (lang, availableList, current) => `El idioma '${lang}' no está disponible. Los disponibles son ${availableList.map (l => `'$ {l}'`) .join (",")}. Actualmente estoy usando '${current}'.`,
	'lang_changed': (oldLang, newLang) => `El idioma ha sido cambiado de '${oldLang}' a '${newLang}'`,
	'wait_download': file => `❌ Espere hasta que finalice la descarga de \`${file}\`. O use /cancel para detener.`,
	'wait_conversion': file => `❌ Espere hasta que finalice la conversión de \`${file}\`. O use /cancel para detener.`,
	'wait_upload': file => `❌ Espere hasta que finalice la carga de \`${file}\`. O use /cancel para detener.`,
	'stop_download': file => `⚠️ De acuerdo, voy dejar de descargar desde \`${file}\`. Puede enviar o convertir otros archivos ahora.`,
	'stop_conversion': file => `⚠️ De acuerdo, voy dejar de convertir desde \`${file}\`. Puede enviar o convertir otros archivos ahora.`,
	'stop_upload': file => `⚠️ De acuerdo, voy dejar de envíar desde \`${file}\`. Es posible que el archivo aún le llegue, pero ahora puede enviar o convertir otros archivos.`,
	'nothing_to_stop': `No estoy haciendo nada ahora.  Puede usar este comando para parar la descarga, convertir, o envíar algún archivo para usted.`,
	'too_big_download': (file, current, max) => `❌ Perdón, pero \`${file}\` es muy grande El tiene ${current}MB y el máximo es ${max}MB.`,
	'no_extension': file => `❌ Lo siento, pero \`${file}\` no tiene una extensión de archivo. Esto es común con los archivos PDF y, si este es su caso, intente cambiarle el nombre con \".pdf\"al final.`,
	'downloading': file => `☁️ Ok, estoy descargando \`${file}\`ahora mismo.`,
	'downloaded': file => `✅ Descarga de \`${file}\` completo`,
	'file_remove_warning': `🕒 Su archivo permanecerá conmigo durante al menos 24 horas. Después de eso, comenzaré una limpieza para manter este servicio funcionando bien.`,
	'btn_convert': `Convertir a .mobi`,
	'btn_send': `Enviar a mi Kindle`,
	'task_question': file => `❓ De acuerdo, ¿qué quieres hacer con \`${file}\`?`,
	'file_404': `❌ Lo siento, no encontré este archivo.`,
	'converting': file => `📖 Comenzando a convertir \`${file}\`...`,
	'converted': file => `✅ Conversión de \`${file}\` completa`,
	'too_big_upload': size => `❌ Lo siento, el archivo convertido tiene ${size} MB y Telegram me limita a enviar archivos de hasta 50 MB.`,
	'too_big_reason': `Esto puede suceder cuando el PDF está compuesto por imágenes en lugar de texto normal, y esto hace que el MOBI sea demasiado grande.`,
	'sending': file => `📬 Te enviaré \`${file}\` ahora`,
	'sending_error': file => `❌ Lo siento, tuve un problema al cargar este archivo: \`${file}\``,
	'done': `❤️ Hecho`,
	'converting_error': file => `❌ Lo siento, tuve un problema al convertir este archivo: \`${file}\`.`,
	'sent_too_quick': `⚠️ Espere al menos 10 minutos para intentar cargar este archivo nuevamente.`,
	'email_error': `⚠️ Lo siento, tuve un problema al enviar el e-mail. Vuelve a intentarlo más tarde.`,
	'default_text': `Use /channels, /email, /set_lang, /help o envíeme un documento.`,

	// EMAIL SCENE
	'email_scene_enter': `🧾 ¿Cuál es su email del Kindle? (use /cancel para detener)`,
	'email_scene_start': `¿Querías decir /cancel ?`,
	'email_scene_cancel': `Ok`,
	'invalid_email': `⚠️ Este no es un email válido. Inténtalo de nuevo.`,
	'invalid_kindle_email': `⚠️ Este no es un email de Kindle válido, debería terminar con \`@kindle.com\` o con \`@free.kindle.com\`. Inténtalo de nuevo.`,
	'email_saved': email => `✅ Ok, guardaré este email:\n${email}`,
	'approved_warning': `⚠️ Recuerde agregar mi email a su lista de email aprobada: \`convert2mobibot@gmail.com \`. Utilice /help para obtener más detalles.`,
	'approved_action': `Aprobé el email`,
	'waiting_approve_to_send': `⚠️ Esperando que confirmes que aprobaste mi email antes de enviar el eBook ...`,
	'waiting_approve': `⚠️ Confirme que ha aprobado mi email.`,

	'generic_error': `⚠️ Lo siento, tuve un problema. Vuelve a intentarlo más tarde.`,
	'help': `
Simplemente envíeme cualquier archivo de eBook (\`.epub\`, \`.mobi\`, etc) e intentaré convertirlo en un archivo \`.mobi\` y / o enviarlo a su Kindle con el [Send to Kindle] (https://www.amazon.com/gp/sendtokindle).

Utilizo mi proprio email \`convert2mobibot@gmail.com\` para hacer esto, por lo que debes autorizarlo en tus preferencias de Amazon. Después, puede eliminar la autorización en cualquier momento. Como dice la [página de ayuda de Amazon] (https://www.amazon.com.br/gp/help/customer/display.html?ref_=hp_left_v4_sib&nodeId=GX9XLEVV8G4DB28H):

1. Vaya a [Administre su contenido y dispositivos] (https://www.amazon.com.br/mycd).
2. En *** Preferencias ***, desplácese hacia abajo hasta *** Configuración de documentos personales ***.
3. En *** Lista de email aprobada para documentos personales ***, verifique que aparezca mi email. Si mi email no aparece en la lista, seleccione *** Agregar uno nuevo email aprobado ***.
3. Ingrese mi email \`convert2mobibot@gmail.com\` y haga clic en *** Agregar email ***.

Sugerencia: si está en un dispositivo móvil, toque en lo email para copiarlo.

*** Nota ***: Si no autorizas mi email, recibirás un email de Amazon diciendo que intenté enviar un documento y me bloquearon. Solo recibirá este email en la primera vez que lo intente sin autorización y cualquier intento posterior fallará sin previo aviso.

Puede llamar a mi desarrollador si tiene algún problema: @alynva`,
}
