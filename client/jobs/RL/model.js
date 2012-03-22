var selectPosteriorModel = function(observedData, numSamples, stateQueries) {
    return posteriorModel;
}

// Log length Prior
var computeLogPrior = function(program) {
    var alpha = 1;
    return -alpha * program.length;
}

var computeLogPosterior = function(program, observedData, numSamples) {
    var model = program.compileAll();
    var logPrior = computeLogPrior(program);
    var logLikelihood = computeLogLikelihood(model, observedData, numSamples);
    return logPrior + logLikelihood;
}

// Fix observedData

// Rewards model with actions from data
// Likelihood is measure of how close model reward and model states are with data
var computeLogLikelihood = function(model, observedData, numSamples) {
    return Math.log(0.5);
    var initialState = observedData[0];
    for(var i = 1; i < observedData.length; i=i+1) {
        for(var j = 0; j < numSamples; ++j) {
        	var newStateReward = model(currentState,observedData[i+1]);
            var rewardSimularity = computeRewardSimilarity(observedData[i+2], newStateReward[0]);
            var stateSimilarity = computeStateSimilarity(observedData[i+3], newStateReward[0]);
            
            currentState = observedData[i+3];
        }
    }
}

// Domain specific
var computeStateSimilarity = function(state1, state2) {
    var xDiff = state1[2] - state2[2];
    var yDiff = state1[3] - state2[3];
    var agentDist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

// Weird
var computeRewardSimilarity = function(reward1, reward2) {
    return Math.abs(reward1 - reward2);
}

// Log Posterior of probabilistic model is reward
posteriorModel = function(state, action, stateQueries) {
    // Copy program to avoid desctructiveness
    var newState = jQuery.extend(true, {}, state);
    stateQueries[action[0]]['codeAsFunction'].apply(stateQueries[action[0]]['codeAsFunction'], [newState].concat(action[1]));
    var numSamples = 1;
    var reward = computeLogPosterior(newState, newState.observedData, numSamples);
    return [newState, reward];
}

var programWorld = function(initialState) {
    this.state = initialState;

    this.executeAction = function(action, actionParams, stateQueries) {
        var stateReward = posteriorModel(this.state, action, actionParams, stateQueries);
        this.state = stateReward[0];
        return stateReward;
    }

}