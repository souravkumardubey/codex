FROM node:20-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox && \
    npm install -g ts-node@10.9.2 typescript@5.4.5

WORKDIR /code

USER sandbox

CMD ["node", "/code/main.js"]
