FROM node:20

WORKDIR /tickets

COPY package*.json yarn.lock ./
RUN yarn install
COPY . .

CMD ["yarn", "start"]