FROM gcc:13-bookworm

RUN useradd -m -u 1001 sandbox

WORKDIR /code

USER sandbox

CMD ["./main"]
