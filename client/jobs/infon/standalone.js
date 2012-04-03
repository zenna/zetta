/**
 * @author Zenna Tavares
 */
paused = false;
var drawWinners = function(winners) {
    for(var i = 0; i < winners.length; ++i) {
        simulateAndDrawSpace(winners[i], 250, 250);
    }
    gwinners = winners;
}

var linkInfonsToDomain = function() {
    var initialState = createInitialState(64, 64, 5, 5);
    var world = new perimeterWorld(initialState);
    var observations = {
        number : 4,
        range : 2,
        func : function(i) {
            return function(state) {
                var colour = state.getFitness(i, i);
                return colour;
            }

        }

    };

    var actions = {
        range : 4,
    };

    actions.func = (function(x) {
        return function(bitString) {
            var index = bitStringToDec(bitString);
            var possibleActions = ["moveUp", "moveDown", "moveLeft", "moveRight", "dontMove"];
            var action = [possibleActions[index], []];
            x.executeAction(action, null);
        }

    })(world);

    var space = createRandomSpaceWithDomain([actions], [observations], 5, 10);
    createRandomEdges(space, 0.5);
    simulateAndDrawSpace(space);
};

var linkInfonPhysicsWorld = function() {
    var width = 50, height = 50;
    var initialState = createInitialState(width, height, 4, range(1, 2));
    var initialRules = getInitialRules();
    var simulation = new Simulation(width, height, 'cssPhysics', 'c1', 'body', initialState, {});
    var observations = {
        number : width * height,
        range : 2,
        func : function(i) {
            return function(state) {
                var colour = state.getFitness(i, i);
                return colour;
            }

        }

    };

    // Create the required number of infons
    // Return a function with closure and attach it to space

    var dynamicBodies = simulation.getDynamicEntityIds();
    var actions = {
        range : dynamicBodies.length,
    };

    actions.func = (function(x) {
        return function(bitString) {
            var index = bitStringToDec(bitString);
            if(index < dynamicBodies.length) {
                x.moveBody(dynamicBodies[index]);
            }
        }

    })(simulation);

    var maxInfonSize = 10;
    var numInfons = 10;
    var space = createRandomSpaceWithDomain([actions], [observations], maxInfonSize, numInfons);
    createRandomEdges(space, 0.5, 0.5);
    simulation.run();
    // var canvas = new spaceDraw(space, '#candidates', 2000, 2000);
    // canvas.forceInit();
    // setTimeout(canvas.drawInit, 20000);
    // setTimeout(simulation.run, 200000);
    runSimulation(space);
    // simulateAndDrawSpace(space, 300, 300);
};

var findFunction = function(func) {
    totalStable = 0;
    totalUnstable = 0;
    paused = false;
    $("html").keypress(function(event) {
        if(event.which == 112) {
            event.preventDefault();
        }
        if(paused) {
            paused = false;
            console.log('unpausing');
        }
        else {
            paused = true;
            console.log('pausing');

        }
    });

    var nand = new Space();
    var a = new Infon([0]);
    a.types.push('arg');
    var b = new Infon([0]);
    func(drawWinners);
}


$('document').ready(function() {
    // linkInfonPhysicsWorld();
    optimiseSomething();
});
