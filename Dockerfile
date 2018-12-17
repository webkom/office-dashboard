# Build env
FROM node:10.14.2 as builder

RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN yarn --ignore-scripts --silent
run npm install -g react-scripts@2.1.1 --silent

ARG RELEASE
ENV NODE_ENV production
ENV RELEASE ${RELEASE}

COPY . /app
RUN yarn build

# Production env
FROM nginx:1.14.2-alpine
MAINTAINER Abakus Webkom <webkom@abakus.no>

COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]

