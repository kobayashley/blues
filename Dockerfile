FROM node:14-alpine AS BUILDER

WORKDIR /tmp

COPY ./src          ./src
COPY ./package.json ./package.json
COPY tsconfig.json  ./
COPY yarn.lock      ./

RUN yarn install
RUN yarn build

FROM node:14-alpine

WORKDIR /app

COPY --from=BUILDER /tmp/dist ./dist
COPY --from=BUILDER /tmp/node_modules ./node_modules
COPY ./public ./public
COPY ./views  ./views

CMD ["node", "dist/App.js"]
