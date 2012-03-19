/**
 * @author Zenna Tavares
 */

var findAnd = function() {
    var funcArgLengths = [1, 1];
    var funcOutLengths = 1;

    var andOut = function(myValue, args) {
        return myValue[0] === (args[1][0] ^ args[0][0]) ? [1] : [0];
    }

    var winners = optimiseRandomly(funcArgLengths, [andOut], [funcOutLengths], range(1, 4), range(1, 6));
    a = winners;
    console.log("drawing winners")
    for(var i = 0; i < winners.length; ++i) {
        var canvas = new spaceDraw(winners[i], '#candidates');

        canvas.update();
    }
}

var findNegation = function() {
    var negateArgLength = 1;
    var funcOutLengths = 1

    var negateOut = function(myValue, args) {
        return myValue[0] === 1 - args[0][0] ? [1] : [0];
    }

    var winners = optimiseRandomly([negateArgLength], [negateOut], [funcOutLengths], range(1, 4), range(1, 4));
    a = winners;
    console.log("drawing winners")
    for(var i = 0; i < winners.length; ++i) {
        var canvas = new spaceDraw(winners[i], '#candidates');

        canvas.update();
    }
}