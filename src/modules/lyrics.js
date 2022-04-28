const got = require("got");
const {MessageType, Mimetype} = require("@adiwajshing/baileys");
const inputSanitization = require("../sidekick/input-sanitization");
const STRINGS = require("../lib/db");
const songlyrics = require("songlyrics").default;

module.exports = {
    name: "lyrics",
    description: STRINGS.lyrics.DESCRIPTION,
    extendedDescription: STRINGS.lyrics.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ".lyrics Stairway to heaven"},
    async handle(client, chat, BotsApp, args) {
        const processing = await client.sendMessage(
            BotsApp.chatId, {
                text: STRINGS.lyrics.PROCESSING
            }
        );
        try {
            var song = "";
            if (BotsApp.isReply) {
                song = BotsApp.replyMessage;
            } else if (args.length == 0) {
                client.sendMessage(
                    BotsApp.chatId,
                    {
                        text: STRINGS.lyrics.NO_ARG
                    }
                );
                return;
            } else {
                song = args.join(" ");
            }
            let Response = await got(
                `https://some-random-api.ml/lyrics/?title=${song}`
            );
            let data = JSON.parse(Response.body);
            let caption =
                "*Title :* " +
                data.title +
                "\n*Author :* " +
                data.author +
                "\n*Lyrics :*\n" +
                data.lyrics;

            try {
                await client.sendMessage(
                    BotsApp.chatId,
                    {
                        image: {
                            url: data.thumbnail.genius
                        },
                        caption: caption,
                        mimetype: "image/png"
                    }
                );
            } catch (err) {
                client.sendMessage(BotsApp.chatId,
                    {
                        text: caption
                    });
            }
            // await client.deleteMessage(BotsApp.chatId, {
            //     id: processing.key.id,
            //     remoteJid: BotsApp.chatId,
            //     fromMe: true,
            // });
            // return;
        } catch (err) {
            try {
                let data = await songlyrics(song)
                let caption =
                    "*Title :* " +
                    song +
                    "\n*Source :* " +
                    data.source.link +
                    "\n*Lyrics :*\n" +
                    data.lyrics;

                await client.sendMessage(BotsApp.chatId,
                    {
                        text : caption
                    });
                // await client.deleteMessage(BotsApp.chatId, {
                //     id: processing.key.id,
                //     remoteJid: BotsApp.chatId,
                //     fromMe: true,
                // });
            } catch (err) {
                await inputSanitization.handleError(
                    err,
                    client,
                    BotsApp,
                    STRINGS.lyrics.NOT_FOUND
                );
                // return await client.deleteMessage(BotsApp.chatId, {
                //     id: processing.key.id,
                //     remoteJid: BotsApp.chatId,
                //     fromMe: true,
                // });

            }
        }
    },
};
