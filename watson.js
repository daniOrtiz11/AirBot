var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
  'username': "b8773c63-2d40-4449-96eb-5b077028323c",
  'password': "8a7Wr1i6VGEs",
  'version': '2018-03-16'
});
var keywords;


function getKeyWatson(conversation){
    var parameters = {
  'text': conversation,
  'features': {
    'entities': {
      'emotion': true,
      'sentiment': true,
      'limit': 2
    },
    'keywords': {
      'emotion': true,
      'sentiment': true,
      'limit': 2
    }
  }
}
var resul = "";
natural_language_understanding.analyze(parameters, function(err, response) {
  if (err)
    console.log('error:', err);
  else{
    //to parser like string
    //keywords = JSON.stringify(response, null, 2);
      keywords = response;
  }
});
   
}

function getKeys(){
    //console.log(keywords);
    return keywords;
}

exports.getKeys=getKeys;
exports.keywords=keywords;
exports.getKeyWatson=getKeyWatson;