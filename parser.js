/*function parserKey(dic){
    for (i = 0; i < dic.length)
}

exports.parserKey = parserKey;*/

function parserEntities(dic){
    var entities = [];
    for(i = 0; i < dic.length; i++){
        var act = dic[i];
        if(act.type == "Location")
            entities.push(act.text);
    }
    return entities;
}

function parserVerbs(dic){
    var verbs = [];
    for(i = 0; i < dic.length; i++){
        var act = dic[i].action.verb;
        verbs.push(act.text);
    }
    return verbs;
}

function parserWords(dic){
    var keys = [];
    for(i = 0; i < dic.length; i++){
        var act = dic[i];
        keys.push(act.text);
    }
    return keys;
}

exports.parserEntities=parserEntities;
exports.parserVerbs=parserVerbs;
exports.parserWords=parserWords;