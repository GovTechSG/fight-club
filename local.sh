
sudo docker network create --driver bridge lotc-net

echo "Starting redis..."
sudo docker run -d \
    --network=lotc-net \
    --network-alias=lotc-redis \
    --restart=unless-stopped \
    -p 6379:6379 \
    --name=lotc-redis \
    redis:latest
echo "Redis started!!"

VAR_NODECOUNT=1
VAR_CURRNODE=1
while [ $VAR_CURRNODE -le $((VAR_NODECOUNT)) ]
do
    echo "Stopping and Removing dc-node$VAR_CURRNODE..."
    sudo docker stop dc-node$VAR_CURRNODE
    sudo docker rm dc-node$VAR_CURRNODE
    echo "Stopping and Removing gm-node$VAR_CURRNODE..."
    sudo docker stop gm-node$VAR_CURRNODE
    sudo docker rm gm-node$VAR_CURRNODE
    echo "Done"
    VAR_CURRNODE=$((VAR_CURRNODE+1))
done

sudo docker rmi fight-club:latest

sudo docker build -f Dockerfile -t fight-club:latest .

VAR_CURRNODE=2
while [ $VAR_CURRNODE -le $((VAR_NODECOUNT)) ]
do
    echo "Starting gm-node$VAR_CURRNODE..."
    sudo docker run -d \
            -e "NODE_ENV=localhost" \
            -e "GAME_SERVER_OPTS_SERVER_TYPE=gamemaster" \
            -e "GAME_DAMAGE_CONTROLLER_PROTOCOL=http" \
            -e "GAME_DAMAGE_CONTROLLER_HOST=dc-haproxy" \
            -e "GAME_DAMAGE_CONTROLLER_PORT=8082" \
            -e "REDIS_URI=redis://lotc-redis:6379" \
            -e "REDIS_DB_INDEX=1" \
            --network=lotc-net \
            --network-alias=gm-node$VAR_CURRNODE \
            --restart=unless-stopped \
            --name gm-node$VAR_CURRNODE \
            fight-club:latest
    echo "Starting dc-node$VAR_CURRNODE..."
    sudo docker run -d \
            -e "NODE_ENV=localhost" \
            -e "REDIS_URI=redis://lotc-redis:6379" \
            -e "REDIS_DB_INDEX=1" \
            -e "GAME_SERVER_OPTS_SERVER_TYPE=damagecontroller" \
            -e "HIT_POINT=0.1" \
            --network=lotc-net \
            --network-alias=dc-node$VAR_CURRNODE \
            --restart=unless-stopped \
            --name dc-node$VAR_CURRNODE \
            fight-club:latest
    VAR_CURRNODE=$((VAR_CURRNODE+1))
    echo "Done"
done

pushd haproxy

    sudo docker stop dc-haproxy
    sudo docker stop gm-haproxy

    sudo docker rm dc-haproxy
    sudo docker rm gm-haproxy

    sudo docker rmi dc-haproxy:latest
    sudo docker rmi gm-haproxy:latest

    sudo docker build -f Dockerfile.dc -t dc-haproxy:latest .
    sudo docker run -d \
        --network=lotc-net \
        --restart=unless-stopped \
        --name=dc-haproxy \
        -p 8082:8082 \
        dc-haproxy:latest

    sudo docker build -f Dockerfile.gm -t gm-haproxy:latest .
    sudo docker run -d \
        --network=lotc-net \
        --restart=unless-stopped \
        --name=gm-haproxy \
        -p 8081:8081 \
        gm-haproxy:latest

popd