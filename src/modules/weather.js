const { MessageType, Mimetype } = require("@adiwajshing/baileys");
const inputSanitization = require("../sidekick/input-sanitization");
const https = require("https");
const config = require("../core/config");
const apiKey = config.WEATHER_API_KEY;
const Strings = require("../lib/db");
const WEATHER = Strings.weather;

module.exports = {
    name: "weather",
    description: WEATHER.DESCRIPTION,
    extendedDescription: WEATHER.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".weather New Delhi",
            ".weather New Delhi tomorrow",
            ".weather New Delhi tom",
        ],
    },
    async handle(client, chat, BotsApp, args) {
        let cityName;
        let downloading;
        try {
            const weatherTypes = {
                sunny: "sunny",
                clear: "clear",
                cloud: "cloud",
                overcast: "overcast",
                rain: "rain",
                drizzle: "drizzle",
                snow: "snow",
                storm: "storm",
                fog: "fog",
                haze: "haze",
                mist: "mist",
            };

            async function result(imageUrl, weatherDataVariables, downloading) {
                await client.sendMessage(
                    BotsApp.chatId,
                    {
                        image: {url: imageUrl} ,
                        text :  WEATHER.WEATHER_DATA.format(weatherDataVariables)
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                // delete the downloaded file
                // await client.deleteMessage(BotsApp.chatId, {
                //     id: downloading.key.id,
                //     remoteJid: BotsApp.chatId,
                //     fromMe: true,
                // });
            }
            if (args.length < 1) {
                client.sendMessage(
                    BotsApp.chatId,
                    {
                        text: WEATHER.CITY_NAME_REQUIRED,
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));

            } else if (
                args[args.length - 1] === "tom" ||
                args[args.length - 1] === "tomorrow"
            ) {
                downloading = await client.sendMessage(
                    BotsApp.chatId,{
                        text : WEATHER.DOWNLOADING
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                args[args.length - 1] = "";
                cityName = args.join(" ");
                const unit = "metric";

                const url =
                    "https://api.openweathermap.org/data/2.5/forecast?q=" +
                    cityName +
                    "&appid=" +
                    apiKey +
                    "&units=" +
                    unit +
                    "&cnt=" +
                    8;

                https.get(url, function (response) {
                    response.on("error", (err) => {
                        throw err;
                    });
                    response.on("data", function (data) {
                        const stringData = data.toLocaleString();
                        let imageName;
                        try {
                            const weatherData = JSON.parse(stringData);
                            // check if the city isnt found
                            if (weatherData.cod === "404") {
                                client.sendMessage(
                                    BotsApp.chatId,
                                    {
                                        text: WEATHER.NOT_FOUND,
                                    }
                                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                                return;
                            }
                            const tempInC = Number(
                                weatherData.list[7].main.temp
                            ).toFixed(2);
                            const tempInF = (tempInC * 1.8 + 32).toFixed(2);
                            const minTempInC = Number(
                                weatherData.list[7].main.temp_min
                            ).toFixed(2);
                            const minTempInF = (minTempInC * 1.8 + 32).toFixed(
                                2
                            );
                            const maxTempInC = Number(
                                weatherData.list[7].main.temp_max
                            ).toFixed(2);
                            const maxTempInF = (maxTempInC * 1.8 + 32).toFixed(
                                2
                            );

                            const humidity = Number(
                                weatherData.list[7].main.humidity
                            ).toFixed(2);

                            const windSpeedInkmph = (
                                Number(weatherData.list[7].wind.speed) * 3.6
                            ).toFixed(2);
                            const windSpeedInmph = (
                                windSpeedInkmph * 0.621371
                            ).toFixed(2);
                            const windDegree =
                                weatherData.list[7].wind.deg.toFixed(2);

                            const sunriseTimeStamp = Number(
                                weatherData.city.sunrise
                            );
                            var sunriseDate = new Date(sunriseTimeStamp);
                            const sunriseTime =
                                sunriseDate.getHours() +
                                ":" +
                                sunriseDate.getMinutes() +
                                ":" +
                                sunriseDate.getSeconds();
                            const sunsetTimeStamp = Number(
                                weatherData.city.sunset
                            );
                            var sunsetDate = new Date(sunsetTimeStamp);
                            const sunsetTime =
                                sunsetDate.getHours() +
                                ":" +
                                sunsetDate.getMinutes() +
                                ":" +
                                sunsetDate.getSeconds();

                            let weatherDescription =
                                weatherData.list[7].weather[0].description;

                            for (const type in weatherTypes) {
                                if (
                                    weatherDescription.includes(
                                        weatherTypes[type]
                                    )
                                ) {
                                    imageName = weatherTypes[type];
                                    break;
                                } else {
                                    imageName = "fallback";
                                }
                            }
                            weatherDescription =
                                weatherDescription.toUpperCase();
                            cityName = weatherData.city.name;
                            const country = weatherData.city.country;
                            const timeOfRequest = weatherData.list[7].dt * 1000;
                            var date = new Date(timeOfRequest);

                            const dateAndTime =
                                date.getDate() +
                                "/" +
                                (date.getMonth() + 1) +
                                "/" +
                                date.getFullYear() +
                                " " +
                                date.getHours() +
                                ":" +
                                date.getMinutes() +
                                ":" +
                                date.getSeconds();
                            const weatherDataVariables = {
                                tempInC: tempInC,
                                tempInF: tempInF,
                                minTempInC: minTempInC,
                                minTempInF: minTempInF,
                                maxTempInC: maxTempInC,
                                maxTempInF,
                                maxTempInF,
                                humidity: humidity,
                                windSpeedInkmph: windSpeedInkmph,
                                windSpeedInmph: windSpeedInmph,
                                degree: windDegree,
                                sunriseTime: sunriseTime,
                                sunsetTime: sunsetTime,
                                weatherDescription: weatherDescription,
                                cityName: cityName,
                                country: country,
                                dateAndTime: dateAndTime,
                            };

                            const imageUrl =
                                "https://raw.githubusercontent.com/Prince-Mendiratta/BotsApp-Resources/main/weather/" +
                                imageName +
                                ".jpg";
                            result(imageUrl, weatherDataVariables, downloading);
                        } catch (err) {
                            // delete the message if there is an error
                            // client.deleteMessage(BotsApp.chatId, {
                            //     id: downloading.key.id,
                            //     remoteJid: BotsApp.chatId,
                            //     fromMe: true,
                            // });
                            inputSanitization.handleError(
                                err,
                                client,
                                BotsApp,
                                WEATHER.ERROR_OCCURED
                            );

                            return;
                        }
                    });
                });
                return;
            } else {
                downloading = await client.sendMessage(
                    BotsApp.chatId, {
                        text: WEATHER.DOWNLOADING
                    }
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                cityName = args.join(" ");
                const unit = "metric";

                const url =
                    "https://api.openweathermap.org/data/2.5/weather?q=" +
                    cityName +
                    "&appid=" +
                    apiKey +
                    "&units=" +
                    unit;

                https.get(url, function (response) {
                    response.on("error", (err) => {
                        throw err;
                    });
                    response.on("data", function (data) {
                        try {
                            const weatherData = JSON.parse(data);

                            if (weatherData.cod === "404") {
                                client.sendMessage(
                                    BotsApp.chatId, {
                                        text: WEATHER.CITY_NOT_FOUND
                                    }
                                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                                return;
                            }

                            const tempInC = Number(
                                weatherData.main.temp
                            ).toFixed(2);
                            const tempInF = (tempInC * 1.8 + 32).toFixed(2);
                            const minTempInC = Number(
                                weatherData.main.temp_min
                            ).toFixed(2);
                            const minTempInF = (minTempInC * 1.8 + 32).toFixed(
                                2
                            );
                            const maxTempInC = Number(
                                weatherData.main.temp_max
                            ).toFixed(2);
                            const maxTempInF = (maxTempInC * 1.8 + 32).toFixed(
                                2
                            );
                            const humidity = Number(
                                weatherData.main.humidity
                            ).toFixed(2);
                            const windSpeedInkmph = (
                                Number(weatherData.wind.speed) * 3.6
                            ).toFixed(2);
                            const windSpeedInmph = (
                                windSpeedInkmph * 0.621371
                            ).toFixed(2);
                            const windDegree = weatherData.wind.deg.toFixed(2);
                            const sunriseTimeStamp = Number(
                                weatherData.sys.sunrise
                            );
                            var sunriseDate = new Date(sunriseTimeStamp);
                            const sunriseTime =
                                sunriseDate.getHours() +
                                ":" +
                                sunriseDate.getMinutes() +
                                ":" +
                                sunriseDate.getSeconds();
                            const sunsetTimeStamp = Number(
                                weatherData.sys.sunset
                            );
                            var sunsetDate = new Date(sunsetTimeStamp);
                            const sunsetTime =
                                sunsetDate.getHours() +
                                ":" +
                                sunsetDate.getMinutes() +
                                ":" +
                                sunsetDate.getSeconds();
                            var weatherDescription =
                                weatherData.weather[0].description;

                            for (var type in weatherTypes) {
                                if (
                                    weatherDescription.includes(
                                        weatherTypes[type]
                                    )
                                ) {
                                    imageName = weatherTypes[type];
                                    break;
                                } else {
                                    imageName = "fallback";
                                }
                            }
                            weatherDescription =
                                weatherDescription.toUpperCase();
                            cityName = weatherData.name;
                            const country = weatherData.sys.country;
                            const timeOfRequest = weatherData.dt * 1000;
                            var date = new Date(timeOfRequest);

                            const dateAndTime =
                                date.getDate() +
                                "/" +
                                (date.getMonth() + 1) +
                                "/" +
                                date.getFullYear() +
                                " " +
                                date.getHours() +
                                ":" +
                                date.getMinutes() +
                                ":" +
                                date.getSeconds();
                            const weatherDataVariables = {
                                tempInC: tempInC,
                                tempInF: tempInF,
                                minTempInC: minTempInC,
                                minTempInF: minTempInF,
                                maxTempInC: maxTempInC,
                                maxTempInF,
                                maxTempInF,
                                humidity: humidity,
                                windSpeedInkmph: windSpeedInkmph,
                                windSpeedInmph: windSpeedInmph,
                                degree: windDegree,
                                sunriseTime: sunriseTime,
                                sunsetTime: sunsetTime,
                                weatherDescription: weatherDescription,
                                cityName: cityName,
                                country: country,
                                dateAndTime: dateAndTime,
                            };
                            const imageUrl =
                                "https://raw.githubusercontent.com/Prince-Mendiratta/BotsApp-Resources/main/weather/" +
                                imageName +
                                ".jpg";

                            result(imageUrl, weatherDataVariables, downloading);
                        } catch (err) {
                            console.log(err);
                            // client.deleteMessage(BotsApp.chatId, {
                            //     id: downloading.key.id,
                            //     remoteJid: BotsApp.chatId,
                            //     fromMe: true,
                            // });
                            inputSanitization.handleError(
                                err,
                                client,
                                BotsApp,
                                WEATHER.ERROR_OCCURED
                            );
                            return;
                        }
                    });
                });
                return;
            }
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                BotsApp,
                WEATHER.ERROR_OCCURED
            );
        }
    },
};
