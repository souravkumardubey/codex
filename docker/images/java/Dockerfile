FROM eclipse-temurin:21-jdk

RUN useradd -m -u 1001 sandbox

WORKDIR /code

USER sandbox

CMD ["java", "-cp", "/code", "Main"]
