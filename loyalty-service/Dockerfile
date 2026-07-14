FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY .mvn .mvn
COPY pom.xml ./
RUN mvn dependency:go-offline -B
COPY src src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8819
ENTRYPOINT ["java", "-jar", "app.jar"]
