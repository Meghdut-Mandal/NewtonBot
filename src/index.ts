import { Boom } from '@hapi/boom'
import makeWASocket, {MessageType, AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, useSingleFileAuthState } from '@adiwajshing/baileys'
import MAIN_LOGGER from './utils/logger'
import fs from "fs";
import config =  require("./core/config");
import wa = require('./core/helper');
import Blacklist = require('./database/blacklist');
import clearance = require('./core/clearance');
import Module = require("./database/module");
import chalk  from "chalk";
const STRINGS = require("./lib/db");
import {join} from "path";
const logger = MAIN_LOGGER.child({ })
logger.level = 'trace'
const commandHandler = new Map();


const GENERAL = STRINGS.general;

const sequelize = config.DATABASE;

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({ logger })
store?.readFromFile('./baileys_store_multi.json')
// save every 10s
setInterval(() => {
    store?.writeToFile('./baileys_store_multi.json')
}, 10_000)

const { state, saveState } = useSingleFileAuthState('./auth_info_multi.json')

// start a connection
const startSock = async() => {
    // fetch latest version of WA Web
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state,
        // implement to handle retries
        getMessage: async key => {
            return {
            }
        }
    })

    store?.bind(sock.ev)

    // function to handle messages

    async function onConnected() {
        console.log('Connection opened.')
        console.log(chalk.yellowBright.bold("[INFO] Installing Plugins... Please wait."));
        const moduleFiles = fs.readdirSync(join(__dirname, 'modules')).filter((file) => file.endsWith('.js'))
        for (const file of moduleFiles) {
            try {
                const command = require(join(__dirname, 'modules', `${file}`));
                console.log(
                    chalk.magentaBright("[INFO] Successfully imported module"),
                    chalk.cyanBright.bold(`${file}`)
                )
                commandHandler.set(command.name, command);
            } catch (error) {
                console.log(
                    chalk.blueBright.bold("[INFO] Could not import module"),
                    chalk.redBright.bold(`${file}`)
                )
                console.log(`[ERROR] `, error);
            }
        }
        console.log(chalk.green.bold("[INFO] Plugins Installed Successfully. The bot is ready to use."));
        console.log(chalk.yellowBright.bold("[INFO] Connecting to Database."));
        try {
            await sequelize.authenticate();
            console.log(chalk.greenBright.bold('[INFO] Connection has been established successfully.'));
        } catch (error) {
            console.error('[ERROR] Unable to connect to the database:', error);
        }
        console.log(chalk.yellowBright.bold("[INFO] Syncing Database..."));
        await sequelize.sync();
        console.log(chalk.greenBright.bold("[INFO] All models were synchronized successfully."));
        console.log(chalk.greenBright.bold("[INFO] Connected! Welcome to BotsApp"));
        await sock.sendMessage(
            sock.user.id, {
                text: GENERAL.SUCCESSFUL_CONNECTION.format({
                    worktype: config.WORK_TYPE,
                })
            }
        );
    }


    sock.ev.on('chats.set', item => console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`))
    sock.ev.on('messages.set', item => console.log(`recv ${item.messages.length} messages (is latest: ${item.isLatest})`))
    sock.ev.on('contacts.set', item => console.log(`recv ${item.contacts.length} contacts`))

    sock.ev.on('messages.upsert', async m => {


    })

    sock.sendMessage

    sock.ev.on('messages.update', m => console.log(m))
    sock.ev.on('message-receipt.update', m => console.log(m))
    sock.ev.on('presence.update', m => console.log(m))
    sock.ev.on('contacts.upsert', m => console.log(m))


    sock.ev.on('messages.upsert', async (update) =>{
        console.log(chalk.yellowBright.bold("[INFO] Chat Updated"));
        console.log(chalk.yellowBright.bold(JSON.stringify(update)));

        const chat = update.messages[0];
        const sender = chat.key.remoteJid;
        const groupMetadata = sender.endsWith("@g.us") ? await sock.groupMetadata(sender) : '';
        const BotsApp = wa.resolve(chat, sock, groupMetadata);

        console.log(chalk.yellowBright.bold("[INFO] BotsApp Updated"));
        console.log(JSON.stringify(BotsApp));
        if (BotsApp.isCmd) {
            let isBlacklist = await Blacklist.getBlacklistUser(BotsApp.sender, BotsApp.chatId);
            const cleared = await clearance(BotsApp, sock, isBlacklist);
            if (!cleared) {
                return;
            }
            console.log(chalk.redBright.bold(`[INFO] ${BotsApp.commandName} command executed.`));
            const command = commandHandler.get(BotsApp.commandName);
            const args = BotsApp.body.trim().split(/\s+/).slice(1);
            // console.log("ARGS -> " + args);
            // args.forEach(arg => console.log("arg -> " + arg  + "  type -> " + typeof(arg)));
            // console.log("-------------------------------------------")
            let isCommandDisabled = await Module.isDisabled(BotsApp.commandName , BotsApp.chatId);
            if(isCommandDisabled){
                return console.log(chalk.blueBright.bold(`[INFO] ${BotsApp.commandName} is disabled in ${BotsApp.chatId}.`));
            }
            if (!command) {
                await sock.sendMessage(BotsApp.chatId,
                    {
                        text: "```Woops, invalid command! Use```  *.help*  ```to display the command list.```"
                    });
                return;
            } else if (command && (BotsApp.commandName == "help" || BotsApp.commandName == "disable" || BotsApp.commandName == "enable")) {
                try {
                    command.handle(sock, chat, BotsApp, args, commandHandler);
                    return;
                } catch (err) {
                    console.log(chalk.red("[ERROR] ", err));
                    return;
                }
            }
            try {
                command.handle(sock, chat, BotsApp, args).catch(err => console.log("[ERROR] " + err));
            } catch (err) {
                console.log(chalk.red("[ERROR] ", err));
            }
        }
    })


    sock.ev.on('connection.update', async (update) => {
        const {connection, lastDisconnect} = update
        if (connection === 'close') {
            // reconnect if not logged out
            if ((lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                startSock()
            } else {
                console.log('Connection closed. You are logged out.')
            }
        } else if (connection === 'open') {
            await onConnected();
        }

        console.log('connection update', update)
        // if qr code present generate a link and send to user
        if (update.qr) {
           const message = encodeURIComponent(update.qr);
            // create the qr code url
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000&data=${message}`;
            // log the url
            console.log("Open this link in browser and scan in whatsapp Link "+qrCodeUrl);
        }
        //
    })
    // listen for when the auth credentials is updated
    sock.ev.on('creds.update', saveState)

    return sock
}

startSock()