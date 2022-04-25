const { MessageType} = require("@adiwajshing/baileys");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const inputSanitization = require("../sidekick/input-sanitization");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM();
const {downloadContentFromMessage} = require("@adiwajshing/baileys");
const {writeFile} = require("fs/promises");
const Strings = require("../lib/db");
const STICKER = Strings.sticker;

module.exports = {
    name: "sticker",
    description: STICKER.DESCRIPTION,
    extendedDescription: STICKER.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client, chat, BotsApp, args) {
        let imageId;
        let replyChatObject;
// Task starts here
        var startTime = window.performance.now();
        try {
            // Function to convert media to sticker
            const convertToSticker = async (imageId, replyChat) => {
                const downloading = await client.sendMessage(
                    BotsApp.chatId,
                    {
                        text: STICKER.DOWNLOADING,
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));

                const fileName = "./tmp/convert_to_sticker-" + imageId;
                const stream = await downloadContentFromMessage(replyChat.message.imageMessage,'image')
                    .catch(err => inputSanitization.handleError(err, client, BotsApp));

                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                // save to file
                await writeFile(fileName, buffer)


                const stickerPath = "./tmp/st-" + imageId + ".webp";
                if (BotsApp.type === "image" || BotsApp.isReplyImage) {
                    ffmpeg(fileName)
                        .outputOptions(["-y", "-vcodec libwebp"])
                        .videoFilters(
                            "scale=2000:2000:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=2000:2000:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1"
                        )
                        .save(stickerPath)
                        .on("end", async () => {
                            await client.sendMessage(
                                BotsApp.chatId,{
                                    sticker :  fs.readFileSync(stickerPath)
                                }
                            ).catch(err => inputSanitization.handleError(err, client, BotsApp));

                            // inputSanitization.deleteFiles(
                            //     filePath,
                            //     stickerPath
                            // );
                            await inputSanitization.performanceTime(startTime);
                            // delete processing message
                            // await client.deleteMessage(BotsApp.chatId, {
                            //     id: downloading.key.id,
                            //     remoteJid: BotsApp.chatId,
                            //     fromMe: true,
                            // }).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        })
                        .on('error', async(err) => {
                            await inputSanitization.handleError(err, client, BotsApp)
                            // delete downloading message
                            // await client.deleteMessage(BotsApp.chatId, {
                            //     id: downloading.key.id,
                            //     remoteJid: BotsApp.chatId,
                            //     fromMe: true,
                            // }).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        });
                    return;
                }
                ffmpeg(fileName)
                    .duration(8)
                    .outputOptions([
                        "-y",
                        "-vcodec libwebp",
                        "-lossless 1",
                        "-qscale 1",
                        "-preset default",
                        "-loop 0",
                        "-an",
                        "-vsync 0",
                        "-s 600x600",
                    ])
                    .videoFilters(
                        "scale=600:600:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1"
                    )
                    .save(stickerPath)
                    .on("end", async (err) => {
                        await client.sendMessage(
                            BotsApp.chatId,
                            {
                                sticker :  fs.readFileSync(stickerPath)
                            }
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        // inputSanitization.deleteFiles(filePath, stickerPath);
                        await inputSanitization.performanceTime(startTime);
                        // delete processing message
                        // await client.deleteMessage(BotsApp.chatId, {
                        //     id: downloading.key.id,
                        //     remoteJid: BotsApp.chatId,
                        //     fromMe: true,
                        // }).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    })
                    .on('error', async(err) => {
                        await inputSanitization.handleError(err, client, BotsApp)
                        // delete downloading message
                        // await client.deleteMessage(BotsApp.chatId, {
                        //     id: downloading.key.id,
                        //     remoteJid: BotsApp.chatId,
                        //     fromMe: true,
                        // }).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    });
                return;
            };

            // User sends media message along with command in caption
            if (BotsApp.isImage || BotsApp.isGIF || BotsApp.isVideo) {
                replyChatObject = {
                    message: chat.message,
                };
                imageId = chat.key.id;
                await convertToSticker(imageId, replyChatObject);
            }
            // Replied to an image , gif or video
            else if (
                BotsApp.isReplyImage ||
                BotsApp.isReplyGIF ||
                BotsApp.isReplyVideo
            ) {
                replyChatObject = {
                    message:
                    chat.message.extendedTextMessage.contextInfo
                        .quotedMessage,
                };
                imageId = chat.message.extendedTextMessage.contextInfo.stanzaId;
                await convertToSticker(imageId, replyChatObject);
            } else {
                client.sendMessage(
                    BotsApp.chatId,{
                        text : STICKER.TAG_A_VALID_MEDIA_MESSAGE
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                await inputSanitization.performanceTime(startTime);
            }
            return;
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                BotsApp,
                STICKER.TAG_A_VALID_MEDIA_MESSAGE
            );
        }
    },
};
