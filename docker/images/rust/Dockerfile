FROM rust:1.77-slim-bookworm

RUN useradd -m -u 1001 sandbox

WORKDIR /code

USER sandbox

CMD ["./main"]
