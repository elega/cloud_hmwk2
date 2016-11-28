var workerpool = require('workerpool');
var kafka = require('kafka-node');
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.Client;
var topic =  'twit';

var client = new Client('localhost:2181');
var latest_log;

var offset = new Offset(client);

var pool = workerpool.pool();

var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: '*',
  secretAccessKey: '*',
  region: 'us-east-1'
});

var sns = new AWS.SNS();
// var sns=require('./sns.js');





function tackle_new_tweet(tweet)
{
  var message=tweet.text;



var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
  api_key: '*'
});

  var alchemy_parameters = {
    text: message
  };

alchemy_language.emotion(alchemy_parameters, function (err, response) {
  if (err)
    console.log('emotion analysis error');
  else
  {
//    var rsp_obj = JSON.stringify(response, null, 2);
    tweet.emotion=response.docEmotions;
    var AWS = require('aws-sdk');
    AWS.config.update({
      accessKeyId: '*',
      secretAccessKey: '*',
      region: 'us-east-1'
    });
    var sns = new AWS.SNS();
    var publishParams = { 
      TopicArn : "arn:aws:sns:us-east-1:462504581059:tweet_alchemy",
      Message: JSON.stringify(tweet), 
    };
    console.log(tweet);
    sns.publish(publishParams, function(err, data) {
      if (err) {
        console.log(err.stack);
        return "failed";
      }
      console.log('push sent');
    });      
  }
});


//  console.log(sns);
//  return "succeeded";
/*
  var sns = new AWS.SNS();

  var publishParams = { 
    TopicArn : "arn:aws:sns:us-east-1:462504581059:tweet_alchemy",
    Message: message, 
  };
  sns.publish(publishParams, function(err, data) {
    if (err) {
      console.log(err.stack);
      return "failed";
    }
    console.log('push sent');
  });
  return "succeeded";
*/
}




offset.fetch([
    { topic: topic,time:-1, maxNum: 1   }
], function (err, data) {
    latest_log=data.twit[0][0]; //only fetch the latest data
    console.log("latest log: ",latest_log);
    var topics = [
        {topic: topic, partition: 0, offset:latest_log}
    ];
    var options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024, fromOffset:true };

    var consumer = new Consumer(client, topics, options);


consumer.on('message', function (message) {
  var tweet=JSON.parse(message.value);
 // console.log(message.value);
  
pool.exec(tackle_new_tweet, [tweet])
    .then(function (result) {
//      console.log('result', result); 
//      pool.clear(); // clear all workers when done
    });

});

consumer.on('error', function (err) {
  console.log('error', err);
});


consumer.on('offsetOutOfRange', function (topic) {
  topic.maxNum = 2;
  offset.fetch([topic], function (err, offsets) {
    if (err) {
      return console.error(err);
    }
    var min = Math.min(offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});



});












