<p align="center">
  <img src="images/NewtonBot_Logo.svg" height="250px"/>
</p>

> > Your Automated Personal Assistant, on WhatsApp!
---

NewtonBot is an optimized and easy-to-use WhatsApp UserBot written in Node.js.

Utilize your personal chat assistant/group manager to make the most out of WhatsApp.   

## Simple Installation ( Windows ) 

````
Clone the repository

Get it in your pc and open the respository folder

Open the Terminal from address bar by typing cmd.

Press enter and open the cmd

Type The following Commands and Press Enter: 

npm install yarn

yarn install

yarn start

````

Now , Scan QR code from WhatsApp Mobile.

You can now easily use the bot commands in your whatsapp mobile. 

For example type .weather CityName to get the bot message about the current weather status of CityName.


Some pictures for reference


![image](https://user-images.githubusercontent.com/88205668/166149808-50700590-c52c-4c6a-a5b6-9ad4a2e33001.png)

![image](https://user-images.githubusercontent.com/88205668/166149863-1b2345d7-0b41-4d98-aee5-0a275d2a4ddf.png)


## Documentation

This bot currently supports Whatsapp Multi Device. And is a Migration from the legacy [Whataspp Web Bot](https://github.com/BotsAppOfficial/BotsApp).

### Using Docker locally

To follow this method, you will need to have docker installed on your machine and have some experience using docker.

To host the bot on your own device using docker, follow the following steps on your terminal / command prompt -

```bash
git clone https://github.com/Meghdut-Mandal/NewtonBot.git
cd NewtonBot
docker build -t botsapp .
docker run -d -–restart=always --name botsapp botsapp
```

This will create a container running NewtonBot. You'll have to scan the QR at least once.

### The GNU/Linux Legacy Way

To use this method, you will need ffmpeg, nodejs, npm installed on your device.

To run the bot on your device manually, you can use the following commands -

```bash
git clone https://github.com/Meghdut-Mandal/NewtonBot.git
cd NewtonBot
yarn install
yarn start
## scan the QR code
```



## Support and Discussion groups

Feel free to post your queries or concerns on any of the discussion forums mentioned below:



## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/Meghdut-Mandal"><img src="https://avatars.githubusercontent.com/u/39855414?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Meghdut Mandal</b></sub></a><br /><sub><i>Project Lead Developer</i></sub></td>
 </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->


## Inspiration

- Baileys Library

- Yusuf Usta 

- [X-tra-Telegram](https://github.com/Prince-Mendiratta/X-tra-Telegram)

## Copyright & License
- Copyright (C) 2021 - 2022 by [NewtonBot](https://github.com/Meghdut-Mandal/NewtonBot)

- Licensed under the terms by [GNU GENERAL PUBLIC LICENSE](https://github.com/Meghdut-Mandal/NewtonBot/blob/master/LICENSE)

## Legal
This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by WhatsApp or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk.
