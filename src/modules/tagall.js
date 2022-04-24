const { MessageType } = require("@adiwajshing/baileys");
const inputSanitization = require("../sidekick/input-sanitization");
const STRINGS = require("../lib/db.js");

module.exports = {
    name: "tagall",
    description: STRINGS.tagall.DESCRIPTION,
    extendedDescription: STRINGS.tagall.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".tagall",
            ".tagall Hey everyone! You have been tagged in this message hehe.",
        ],
    },
    async handle(client, chat, BotsApp, args) {
        try {
            if (!BotsApp.isGroup) {
                client.sendMessage(
                    BotsApp.chatId,
                    {
                        text :   STRINGS.general.NOT_A_GROUP,
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            let members = [];
            for (let i = 0; i < BotsApp.groupMembers.length; i++) {
                members[i] = BotsApp.groupMembers[i].jid;
            }
            if (BotsApp.isReply) {
                client.sendMessage(
                    BotsApp.chatId,
                    {
                        text:  STRINGS.tagall.TAG_MESSAGE,
                        quoted: BotsApp.replyMessage,
                        mentions : members
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            if (args.length) {
                client.sendMessage(
                    BotsApp.chatId,
                    {
                        text:  args.join(" "),
                        mentions : members
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            client.sendMessage(
                BotsApp.chatId,
                {
                    text:  STRINGS.tagall.TAG_MESSAGE,
                    mentions : members
                }
            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
        return;
    },
};
