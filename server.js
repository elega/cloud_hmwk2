var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var router = express.Router();
var request = require('request');
var path = require('path');
var es_client = require('./es_client.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);


es_client.connect();

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(router);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//app.engine('html',ejs.__express);
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//app.use(express.static('public'));



router.post('/callback', function (req, res) {

    var chunks = [];
    req.on('data', function (chunk) {
        chunks.push(chunk);
    });
    req.on('end', function () {   
        var message = JSON.parse(chunks.join(''));
        var topicArn = message.TopicArn;
        if (message.Type=='SubscriptionConfirmation')
        {
            var url=message.SubscribeURL;
            request(url, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log(body) 
              }
            })
        }
        else
        { 
          var msg = message.Message;
          console.log(msg);
          var new_tweet =JSON.parse(msg);
          es_client.insert_tweet(new_tweet);
        }
    });
    res.end();

});

router.get('/', function (req, res) {

  res.render('index', { title: 'twittmap' });

});

  var timer = setInterval(myTimer, 5000);
  function myTimer() {
    console.log('send socket');
    io.on('connection', function (socket) {
      socket.emit('newmarker', { hello: 'world' });
    });
  };  

router.get('/subscribe', function (req, res) {
  res.send('Subscribe Topic');

  var AWS = require('aws-sdk');


  AWS.config.update({
    accessKeyId: '*',
    secretAccessKey: '*',
    region: 'us-east-1'
  });

  var sns = new AWS.SNS();

  var subscribe_params = {
    Protocol: 'http', /* required */
    TopicArn: 'arn:aws:sns:us-east-1:462504581059:tweet_alchemy', /* required */
    Endpoint: '*'
  };

  sns.subscribe(subscribe_params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{     console.log(data);           // successful response

    }
  });

});


router.get("/ajax"  ,function(req, res) {

      var keyword =  req.query.keyword
      var dist = parseFloat(req.query.dist)
      var lon = parseFloat(req.query.log)
      var lat = parseFloat(req.query.lat)

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, {"Content-Type": "text/plain"});
      es_client.search_tweet(keyword,dist,lon,lat,res);
    
});



http.listen(3000, function(){
    console.log('listening on *:3000');
});

