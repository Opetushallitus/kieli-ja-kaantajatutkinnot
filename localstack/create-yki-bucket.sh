#!/bin/bash

aws --endpoint-url=http://localhost:4566 s3 mb s3://opintopolku-dev-yki/ --profile localstack
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors --bucket opintopolku-dev-yki --cors-configuration file://cors-yki.json --profile localstack
