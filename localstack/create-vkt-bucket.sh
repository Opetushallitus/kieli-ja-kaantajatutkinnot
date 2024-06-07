#!/bin/bash

aws s3 mb s3://opintopolku-dev-vkt/ --profile localstack
aws s3api put-bucket-cors --bucket opintopolku-dev-vkt --cors-configuration file://cors.json --profile localstack
