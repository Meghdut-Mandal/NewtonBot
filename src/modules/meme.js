const STRINGS = require("../lib/db");
const https = require("https");

var memeData = null // array of meme objects


module.exports = {
    name: "meme",
    description: STRINGS.meme.DESCRIPTION,
    extendedDescription: STRINGS.meme.EXTENDED_DESCRIPTION,
    demo: {isEnabled: true, text: ['.meme ']},
    async handle(client, chat, BotsApp, args) {
        await client.sendMessage(BotsApp.chatId,
            {
                text: STRINGS.meme.PROCESSING
            });

        // get the meme data
        async function getMemeData() {
            if (!memeData) {
                await https.get("https://www.reddit.com/r/dankmemes.json?sort=top&t=week&limit=60", res => {
                    let body = "";
                    res.on("data", data => {
                        body += data;
                    });
                    res.on("end", () => {
                        memeData = JSON.parse(body);
                        console.log("Meme Data loaded " + JSON.stringify(memeData));
                    });
                });
            }
        }

        await getMemeData(); // get meme data from reddit

        const meme = memeData.data.children[Math.floor(Math.random() * memeData.data.children.length)].data;
        console.log(" The meme link is" + meme);

        // check if the meme is a video
        if (meme.is_video){
            client.sendMessage(BotsApp.chatId, {
                video: {
                    url: meme.url
                }
            });
        }else {
            client.sendMessage(BotsApp.chatId, {
                image: {
                    url: meme.url
                }
            });
        }

    }
}