#!/bin/bash

# from https://medium.com/@slavakorolev/zero-downtime-deployment-with-docker-d9ef54e48c4

# alternative to this using traefik router - https://coderbook.com/@marcus/how-to-do-zero-downtime-deployments-of-docker-containers/

CONTAINER_NAME="cents_"

# lets find the first container
FIRST_NUM=`docker ps | awk '{print $NF}' | grep $CONTAINER_NAME | awk -F  "_" '{print $NF}' | sort | head -1`
NUM_OF_CONTAINERS=1
MAX_NUM_OF_CONTAINERS=2

# docker-compose build cents
docker-compose scale cents=$MAX_NUM_OF_CONTAINERS

# waiting for new containers
echo "Waiting to kill old containers... [TODO: what if new are not up yet?]"
#sleep 90

FOR_END_NUMBER=$((NUM_OF_CONTAINERS+FIRST_NUM))
# removing old containers
for ((i=$FIRST_NUM; i<$FOR_END_NUMBER; i++))
do
   docker stop $CONTAINER_NAME$i
   docker rm $CONTAINER_NAME$i
done

docker-compose scale cents=$NUM_OF_CONTAINERS

   