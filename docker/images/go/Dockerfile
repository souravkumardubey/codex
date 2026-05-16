FROM golang:1.22-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

WORKDIR /code

USER sandbox

CMD ["go", "run", "/code/main.go"]
