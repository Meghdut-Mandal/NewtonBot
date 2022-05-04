const STRINGS = require("../lib/db");
const https = require("https");

var pornData = null // array of porn objects


module.exports = {
    name: "porn",
    description: STRINGS.porn.DESCRIPTION,
    extendedDescription: STRINGS.porn.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ['.porn']},
    async handle(client, chat, BotsApp, args) {
        await client.sendMessage(BotsApp.chatId,
            {
                text: STRINGS.porn.PROCESSING
            });

        // get the meme data
        async function getPornData() {
            if (!pornData) {
                await https.get("https://www.reddit.com/r/porn.json?sort=top&t=week&limit=60", res => {
                    let body = "";
                    res.on("data", data => {
                        body += data;
                    });
                    res.on("end", () => {
                        pornData = JSON.parse(body);
                        console.log("Porn Data loaded " + JSON.stringify(pornData));
                    });
                });
            }
        }

        await getPornData(); // get porn data from reddit

        const porn = pornData.data.children[Math.floor(Math.random() * pornData.data.children.length)].data;
        console.log(" The porn link is" + porn);

        // check if the meme is a video
        if (porn.is_video){
            client.sendMessage(BotsApp.chatId, {
                video: {
                    url: porn.url
                }
            });
        }else {
            client.sendMessage(BotsApp.chatId, {
                image: {
                    url: porn.url
                }
            });
        }

    }
}