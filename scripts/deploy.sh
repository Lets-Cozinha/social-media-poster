set -a
. ./.env
set +a

export AWS_PROFILE=$AWS_PROFILE

echo "Deploying Lets Cozinha Poster to production..."

docker build \
  -t $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/letscozinha-poster:latest .

aws ecr get-login-password \
  --region us-east-1 | docker login \
  --username AWS \
  --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/letscozinha-poster:latest

unset AWS_PROFILE

echo "Copy .env file to the server"

scp -i $SERVER_PEM_FILE .env $SERVER_DESTINATION:~/letscozinha-poster/.env

echo "Deploying Lets Cozinha Poster to production..."

ssh \
  -i $SERVER_PEM_FILE $SERVER_DESTINATION \
  "./letscozinha-poster/deploy.sh"

echo "Lets Cozinha Poster deployed successfully!"