var kafka = require('kafka-node');
var Producer = kafka.Producer;
var KeyedMessage = kafka.KeyedMessage;
var Client = kafka.Client;
var client = new Client('localhost:2181');
var topic =  'twit';
var p = 0;
var a = 0;
var producer = new Producer(client, { requireAcks: 1 });



var config = require('./oauth.js')

var Twit = require('twit')
//Twitter
var T = new Twit({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret
})

var worldwide = [ '-180', '-90', '180', '90' ]

var stream = T.stream('statuses/filter',
 {track:["2016","Trump","Hillary","Job","NBA","News","Jobs","LOL","USA"],location:worldwide,language:'en' });






producer.on('ready', function () {
//producer.createTopics([topic], true, function (err, data) {});


stream.on('tweet', function(tweet) {
//   console.log(tweet.text);       
//   if (false)   
   if (tweet.place!=null)
     {
//       console.log(tweet.text);       

        var new_tweet = 
        {
            id : tweet.id, 
            user: {
              id: tweet.user.id,
              name: tweet.user.name
            },
            text: tweet.text,
            country : tweet.place.country_code,
            location: {
              lat: tweet.place.bounding_box.coordinates[0][0][1],
              lon: tweet.place.bounding_box.coordinates[0][0][0]
            }

        }        

        producer.send([
          { topic: topic, partition: p, messages: JSON.stringify(new_tweet), attributes: a }
        ], function (err, result) {
          console.log(err || result);
        });
 
     }
    
   });
   stream.on('limit', function (limitMessage) {
//  console.log("exceed limit");
   });



});

producer.on('error', function (err) {
  console.log('error', err);
});


