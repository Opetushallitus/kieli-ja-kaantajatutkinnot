FROM postgres:12.9
COPY *.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=postgres
ENV POSTGRES_PASSWORD=postgres