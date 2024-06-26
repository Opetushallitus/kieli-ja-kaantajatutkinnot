# Localstack

Localstack is used to mock AWS services, making it possible to iterate on the design and setup of AWS resources locally before requesting the appropriate resources, permission etc. to be set up on the actual AWS accounts.

To make use of localstack, a bit of configuration work is needed upfront.

## AWS CLI configuration

First, create a new profile to use with AWS CLI.
Add the following group to your AWS CLI configuration (default: ~/.aws/config):

```
[profile localstack]
region = us-east-1
output = json
endpoint_url = http://localhost:4566
```

Next, setup credentials for the AWS CLI (default: ~/.aws/credentials):

```
[localstack]
aws_access_key_id=test
aws_secret_access_key=test
```

## Usage

Use docker-compose to start localstack. Create whatever resources are needed by the application.
Note that the free community edition of localstack does not support persisting any changes between restarts of the service.

For instance, with VKT you'll need to do the following to ensure everything is setup for local development:

```bash
docker-compose -f ../docker-compose-vkt.yml up -d localstack
./create-vkt-bucket.sh
```