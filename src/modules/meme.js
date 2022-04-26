const STRINGS = require("../lib/db");
const https = require("https");

module.exports = {
    name: "meme",
    description: STRINGS.meme.DESCRIPTION,
    extendedDescription: STRINGS.meme.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ['.meme ']},
    async handle(client, chat, BotsApp, args) {
        const proccessing = await client.sendMessage(BotsApp.chatId,
            {
                text: STRINGS.meme.PROCESSING
            });

        // Get the meme
        await https.get("https://www.reddit.com/r/dankmemes.json?sort=top&t=week&limit=60", res => {
            let body = "";
            res.on("data", data => {
                body += data;
            });
            res.on("end", () => {
                const json = JSON.parse(body);
                const meme = json.data.children[Math.floor(Math.random() * json.data.children.length)].data.url;
                console.log(" The meme link is"+meme);
                client.sendMessage(BotsApp.chatId, {
                    image: {
                        url: meme
                    }
                });
            });
        });
    }
}