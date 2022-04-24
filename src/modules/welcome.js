const {MessageType} = require("@adiwajshing/baileys");
const Greetings = require("../database/greeting");
const inputSanitization = require("../sidekick/input-sanitization");
const Strings = require("../lib/db");
const WELCOME = Strings.welcome;

module.exports = {
    name: "welcome",
    description: WELCOME.DESCRIPTION,
    extendedDescription: WELCOME.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [".welcome", ".welcome off", ".welcome delete"],
    },
    async handle(client, chat, BotsApp, args) {
        try {
            if (!BotsApp.isGroup) {
                client.sendMessage(
                    BotsApp.chatId, {
                        text: WELCOME.NOT_A_GROUP,
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }
            let Msg = await Greetings.getMessage(BotsApp.chatId, "welcome");
            if (args.length == 0) {
                const enabled = await Greetings.checkSettings(
                    BotsApp.chatId,
                    "welcome"
                );
                try {
                    if (enabled === false || enabled === undefined) {
                        client.sendMessage(
                            BotsApp.chatId,
                            {
                                text: WELCOME.SET_WELCOME_FIRST
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        return;
                    } else if (enabled === "OFF") {
                        client.sendMessage(
                            BotsApp.chatId, {
                                text: WELCOME.CURRENTLY_DISABLED,
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        client.sendMessage(
                            BotsApp.chatId,
                            {
                                text: Msg.message,
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        return;
                    }

                    client.sendMessage(
                        BotsApp.chatId, {
                            text: WELCOME.CURRENTLY_ENABLED,
                        }
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    client.sendMessage(
                        BotsApp.chatId, {
                            text: Msg.message,
                        }
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                } catch (err) {
                    throw err;
                }
            } else {
                try {
                    if (
                        args[0] === "OFF" ||
                        args[0] === "off" ||
                        args[0] === "Off"
                    ) {
                        switched = "OFF";
                        await Greetings.changeSettings(
                            BotsApp.chatId,
                            switched
                        );
                        client.sendMessage(
                            BotsApp.chatId,
                            {
                                text: WELCOME.GREETINGS_UNENABLED,
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        return;
                    }
                    if (
                        args[0] === "ON" ||
                        args[0] === "on" ||
                        args[0] === "On"
                    ) {
                        switched = "ON";
                        await Greetings.changeSettings(
                            BotsApp.chatId,
                            switched
                        );
                        client.sendMessage(
                            BotsApp.chatId,
                            {
                                text: WELCOME.GREETINGS_ENABLED,
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));

                        return;
                    }
                    if (args[0] === "delete") {
                        Msg = await Greetings.deleteMessage(
                            BotsApp.chatId,
                            "welcome"
                        );
                        if (Msg === false || Msg === undefined) {
                            client.sendMessage(
                                BotsApp.chatId,
                                {
                                    text: WELCOME.SET_WELCOME_FIRST
                                }
                            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                            return;
                        }

                        await client.sendMessage(
                            BotsApp.chatId,
                            {
                                text: WELCOME.WELCOME_DELETED
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));

                        return;
                    }
                    text = BotsApp.body.replace(
                        BotsApp.body[0] + BotsApp.commandName + " ",
                        ""
                    );
                    if (Msg === false || Msg === undefined) {
                        await Greetings.setWelcome(BotsApp.chatId, text);
                        await client.sendMessage(
                            BotsApp.chatId,
                            {
                                text:  WELCOME.WELCOME_UPDATED
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));

                        return;
                    } else {
                        await Greetings.deleteMessage(
                            BotsApp.chatId,
                            "welcome"
                        );
                        await Greetings.setWelcome(BotsApp.chatId, text);
                        await client.sendMessage(
                            BotsApp.chatId,
                            {
                                text: WELCOME.WELCOME_UPDATED
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));

                        return;
                    }
                } catch (err) {
                    throw err;
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
            return;
        }
    },
};
