#!/bin/bash


echo "creating hive services"
mkdir /var/log/hive
cp ./systemd/* /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload

echo "installing updater"
(cd /root/ && git clone https://github.com/apitronics/Hive-Updater.git)
mv /root/Hive-Updater /root/.Hive-Updater/
/root/.Hive-Updater/util/install.sh
(cd /root/.Hive-Updater/ && npm install)

cp Settings.default.js ../Settings.js

echo "initializing database"
(node /root/Hive/install.js)

echo "launching services"
(/root/Hive/start.sh)
