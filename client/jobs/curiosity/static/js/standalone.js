"use strict"
$(document).ready(function() {
    var initialRules = {
        attraction : {
            'ball2' : ['ball3', 'ball4'],
        },
        joint : {
            4 : [2]
        }
    }
    var myNewSim = new Simulation(640, 480, 'cssPhysics', 'c1', 'body', undefined, initialRules);
    myNewSim.run();
});