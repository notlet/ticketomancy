FROM node:20

WORKDIR /tickets

COPY package*.json yarn.lock ./
RUN yarn install
COPY . .

LABEL org.opencontainers.image.source=https://github.com/notlet/ticketomancy
LABEL org.opencontainers.image.description="simple single-server-oriented tickets bot for discord"
LABEL org.opencontainers.image.licenses=MIT

EXPOSE 3000
ENTRYPOINT ["yarn", "start"]