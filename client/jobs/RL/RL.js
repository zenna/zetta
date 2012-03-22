// TODO" account for complete functions - solution, take care of this in action sampler
// TODO: fix naming system
// TODO: generalise statefulIf
// TODO: Work out likelihood estimation - EASY for first implementation, HARD in general
// TODO: Reuse program at each step - EASY
// TODO: Prevent recursiveness or put time guards on these programs - MEDIUM
// TODO: allow first class functions
// TODO: Investigate guaranteed halting recursive schemes (e.g. primitive recursion, typed)
// TODO: Investigate giving partial credit to non halting programs (e.g. functional reactive programming)
// TODO: Make action sampling under modification
// TODO: Change number to float and int, add parse int, parse float
// TODO: Implement lambarise, replaceNode, deleteNode,
// TODO: add random primitives
// TODO: The problem is that I have a tree, possibily infite.  And of that tree I have a path.
// I also have a method of generating paths/.
// frequentist approach would be to find number of times data appears
// Basically I have to find the region of this tree which is closed over by my model

// Problem is havent worke dout likelihood estimation, acceptance ratio is far too high, action can be put down


var selectRlProgramModel = function(observedData, numSamples, stateQueries) {
    if ($('#buildModel').is(':checked') === false) {
    	    return testModel;
    }
    var time = 0;
    // Sparse Sampling Params
    var programNumSamples = 5;
    var depth = 7;
    var discount = 1.5;

    var programStateQueries = {
        canContinue : {
            modifyable : false,
            placable : false,
            typeSig : [['number', 'state'], 'bool'],
            codeAsFunction : function(time, state) {
                return time < 10 ? true : false;
            }

        },
        addBoundNode : {
            modifyable : false,
            placable : false,
            typeSig : [['number', 'state'], 'bool'],
            codeAsFunction : function(program, child, parentFunc, parentPropertyTrace, availableSlotPos) {
                return addBoundNode(program, child, parentFunc, parentPropertyTrace, availableSlotPos);
            }

        },
        doNothing : {
            modifyable : false,
            placable : false,
            typeSig : [['number', 'state'], 'bool'],
            codeAsFunction : function() {
                return;
            }

        }
    }

    var newState = doLearning(time, [], new Program(observedData, stateQueries), new programWorld(new Program(observedData, stateQueries)), sampleProgramAction, selectPosteriorModel, programNumSamples, depth, discount, programStateQueries);
    $('#canvas').empty();
    newState.draw();
    var model = newState.compileAll();
    return model;
}

var doLearning = function(time, observedData, state, domain, sampleAction, selectModel, numSamples, depth, discount, stateQueries) {
    if(stateQueries['canContinue']['codeAsFunction'](time, state) === true) {
        console.log("New Round");
        var currentModel = selectModel(observedData, 10, stateQueries);
        // TODO: These args not relevant for selectRLProgramModel?
        var bestAction = sparseSampleMcmc(depth, numSamples, discount, currentModel, state, sampleAction, stateQueries);
        var newStateReward = domain.executeAction(bestAction, stateQueries);
        observedData.push(bestAction, newStateReward[1], newStateReward[0]);
        console.log(time);
        return doLearning(time + 1, observedData, newStateReward[0], domain, sampleAction, selectModel, numSamples, depth, discount, stateQueries);
    }
    else {
        console.log("Game Over");
        return state;
    }
}

var doLearningInnerLoop = function(time, observedData, stateHolder, domain, sampleAction, selectModel, numSamples, depth, discount, stateQueries) {
    console.log("new Round, time = " + time);
    var state = stateHolder.state;
    var currentModel = selectModel(observedData, 10, stateQueries);
    var bestAction = sparseSampleMcmc(depth, numSamples, discount, currentModel, state, sampleAction, stateQueries);
    var newStateReward = domain.executeAction(bestAction, stateQueries);
    observedData.push(bestAction, newStateReward[1], newStateReward[0]);
    stateHolder.state = newStateReward[0];
}

var doLearningLoops = function(time, observedData, state, domain, sampleAction, selectModel, numSamples, depth, discount, stateQueries) {
    stateHolder = {};
    stateHolder.state = state;
    while(stateQueries['canContinue']['codeAsFunction'](time, stateHolder.state) === true) {
        setTimeout(doLearningInnerLoop, 1000, time, observedData, stateHolder, domain, sampleAction, selectModel, numSamples, depth, discount, stateQueries);
        time += 1;
    }
    return state;
}


$(document).ready(function() {
    $('#go').click(function() {
        console.log("Starting RL");
        var numIterations = 5;
        var time = 0;
        // Sparse Sampling Params
        var numSamples = 200;
        var depth = 200;
        var discount = 1.5;

        // Domain params
        var sizeX = $("#boardSize").val();
        var sizeY = $("#boardSize").val();
 		var startPosX = 7;
 		var startPosY = 7;
        // var startPosX = sizeX % 0;
        // var startPosY = sizeY % 0;
        var stateQueries = {
            'canContinue' : {
                modifyable : false,
                placable : false,
                typeSig : [['number', 'state'], 'bool'],
                codeAsFunction : function(time, state) {
                    return time < 10000 ? true : false;
                }

            },
            'moveUp' : {
                modifyable : true,
                placable : false,
                typeSig : [['state'], 'state'],
                codeAsTree : {
                    returnNode : [null]
                }
            },
            'moveDown' : {
                modifyable : true,
                placable : false,
                typeSig : [['state'], 'state'],
                codeAsTree : {
                    returnNode : [null]
                }
            },
            'moveLeft' : {
                modifyable : true,
                placable : false,
                typeSig : [['state'], 'state'],
                codeAsTree : {
                    returnNode : [null]
                }
            },
            'moveRight' : {
                modifyable : true,
                placable : false,
                typeSig : [['state'], 'state'],
                codeAsTree : {
                    returnNode : [null]
                }
            },
            'getAgentX' : {
                modifyable : false,
                typeSig : [['state'], 'number'],
                codeAsFunction : function(state) {
                    return state[2];
                }

            },
            'getAgentY' : {
                modifyable : false,
                typeSig : [['state'], 'number'],
                codeAsFunction : function(state) {
                    return state[3];
                }

            },
            'getWorldX' : {
                modifyable : false,
                typeSig : [['state'], 'number'],
                codeAsFunction : function(state) {
                    return state[0];
                }

            },
            getWorldY : {
                modifyable : false,
                typeSig : [['state'], 'number'],
                codeAsFunction : function(state) {
                    return state[1];
                }

            },
            setPosX : {
                modifyable : false,
                typeSig : [['state', 'number'], 'state'],
                codeAsFunction : function(state, xPosition) {
                    var newState = jQuery.extend(true, {}, state);
                    newState[2] = xPosition;
                    return newState;
                }

            },
            setPosY : {
                modifyable : false,
                typeSig : [['state', 'number'], 'state'],
                codeAsFunction : function(state, xPosition) {
                    var newState = jQuery.extend(true, {}, state);
                    newState[3] = xPosition;
                    return newState;
                }

            }
        };
        sampleAction = function(state) {
            var possibleActions = ["moveUp", "moveDown", "moveLeft", "moveRight", "dontMove"];
            return [stGetRandomElement(possibleActions), []];
        }

        var initialState = createInitialState(sizeX, sizeY, startPosX, startPosY);
        var observedData = [initialState];
        doLearningLoops(time, observedData, initialState, new perimeterWorld(initialState), sampleAction, selectRlProgramModel, numSamples, depth, discount, stateQueries);
    })

})