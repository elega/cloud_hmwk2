# cloud_hmwk2

Yimin Wei: YW2907
Xing Lan: XL2523

Structure:

3 independent server in 2 EC2 machines.

The first machine (EC2 medium)
Zookeeper + Kafka
Producer Server (producer.js): Grabbing tweets and pushing to kafka
Worker Sever (consumer.js): Taking tweets from kafka and doing sentiment analysis then pushing to SNS (running in worker pool)

The second machine (EC2 free tier)
Backend Server: Pushing tweets into elastic search and notifing front end as long as it's notified by SNS.

Frontend interacts with backend by socket.io.
