FROM node:14-stretch

WORKDIR /

COPY package.json /newtonbot/package.json

WORKDIR /newtonbot
RUN yarn

COPY . /newtonbot
CMD [ "yarn", "start"]