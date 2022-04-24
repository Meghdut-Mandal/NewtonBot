const {MessageType, Mimetype} = require("@adiwajshing/baileys")
const googleTTS = require('google-tts-api');
const STRINGS = require("../lib/db");

module.exports = {
    name: "tts",
    description: STRINGS.tts.DESCRIPTION,
    extendedDescription: STRINGS.tts.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ['.tts やめてください', '.tts やめてください | ja']},
    async handle(client, chat, BotsApp, args) {
        const proccessing = await client.sendMessage(BotsApp.chatId,
            {
                text: STRINGS.tts.PROCESSING
            });
        let text = '';
        let langCode = "en";
        for (var i = 0; i < args.length; i++) {
            if (args[i] == '|') {
                langCode = args[i + 1];
                break;
            }
            text += args[i] + " ";
        }
        if (text === "") {
            await client.sendMessage(BotsApp.chatId,
                {
                    text: STRINGS.tts.NO_INPUT
                });
            // delete processing message
            // await client.deleteMessage(BotsApp.chatId, { id: proccessing.key.id, remoteJid: BotsApp.chatId, fromMe: true });
            return;
        }
        if (text.length > 200) {
            await client.sendMessage(BotsApp.chatId,
                {
                    text: STRINGS.tts.TOO_LONG.format(text.length)
                });
        } else {
            try {
                const url = googleTTS.getAudioUrl(text, {
                    lang: langCode,
                    slow: false,
                    host: 'https://translate.google.com',
                });
                console.log(url);
                await client.sendMessage(BotsApp.chatId, {audio:  {url: url} , mimetype: 'audio/mp4' });
            } catch (err) {
                console.log(err);
            }
        }
        // delete processing message
        //  await client.deleteMessage(BotsApp.chatId, {
        //     id: proccessing.key.id,
        //     remoteJid: BotsApp.chatId,
        //     fromMe: true
        // });
        return;
    }
}