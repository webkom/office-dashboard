# Build env
FROM node:16 as builder

RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN apt update && apt install --no-install-recommends -y libgif-dev
RUN rm -rf /var/lib/apt/lists/*
RUN yarn --ignore-scripts --silent
RUN npm install -g react-scripts@2.1.1 --silent

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
