/**
 * @author Zenna Tavares
 */
$('document').ready(function() {
    zetta = {
        log : function(x) {
            console.log(x);
        }

    };
    var drawWinners = function(winners) {
        for(var i = 0; i < winners.length; ++i) {
            simulateAndDrawSpace(winners[i]);
        }
        gwinners = winners;
    }

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
    // findConcat(drawWinners);
    // findAddOne(drawWinners);
    findIdentity(4, drawWinners);

    //
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
});
