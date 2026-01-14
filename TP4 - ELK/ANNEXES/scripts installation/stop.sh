#!/bin/bash
echo "###############################"
echo "### Stopping ES  & Cerebro  ###"
echo "###############################"

source pids.pid
if [ -z "$ELASTIC_PID" ]; then
    echo "ELASTIC_PID not found, you could have to kill it manually"
fi

if [ -z "$CEREBRO_PID" ]; then
    echo "ELASTIC_PID not found, you could have to kill it manually"
fi

kill $ELASTIC_PID
kill $CEREBRO_PID