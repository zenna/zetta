// Shall we stop moving?
var canContinue = function(time, state) {
    return time < 1000 ? true : false;
}

var getAgentPosition = function(state) {
    return [state[2], state[3]];
}

var getWorldSize = function(state) {
    return [state[0], state[1]];
}

// Agent is outside board bounds
var isInvalidPos = function(position, worldSize) {
    if(position[0] >= worldSize[0] || position[1] >= worldSize[0] || position[0] < 0 || position[1] < 0) {
        return true;
    }
    else {
        return false;
    }
}

// Is the agent on the perimiter of the world
var isOnPerimeter = function(position, worldSize) {
    if(position[0] % (worldSize[0] - 1) === 0 || position[1] % (worldSize[1] - 1) === 0) {
        return true;
    }
    else {
        return false;
    }
}

// (Arbitrary) relatively more complex reward model
var isMod3 = function(position, worldSize) {
    if(parseInt((position[0] + 1) / (position[1] + 1)) === 1 || parseInt((position[0] + 1) * 46) % 3 === 1) {
        return true;
    }
    else {
        return false;
    }
}

// Generate new state (4-tuple) from x,y positions and old state
var updateStatePosition = function(oldState, position) {
    return [oldState[0], oldState[1], position[0], position[1]];
}

// So let's say we plonk into the program, the current action
// Connected to it would be the state, stateQueries and any arguments
var moveRight = function(agenetPosition) {
    return agentPosition + 1;
}

// Test model (This is what we want to learn)
var testModel = function(state, action, stateQueries) {
    var worldSize = getWorldSize(state);
    var agentPosition = getAgentPosition(state);
    var newAgentPosition = [agentPosition[0], agentPosition[1]];
    // var newState = action.apply[actionParams];

    switch(action[0]) {
        case "moveRight":
            newAgentPosition[0] = newAgentPosition[0] + 1;
            break;

        case "moveLeft":
            newAgentPosition[0] = newAgentPosition[0] - 1;
            break;

        case "moveUp":
            newAgentPosition[1] = newAgentPosition[1] + 1;
            break;

        case "moveDown":
            newAgentPosition[1] = newAgentPosition[1] - 1;
            break;

        case "dontMove":
            break;
    }

    if(isInvalidPos(newAgentPosition, worldSize) === true) {
        return [state, 0.0];
    }
    else {
    	var x = (newAgentPosition[0] / (state[0] - 1) * 10) - 5;
    	var y = (newAgentPosition[1] / (state[1] - 1) * 10) - 5;
    	var reward = 20 + x*x - Math.cos(2*Math.PI*x) + y*y - Math.cos(2*Math.PI*y);
    	reward *= -1;
        return [updateStatePosition(state, newAgentPosition), reward];
    }
    // else if(isMod3(newAgentPosition, worldSize) === true) {
        // // return [updateStatePosition(state, newAgentPosition), Math.random()];
        // return [updateStatePosition(state, newAgentPosition), 100 *(10 * newAgentPosition[0] / (1 + newAgentPosition[1]))];
        // // return [updateStatePosition(state, newAgentPosition), 1];
    // }
    // else {
        // return [updateStatePosition(state, newAgentPosition), 0.0];
    // }
}

var createInitialState = function(sizeX, sizeY, startPosX, startPosY) {
    return [sizeX, sizeY, startPosX, startPosY];
}

// Stateful 'real' world
var perimeterWorld = function(initialState) {
    this.state = initialState;
    var canvas = document.getElementById("board");
    var squareSize = 1;
    canvas.width = squareSize * this.state[0];
    canvas.height = squareSize * this.state[1];
    this.ctx = canvas.getContext("2d");
    this.ctx.width = squareSize * this.state[0];
    this.ctx.height = squareSize * this.state[1];
    this.colorMap = new cliques.ColorMap();
    // this.colorMap.mapType = 'reds';

    //Left motion
    this.executeAction = function(action, stateQueries) {
        var stateReward = testModel(this.state, action, stateQueries);
        this.drawBoard(this.state, stateQueries);
        this.state = stateReward[0];
        return stateReward;
    }


    this.drawBoard = function(state, stateQueries) {
        if(this.isDrawBoardInitialised !== true) {
            for(var i = 0; i < state[0]; ++i) {
                for(var j = 0; j < state[1]; ++j) {
                    var stateToRight = updateStatePosition(state, [i + 1, j]);
                    var reward = testModel(stateToRight, ["moveLeft", []], stateQueries)[1];
                    this.colorMap.scaler.updateExtrema(reward)
                }
            }
            for(var i = 0; i < state[0]; ++i) {
                for(var j = 0; j < state[1]; ++j) {
                    var stateToRight = updateStatePosition(state, [i + 1, j]);
                    var reward = testModel(stateToRight, ["moveLeft", []], stateQueries)[1];
                    var rgb = this.colorMap.mapColor(this.colorMap.scaler.scaleValue(reward));
                    var rgb = rgb.map(function(color){return parseInt(color*255);});
                    //var red = (i*j) % 255;
                    this.ctx.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";

                    var posX = i * squareSize;
                    var posY = j * squareSize;
                    this.ctx.fillRect(posX, posY, squareSize, squareSize);
                    this.isDrawBoardInitialised = true;
                }
            }
        }
        this.ctx.fillStyle = "rgb(255,255,255)";
        var posX = state[2] * squareSize;
        var posY = state[3] * squareSize;
        this.ctx.fillRect(posX, posY, squareSize, squareSize);
    }

}

//
// var sampleAction = function() {
// 	return getRandomElement([moveUp, moveDown, moveLeft, moveRight], flip);
// 	// var randIndex = Math.floor(Math.rand() * 4);
// 	// return ['moveUp','moveDown','moveLeft','moveRight'][randIndex];
// }