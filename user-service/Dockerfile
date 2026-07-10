FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY .mvn .mvn
COPY pom.xml ./
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8811
ENTRYPOINT ["java", "-jar", "app.jar"]
