FROM node:24-alpine
WORKDIR /backend
RUN npm i -g pnpm
COPY package*.json .
RUN pnpm install
COPY . .
EXPOSE 5050
CMD [ "pnpm","run","dev","--","--host","0.0.0.0" ]