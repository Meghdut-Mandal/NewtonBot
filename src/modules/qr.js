const inputSanitization = require("../sidekick/input-sanitization");
const Strings = require("../lib/db");
const QR = Strings.qr;

module.exports = {
  name: "qr",
  description: QR.DESCRIPTION,
  extendedDescription: QR.EXTENDED_DESCRIPTION,
  demo: { isEnabled: true, text: ".qr Hey, I am BotsApp." },
  async handle(client, chat, BotsApp, args) {
    try {
      if (args.length === 0 && !BotsApp.isReply) {
        await client
          .sendMessage(BotsApp.chatId,
              {
                text: QR.INVALID_INPUT
              })
          .catch((err) => inputSanitization.handleError(err, client, BotsApp));
        return;
      }


      let message;
      if (!BotsApp.isReply) {
        message = args.join(" ");
      } else {
        message = BotsApp.replyMessage;
      }
      // url encode the message
      message = encodeURIComponent(message);
      // create the qr code url
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${message}`;

      await client.sendMessage(
        BotsApp.chatId,
          {
            image : {url:qrCodeUrl},
            caption: QR.IMAGE_CAPTION,
            mimetype: "image/png"
          }).catch((err) =>
          inputSanitization.handleError(err, client, BotsApp)
        );

      // await client
      //   .deleteMessage(BotsApp.chatId, {
      //     id: processing.key.id,
      //     remoteJid: BotsApp.chatId,
      //     fromMe: true,
      //   })
      //   .catch((err) =>
      //     inputSanitization.handleError(err, client, BotsApp)
      //   );


    } catch (err) {
      await inputSanitization.handleError(err, client, BotsApp);
    }
  }
};
