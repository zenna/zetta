// TODO: Paramterise physics rules
// Implement Pause
// Autostop after half time
// Continue on click
// Reset episode automagically

// Plan stuff


// This file handles the url mediated communication between mturk and the physics simulation
$(document).ready(function() {
    // Get from hash: unique user identifying code
    guid = "GLOBALLYUNIQUE";

    // Bind the event.

    $(window).bind('hashchange', function(event) {
        var hash_str = event.fragment;
        var params = jQuery.deparam(event.fragment);
        if('action' in params && params['action'] === 'start') {
            var initialRules = {
                attraction : {
                    'ball2' : ['ball3', 'ball4'],
                },
                joint : {
                    4 : [2]
                }
            }
            var newInitialState = [{
                id : "ground",
                x : 640 / 2 / SCALE,
                y : 480 / SCALE,
                halfHeight : 0.5,
                halfWidth : 640 / SCALE,
                color : 'yellow'
            }, {
                id : "ball1",
                x : 9,
                y : 2,
                radius : 0.5,
                color : 'black'
            }];
            myNewSim2 = new simulationInstance(640, 480, 'cssPhysics', 'c1', 'body', undefined, initialRules);
            myNewSim2.run();
        }
        
        if ('action' in params && params['action'] === 'stop') {
        	alert("stopping");
        }
        
        if ('guid' in params) {
        	guid = params['guid'];
        }
        //TODO: Take 1)physics 2)userid store locally
        // alert(location.hash);
    });

    // Trigger the event (useful on page load).
    // $(window).hashchange();
    logAction = function(action) {
        action.guid = guid;

        // Send action to database with username
        // console.log(action);
    };

});