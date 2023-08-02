FROM node:lts

WORKDIR /usr/src/cloudsume-website

COPY . ./
RUN npm install

STOPSIGNAL SIGINT

CMD node_modules/.bin/webpack serve --env docker
