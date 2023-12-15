FROM postgres:12.17
COPY *.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=postgres
ENV POSTGRES_PASSWORD=postgres