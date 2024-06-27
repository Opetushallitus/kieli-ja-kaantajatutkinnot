#!/bin/bash

aws --endpoint-url=http://localhost:4566 s3 mb s3://opintopolku-dev-vkt/ --profile localstack
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors --bucket opintopolku-dev-vkt --cors-configuration file://cors.json --profile localstack
