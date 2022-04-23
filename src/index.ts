import { Boom } from '@hapi/boom'
import makeWASocket, {MessageType, AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, useSingleFileAuthState } from '@adiwajshing/baileys'
import MAIN_LOGGER from './utils/logger'
import fs from "fs";
import config =  require("./core/config");
import chalk  from "chalk";
const STRINGS = require("./lib/db");
import {join} from "path";
const logger = MAIN_LOGGER.child({ })
logger.level = 'trace'
var commandHandler = new Map();


const GENERAL = STRINGS.general;

const useStore = !process.argv.includes('--no-store')
const doReplies = !process.argv.includes('--no-reply')
const sequelize = config.DATABASE;

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = useStore ? makeInMemoryStore({ logger }) : undefined
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
                conversation: 'hello'
            }
        }
    })

    store?.bind(sock.ev)

    // function to handle messages




    sock.ev.on('chats.set', item => console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`))
    sock.ev.on('messages.set', item => console.log(`recv ${item.messages.length} messages (is latest: ${item.isLatest})`))
    sock.ev.on('contacts.set', item => console.log(`recv ${item.contacts.length} contacts`))

    sock.ev.on('messages.upsert', async m => {


    })

    sock.ev.on('messages.update', m => console.log(m))
    sock.ev.on('message-receipt.update', m => console.log(m))
    sock.ev.on('presence.update', m => console.log(m))
    sock.ev.on('chats.update', m => console.log(m))
    sock.ev.on('contacts.upsert', m => console.log(m))

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
                await sequelize.authenticate( );
                console.log(chalk.greenBright.bold('[INFO] Connection has been established successfully.'));
            } catch (error) {
                console.error('[ERROR] Unable to connect to the database:', error);
            }
            console.log(chalk.yellowBright.bold("[INFO] Syncing Database..."));
            await sequelize.sync();
            console.log(chalk.greenBright.bold("[INFO] All models were synchronized successfully."));
            console.log(chalk.greenBright.bold("[INFO] Connected! Welcome to BotsApp"));
            await sock.sendMessage(
                sock.user.id,{
                    text : GENERAL.SUCCESSFUL_CONNECTION.format({
                        worktype: config.WORK_TYPE,
                    })
                }
            );

        }

        console.log('connection update', update)
    })
    // listen for when the auth credentials is updated
    sock.ev.on('creds.update', saveState)

    return sock
}

startSock()