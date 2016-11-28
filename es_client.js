var elasticsearch = require('elasticsearch');


var client 


exports.connect = function(){

client = require('elasticsearch').Client({
  hosts: 'search-twitt-map-db-w5h27iafbziaho2txcmqs6teei.us-east-1.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: 'us-east-1',
    accessKey: '*',
    secretKey: '*'
  } ,
  log :"trace"
}


);

var body = {
    geo_mapping:{
        properties:{
            location     : {"type" : "geo_point"}
        }
    }
}
//client.indices.putMapping({index:"emotion_tweet", type:"geo_mapping", body:body});
/*
  client = new elasticsearch.Client({
    host: 'localhost:9200',//,
    log : 'trace'
  });
  */
}

exports.insert_tweet = function(new_tweet){
     client.create(
       {
      index: 'emotion_tweet',
      type: 'geo_mapping',
      body: new_tweet
      });
}

exports.search_tweet = function(key_word,distance,lon,lat,ajax_respond){
  
  search = true;
  client.search({
    index: 'emotion_tweet',
    type: 'geo_mapping',
    size: 2000,
    body: {"query": {
      "bool": {
        "must": {
          "bool": {
            "must": [
              {
                "geo_distance": {
                  "location": {
                    lat:lon,
                    lon:lat}
                  ,
                  "distance": distance.toString() + "km"
                }
              },
              {
                "match": {
                  "text": key_word 
                }
              }
            ]
          }
        }
      }
      }
      }
  }).then(function (resp) {
      hits = resp.hits.hits;
      console.log("hits: "+ hits.length);
//      console.log(ajax_respond.toString());
      console.log("second break point");
      var array = [];
      for (var i = 0; i < resp.hits.hits.length; i++) {
           array[i] = hits[i]._source;
      }      
//      ajax_respond.json(array);      
//      ajax_respond.json({foo:"bar"});
      console.log("third break point");      
      console.log(array[0]);

      ajax_respond.end(JSON.stringify(array));
//      return hits.length.toString();

//      search=false;
      
  }, function (err) {
      console.trace(err.message);
  });  
//  while(search);
}

var tweets;


var a=1;