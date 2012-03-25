/**
 * @author Zenna Tavares
 */
var findFunc = function(argLengths, outputFuncs, outputLengths, infonSize, infonCount, scoreGoal, successCallback) {
    scoreGoal = Math.pow(2, sumArray(argLengths));
    optimiseRandomly(argLengths, outputFuncs, outputLengths, infonSize, infonCount, scoreGoal, successCallback);
}

var findAnd = function(successCallback) {
    var funcArgLengths = [1, 1];
    var funcOutLengths = 1;
    score = 4;
    var andOut = function(myValue, args) {
        return myValue[0] === (args[1][0] ^ args[0][0]) ? [1] : [0];
    }

    var a = new Infon([0]);
    a.types.push('arg');
    var b = new Infon([0]);
    b.types.push('arg');
    var c = new Infon([0]);
    var d = new Infon([0]);
    d.types.push('output');
    d.out = andOut;
    var space = new Space();
    space.addInfon(a);
    space.addInfon(b);
    space.addInfon(c);
    space.addInfon(d);
    space.addEdge(b, b, 'apply');

    space.addEdge(b, a, 'apply');
    space.addEdge(c, b, 'apply');
    space.addEdge(c, b, 'apply');

    addVirtualEdge(space, d, c, function(length) {
        return [1, 0]
    });

    // simulateAndDrawSpace(space);
    console.log(assessSpaceSlow(space));
    var winners = optimiseRandomly(funcArgLengths, [andOut], [funcOutLengths], range(1, 4), range(1, 9), score, successCallback);
};

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
    var winners = optimiseRandomly([negateArgLength], [negateOut], [funcOutLengths], range(3, 4), range(3, 4), score);
}

var findConcat = function(successCallback) {
    var negateArgLength = 2;
    var funcOutLengths = 2;

    var negateOut = function(myValue, args) {
        var concated = args[0].concat(args[1]);
        if(bitStringToDec(concated) === bitStringToDec(myValue)) {
            return [1];
        }
        else {
            return [0];
        }
    }

    score = 4;
    optimiseRandomly([1, 1], [negateOut], [2], range(1, 4), range(0, 4), score,successCallback);
}

var findNot = function(successCallback) {
    var argLengths = [1];
    var outputLengths = [1];
    var scoreGoal = Math.pow(2, sumArray(argLengths));

    var fitnessFunc = function(myValue, args) {
        return myValue[0] === 1 - args[0][0] ? [1] : [0];
    }

    optimiseRandomly(argLengths, [fitnessFunc], outputLengths, range(1, 5), range(0, 5), scoreGoal, successCallback);
}