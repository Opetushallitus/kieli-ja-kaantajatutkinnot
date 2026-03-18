FROM postgres:16.3-alpine
COPY *.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=yki
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
