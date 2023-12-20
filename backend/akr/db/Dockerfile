FROM postgres:12.17-alpine
COPY *.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=postgres
ENV POSTGRES_PASSWORD=postgres