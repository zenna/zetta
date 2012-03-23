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

// TODO: 1. try out new infon models
// TODO: 2. develop interface for infons/jsChurch/link to 'world'
// TODO 3. allow higher order functions in RlProgram Model
// TODO 4. Implement sparse sampling in actual i) jsChurch and possibly other MoCs
// TODO: Figure out scoring of models
// TODO: 5. Figure out interface with zetta
// TODO: Separate out jquery/dom stuff from RL
// TODO: Figure out learning in other infon models
// TODO: figure out link model

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
};

var doLearningInnerLoop = function(time, observedData, stateHolder, domain, sampleAction, selectModel, numSamples, depth, discount, stateQueries) {
    console.log("new Round, time = " + time);
    var state = stateHolder.state;
    var currentModel = selectModel(observedData, 10, stateQueries);
    var bestAction = sparseSampleMcmc(depth, numSamples, discount, currentModel, state, sampleAction, stateQueries);
    var newStateReward = domain.executeAction(bestAction, stateQueries);
    observedData.push(bestAction, newStateReward[1], newStateReward[0]);
    stateHolder.state = newStateReward[0];
};

var doLearningLoops = function(time, observedData, state, domain, sampleAction, selectModel, numSamples, depth, discount, stateQueries) {
    stateHolder = {};
    stateHolder.state = state;
    while(stateQueries['canContinue']['codeAsFunction'](time, stateHolder.state) === true) {
        setTimeout(doLearningInnerLoop, 1000, time, observedData, stateHolder, domain, sampleAction, selectModel, numSamples, depth, discount, stateQueries);
        time += 1;
    }
    return state;
};