FROM node:alpine as builder
WORKDIR /usr/app
COPY package.json ./
RUN yarn
COPY . .
RUN yarn run build

FROM nginx
EXPOSE 3000
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/app/build /usr/share/nginx/html
