/**
 * @author Zenna Tavares
 */
paused = false;
$('document').ready(function() {
    // zetta = {
    // log : function(x) {
    // console.log(x);
    // }
    //
    // };
    // var drawWinners = function(winners) {
    // for(var i = 0; i < winners.length; ++i) {
    // simulateAndDrawSpace(winners[i]);
    // }
    // gwinners = winners;
    // }
    //
    // totalStable = 0;
    // totalUnstable = 0;
    // paused = false;
    // $("html").keypress(function(event) {
    // if(event.which == 112) {
    // event.preventDefault();
    // }
    // if(paused) {
    // paused = false;
    // console.log('unpausing');
    // }
    // else {
    // paused = true;
    // console.log('pausing');
    //
    // }
    // });
    //
    // var nand = new Space();
    // var a = new Infon([0]);
    // a.types.push('arg');
    // var b = new Infon([0]);
    // // findConcat(drawWinners);
    // // findAddOne(drawWinners);
    // findIdentity(4, drawWinners);
    //
    // //
    // var initialState = createInitialState(64, 64, 5, 5);
    // var world = new perimeterWorld(initialState);
    //
    // var observations = {
    // number : 4,
    // range : 2,
    // func : function(i) {
    // return function(state) {
    // var colour = state.getFitness(i, i);
    // return colour;
    // }
    //
    // }
    //
    // };
    //
    // var actions = {
    // range : 4,
    // };
    //
    // actions.func = (function(x) {
    // return function(bitString) {
    // var index = bitStringToDec(bitString);
    // var possibleActions = ["moveUp", "moveDown", "moveLeft", "moveRight",
    // "dontMove"];
    // var action = [possibleActions[index], []];
    // x.executeAction(action, null);
    // }
    //
    // })(world);
    //
    // var space = createRandomSpaceWithDomain([actions], [observations], 5, 10);
    // createRandomEdges(space, 0.5);
    // simulateAndDrawSpace(space);

    // Physical simulation ------------------------------------------------------
    var width = 640, height = 480;
    var initialState = getBaseExampleState(width, height);
    var initialRules = {
        attraction : {
            'ball2' : ['ball3', 'ball4'],
        },
        joint : {
            4 : [2]
        }
    }
    var simulation = new Simulation(width, height, 'cssPhysics', 'c1', 'body', initialState, initialRules);
    simulation.run()
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
    simulateAndDrawSpace(space, 300, 300);
});
