FROM postgres:16.3-alpine
COPY *.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=postgres
ENV POSTGRES_PASSWORD=postgres