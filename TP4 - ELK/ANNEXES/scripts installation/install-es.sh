#!/bin/bash
echo "######################"
echo "### Downloading ES ###"
echo "######################"

wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.10.1-linux-x86_64.tar.gz    
tar -xvzf elasticsearch-8.10.1-linux-x86_64.tar.gz
mv elasticsearch-8.10.1 elasticsearch
rm -f elasticsearch-8.10.1-linux-x86_64.tar.gz

echo "############################"
echo "### Downloading Logstash ###"
echo "############################"

wget https://artifacts.elastic.co/downloads/logstash/logstash-8.10.1-linux-x86_64.tar.gz
tar -xvzf logstash-8.10.1-linux-x86_64.tar.gz
mv logstash-8.10.1 logstash
mkdir logstash/conf
touch logstash/conf/csvload.conf
rm -f logstash-8.10.1-linux-x86_64.tar.gz

echo "############################"
echo "### Downloading Kibana ###"
echo "############################"

wget https://artifacts.elastic.co/downloads/kibana/kibana-8.10.1-linux-x86_64.tar.gz
tar -xvzf kibana-8.10.1-linux-x86_64.tar.gz
mv kibana-8.10.1 kibana
rm -f kibana-8.10.1-linux-x86_64.tar.gz

echo "######################"
echo "### Configuring ES ###"
echo "######################"

sed -i -e 's/#cluster.name: my-application/cluster.name: but3-tp/g' elasticsearch/config/elasticsearch.yml
echo "OK"

echo "###########################"
echo "### Downloading Cerebro ###"
echo "###########################"

wget "https://github.com/lmenezes/cerebro/releases/download/v0.9.4/cerebro-0.9.4.zip"
unzip cerebro-0.9.4.zip
mv cerebro-0.9.4 cerebro
rm -f cerebro-0.9.4.zip
echo "OK"

echo "Install successful !"
