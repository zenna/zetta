/**
 * @author Zenna Tavares
 */

var assessSpaceSlow = function(space) {
    var numInfons = space.getNumInfons();
    var infonsToUpdate = [], funcOutsToTest = [];
    for(var i = 0; i < numInfons; ++i) {
        var infon = space.getInfonFromId(i);
        if(inArray(infon.types, 'arg')) {
            infonsToUpdate.push(infon.id)
        }
        else if(inArray(infon.types, 'output')) {
            funcOutsToTest.push(infon.id)
        }
    }
    return assessSpace(space, infonsToUpdate, funcOutsToTest);
}

var assessSpace = function(space, infonsToUpdate, funcOutsToTest) {
    //Cool down
    var allArgs = updateInfonsFromDec(0, space, infonsToUpdate);
    var stable = stepUntilStable(space);
    var totalArgsLength = 0;

    for(var i = 0; i < allArgs.length; ++i) {
        totalArgsLength += allArgs[i].length;
    }

    // Exhaustively enumerate all combinations of input value
    var score = 0;
    for(var i = 0; i < Math.pow(2, totalArgsLength); ++i) {
        var allArgs = updateInfonsFromDec(i, space, infonsToUpdate);

        var stableStep = stepUntilStable(space);
        if(stableStep[0]) {
            for(var j = 0; j < funcOutsToTest.length; ++j) {
                var infon = space.getInfonFromId(funcOutsToTest[j]);
                score += infon.out(infon.getCurrentBody(), allArgs)[0];
            }
        }
    }
    return score;
}

// Randomly generate infons to recreate some function
var optimiseRandomly = function(argLengths, funcOuts, outLengths, infonSizeRange, infonCountRange, scoreGoal, successCallback) {
    zetta.log("optimising");
    var numTries = 1000;
    var winners = [];
    for(var attempt = 0; attempt < numTries; ++attempt) {
        var moon = new Space();
        var spaceT = createRandomSpaceWithFunc(argLengths, outLengths, funcOuts, getRandomElement(infonSizeRange), getRandomElement(infonCountRange), false);
        createRandomEdges(spaceT.space, 0.8, 0.8);
        var score = assessSpace(spaceT.space, spaceT.argIds, spaceT.outputIds);
        if(score >= scoreGoal) {
            zetta.log("winner");
            winners.push(spaceT.space);
            if(winners.length === 10) {
                successCallback(winners);
                return;
            }
        }
    }
    if(winners.length < 1) {
        setTimeout(optimiseRandomly, 100, argLengths, funcOuts, outLengths, infonSizeRange, infonCountRange, scoreGoal, successCallback);
    }
    else {
        successCallback(winners);
    }

}