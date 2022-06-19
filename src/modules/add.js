const {MessageType} = require("@adiwajshing/baileys");
const chalk = require("chalk");
const STRINGS = require("../lib/db.js");
const ADD = STRINGS.add;
const inputSanitization = require("../sidekick/input-sanitization");
const fs = require('fs');
const CONFIG = require("../core/config");

module.exports = {
    name: "add",
    description: ADD.DESCRIPTION,
    extendedDescription: ADD.EXTENDED_DESCRIPTION,
    demo: {isEnabled: false},
    async handle(client, chat, BotsApp, args) {
        try {
            if (!BotsApp.isGroup) {
                client.sendMessage(
                    BotsApp.chatId, {
                        text: STRINGS.general.NOT_A_GROUP
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            // if (!BotsApp.isBotGroupAdmin) {
            //     client.sendMessage(
            //         BotsApp.chatId, {
            //             text: STRINGS.general.BOT_NOT_ADMIN
            //         }
            //     ).catch(err => inputSanitization.handleError(err, client, BotsApp));
            //     return;
            // }
            if (!args[0]) {
                client.sendMessage(
                    BotsApp.chatId,
                    {
                        text: ADD.NO_ARG_ERROR
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            let number;
            if (isNaN(args[0]) || args[0][0] === "+" || args[0].length < 10) {
                client.sendMessage(
                    BotsApp.chatId, {
                        text: ADD.NUMBER_SYNTAX_ERROR,
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            if (args[0].length === 10 && !isNaN(args[0])) {
                number = CONFIG.COUNTRY_CODE + args[0];
            } else {
                number = args[0];
            }
            const result = await client.onWhatsApp(
                number + "@s.whatsapp.net"
            );
            if (!result[0].exists) {
                client.sendMessage(
                    BotsApp.chatId, {
                        text: ADD.NOT_ON_WHATSAPP
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            const request = client.groupParticipantsUpdate(BotsApp.chatId, [
                number + "@s.whatsapp.net",
            ], "add");
            const response = await request;

            if (response[number + "@c.us"] === 408) {
                client.sendMessage(
                    BotsApp.chatId, {
                        text: ADD.NO_24HR_BAN,
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            } else if (response[number + "@c.us"] === 403) {
                for (const index in response.participants) {
                    if ([number + "@c.us"] in response.participants[index]) {
                        var code = response.participants[index][number + "@c.us"].invite_code;
                        var tom = response.participants[index][number + "@c.us"].invite_code_exp;
                    }
                }
                var invite = {
                    caption: "```Hi! You have been invited to join this WhatsApp group by BotsApp!```\n\n🔗https://mybotsapp.com",
                    groupJid: BotsApp.groupId,
                    groupName: BotsApp.groupName,
                    inviteCode: code,
                    inviteExpiration: tom,
                    jpegThumbnail: fs.readFileSync('./images/BotsApp_invite.jpeg')
                }
                await client.sendMessage(
                    number + "@s.whatsapp.net",
                    invite,
                    MessageType.groupInviteMessage
                );
                client.sendMessage(
                    BotsApp.chatId, {
                        text: ADD.PRIVACY
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            } else if (response[number + "@c.us"] === 409) {
                client.sendMessage(
                    BotsApp.chatId,
                    {
                        text: ADD.ALREADY_MEMBER
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            client.sendMessage(
                BotsApp.chatId,
                {
                    text: "```" + number + ADD.SUCCESS + "```"
                }
            );
        } catch (err) {
            if (err.status === 400) {
                await inputSanitization.handleError(
                    err,
                    client,
                    BotsApp,
                    (customMessage = ADD.NOT_ON_WHATSAPP)
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
            }
            await inputSanitization.handleError(err, client, BotsApp);
        }
    },
};
