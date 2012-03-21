/**
 * @author Zenna Tavares
 */
var findFunc = function(funcArgLengths, funcOutLengths, fitnessFuncs) {
    optimiseRandomly(funcArgLengths, fitnessFunc)
}

var findAnd = function() {
    var funcArgLengths = [1, 1];
    var funcOutLengths = 1;
    score = 4;
    var andOut = function(myValue, args) {
        return myValue[0] === (args[1][0] && args[0][0]) ? [1] : [0];
    }

    var winners = optimiseRandomly(funcArgLengths, [andOut], [funcOutLengths], range(1, 4), range(0, 4), score);
}

var findAddOne = function() {
    var negateArgLength = 2;
    var funcOutLengths = 2;

    var negateOut = function(myValue, args) {
        var added = incrementBitString(args[0]);
        if(bitStringToDec(added) === bitStringToDec(myValue[0])) {
            return [1];
        }
        else {
            return [0];
        }
    }
    score = 4;
    var winners = optimiseRandomly([negateArgLength], [negateOut], [funcOutLengths], range(1, 5), range(1, 5), score);
}

var findConcat = function() {
    var negateArgLength = 2;
    var funcOutLengths = 2;

    var negateOut = function(myValue, args) {
        var concated = args[0].concat(args[1]);
        if(bitStringToDec(concated) === bitStringToDec(myValue[0])) {
            return [1];
        }
        else {
            return [0];
        }
    }
    score = 4;
    optimiseRandomly([1, 1], [negateOut], [1], range(1, 5), range(1, 5), score);
}

var findNegation = function() {
    var negateArgLength = 1;
    var funcOutLengths = 1

    var negateOut = function(myValue, args) {
        return myValue[0] ===  args[0][0] ? [1] : [0];
    }

    score = 2;
    optimiseRandomly([negateArgLength], [negateOut], [funcOutLengths], range(1, 4), range(1, 4), score);
}

var drawWinners = function(winners) {
    for(var i = 0; i < winners.length; ++i) {
        var canvas = new spaceDraw(winners[i], '#candidates');
    }
}