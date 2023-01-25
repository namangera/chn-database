FROM node:lts-bullseye-slim

ENV NODE_ENV=development
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --development --silent

COPY . .

RUN npm i -g nodemon

VOLUME [ "/usr/src/app", "/usr/src/app/node_modules" ]
EXPOSE 8003
EXPOSE 9228

RUN chown -R node /usr/src/app
USER node

CMD ["npm", "run", "devstart"]
