var maxInList = function(list) {
    return Math.max.apply(Math.max, list);
};

var sparseSample = function(depth, numSamples, discount, model, state, possibleActions, stateQueries) {
    var qStar = estimateQ(depth, numSamples, discount, model, state, possibleActions, stateQueries);
    var bestQStar = maxInList(qStar);    // console.log(qStar);
    var bestActionIndex = qStar.indexOf(bestQStar);
    //bestActionIndex = weightedExpSample(qStar);
    return possibleActions[bestActionIndex];
};

var estimateV = function(depth, numSamples, discount, model, state, possibleActions, stateQueries) {
    var qStar = estimateQ(depth, numSamples, discount, model, state, possibleActions, stateQueries);
    return maxInList(qStar);
};

var estimateQ = function(depth, numSamples, discount, model, state, possibleActions, stateQueries) {
    if(depth === 0) {
        return [0];
    } else {
        return possibleActions.map(function(action) {
            return sumRewards(numSamples, numSamples, depth, discount, model, state, action, possibleActions, stateQueries) / numSamples;
        });

    }
};

var sumRewards = function(sampleNum, numSamples, depth, discount, model, state, action, possibleActions, stateQueries) {
    if(sampleNum === 0) {
        return 0;
    } else {
        var stateReward = model(state, action, stateQueries);
        return stateReward[1] + discount * estimateV(depth - 1, numSamples, discount, model, stateReward[0], possibleActions, stateQueries) + sumRewards(sampleNum - 1, numSamples, depth, discount, model, state, action, possibleActions, stateQueries);
    }
};



// Samples traces in simulation space into future
var sparseSampleMcmc = function(depth, numSamples, discount, model, state, sampleAction, stateQueries) {
    var actionReward = traceUpdate(depth, state, model, sampleAction, stateQueries);
    var sampledActions = [actionReward[0]];
    var sampledRewards = [[actionReward[1]]];
    for(var i = 0; i < numSamples; ++i) {
        var randomErp = pickRandomProperty(database);
        var dbParams = database[randomErp];
        var proposal = getProposal(dbParams['type']);
        var newErpValue = proposal(dbParams);
        var oldErpValue = dbParams['value'];
        dbParams['value'] = newErpValue;
        var newActionReward = traceUpdate(depth, state, model, sampleAction, stateQueries);
        
        var indexInSampledActions = indexInListOfArrays(sampledActions,newActionReward[0]);
        if (indexInSampledActions === -1) {
        	sampledActions.push(newActionReward[0]);
        	sampledRewards[sampledActions.length-1] = [newActionReward[1]];
        }
        else {
        	sampledRewards[indexInSampledActions].push(newActionReward[1]);
        }

        if (newActionReward[1] > actionReward[1]) {
        	totalBetter += 1;
        }
        
        totalTotal += 1;

        var loga = newActionReward[1] - actionReward[1];
        var loga2 = 0;
        //r - f;
        if(Math.log(Math.random()) < loga + loga2) {
            totalAccepted += 1;
            actionReward = newActionReward;
        } else {
            dbParams['value'] = oldErpValue;
            totalRejected += 1;
        }
    }
    if (sampledActions.length !== sampledRewards.length) {
    	throw "mismatch in action/reward length";
    }
    
    var meanSampledRewards = [];
    for (var i=0; i<sampledRewards.length; ++i) {
    	meanSampledRewards[i] = sum(sampledRewards[i]) / sampledRewards[i].length;
    }

    var bestQStar = maxInList(meanSampledRewards);
    var bestActionIndex = meanSampledRewards.indexOf(bestQStar);
    // var bestActionIndex = weig	htedSample(meanSampledRewards);
    return sampledActions[bestActionIndex];
};

// Simulates model depth steps into future
var traceUpdate = function(depth, state, model, sampleAction, stateQueries) {
    var totalReward = 0.0;
    var firstAction;
    for(var i = 0; i < depth; ++i) {
    	database = {};
        var action = sampleAction(state);
        if(i == 0) {
            firstAction = action;
        }
        var newStateReward = model(state, action, stateQueries);
        state = newStateReward[0];
        totalReward += newStateReward[1];
    }
    ii = 0;
    return [firstAction, totalReward];
};