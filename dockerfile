FROM node:10 as base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base as compilation
RUN npm ci
COPY . .
RUN npm run compile-prod

FROM compilation as release
COPY --from=compilation /usr/src/app/dist /usr/src/app/public ./
RUN npm ci --only=production
EXPOSE 3000
CMD [ "npm", "start" ]

