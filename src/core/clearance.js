const chalk = require('chalk');
const config = require('./config')
const adminCommands = require("../sidekick/input-sanitization").adminCommands;
const sudoCommands = require("../sidekick/input-sanitization").sudoCommands;
const STRINGS = require("../lib/db");
const GENERAL = STRINGS.general;
const Users = require('../database/user');
const { MessageType } = require('@adiwajshing/baileys');

const clearance = async(BotsApp, client, isBlacklist) => {
    if((!BotsApp.fromMe && !BotsApp.isSenderSUDO && !BotsApp.isSenderGroupAdmin) && (isBlacklist)){
        console.log(chalk.blueBright.bold(`[INFO] Blacklisted Chat or User.`));
        return false;
    }
    if (BotsApp.isCmd && (!BotsApp.fromMe && !BotsApp.isSenderSUDO)) {
        if (config.WORK_TYPE.toLowerCase() === "public") {
            if (adminCommands.indexOf(BotsApp.commandName) >= 0 && !BotsApp.isSenderGroupAdmin) {
                console.log(
                    chalk.redBright.bold(`[INFO] admin commmand `),
                    chalk.greenBright.bold(`${BotsApp.commandName}`),
                    chalk.redBright.bold(
                        `not executed in public Work Type.`
                    )
                );
                await client.sendMessage(
                    BotsApp.chatId,
                    {
                        text :  GENERAL.ADMIN_PERMISSION
                    }
                );
                return false;
            }

            // else if (sudoCommands.indexOf(BotsApp.commandName) >= 0 && !BotsApp.isSenderSUDO) {
            //     console.log(
            //         chalk.redBright.bold(`[INFO] sudo commmand `),
            //         chalk.greenBright.bold(`${BotsApp.commandName}`),
            //         chalk.redBright.bold(
            //             `not executed in public Work Type.`
            //         )
            //     );
            //     var messageSent = await Users.getUser(BotsApp.chatId);
            //     if(messageSent){
            //         console.log(chalk.blueBright.bold("[INFO] Promo message had already been sent to " + BotsApp.chatId))
            //         return false;
            //     }
            //     else{
            //         await client.sendMessage(
            //             BotsApp.chatId,
            //             {
            //                 text :  GENERAL.SUDO_PERMISSION.format({ worktype: "public", groupName: BotsApp.groupName ? BotsApp.groupName : "private chat", commandName: BotsApp.commandName })
            //             },
            //             {
            //                 contextInfo: {
            //                     stanzaId: BotsApp.chatId,
            //                     participant: BotsApp.sender,
            //                     quotedMessage: {
            //                         conversation: BotsApp.body,
            //                     },
            //                 },
            //             }
            //         );
            //         await Users.addUser(BotsApp.chatId)
            //         return false;
            //     }
            //
            // }
            else{
                return true;
            }
        }
        else if(config.WORK_TYPE.toLowerCase() !== "public" && !BotsApp.isSenderSUDO){
            console.log(
                chalk.redBright.bold(`[INFO] commmand `),
                chalk.greenBright.bold(`${BotsApp.commandName}`),
                chalk.redBright.bold(
                    `not executed in private Work Type.`
                )
            );
        }
    }else{
        return true;
    }
}

module.exports = clearance;
