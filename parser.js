/*function parserKey(dic){
    for (i = 0; i < dic.length)
}

exports.parserKey = parserKey;*/
var verbs_to_reserve = ["book","reserve"];
var verbs_to_consult = ["consult","query","see"];

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

function parserFunction(verbs,entities){
    var action = -1;
    for(i = 0; i < verbs.length && action == -1; i++){
        var verbact = verbs[i];
        if(verbs_to_reserve.indexOf(verbact) != -1){
            action = 1;
        }else if(verbs_to_consult.indexOf(verbact) != -1){
			action = 2;
		}
    }
    return action;
}
exports.parserEntities=parserEntities;
exports.parserVerbs=parserVerbs;
exports.parserWords=parserWords;
exports.parserFunction=parserFunction;