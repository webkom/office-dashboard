FROM node:22-alpine as build

WORKDIR /app

COPY . .

RUN yarn --frozen-lockfile

RUN yarn build

FROM nginx:1-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/. /usr/share/nginx/html