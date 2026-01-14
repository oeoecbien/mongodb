#!/bin/bash
echo "###############################"
echo "### Launching ES  & Cerebro ###"
echo "###############################"

if [ ! -f elasticsearch/bin/elasticsearch ]; then
    echo "Elasticsearch not found!"
    exit 1
fi

if [ ! -f cerebro/bin/cerebro ]; then
    echo "Cerebro not found!"
    exit 1
fi

rm -f pids.pid
elasticsearch/bin/elasticsearch --quiet & >> elasticlogs.log
ELASTIC_PID=$!

cerebro/bin/cerebro & >> cerebrologs.log
CEREBRO_PID=$!

echo "ELASTIC_PID=$ELASTIC_PID" >> pids.pid
echo "CEREBRO_PID=$CEREBRO_PID" >> pids.pid