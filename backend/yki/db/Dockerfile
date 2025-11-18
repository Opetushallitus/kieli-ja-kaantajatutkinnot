FROM postgres:16.3-alpine
COPY *.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=yki
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_USERNAME=admin
