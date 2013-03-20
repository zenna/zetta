var Simulation = function(width, height, domClass, domId, domParent, initialState, initialRules) {
    var width = typeof width === "undefined" ? 640 : width;
    var height = typeof height === "undefined" ? 480 : height;
    var domId = typeof domId === "undefined" ? "sim" + parseInt(Math.random() * 1000) : domId;
    var domParent = typeof domParent === "undefined" ? "body" : domParent;
    var domClass = typeof domClass === "undefined" ? "simulationBox" : domClass;

    var simDomElement = $("<canvas id='" + domId + "' width='" + width + "' height='" + height + "' class='" + domClass + "'></canvas>')");
    $(domParent).append(simDomElement);

    var time = 0;

    var world = {};
    var bodiesState = null;
    var box = null;

    var canvas = simDomElement[0];
    var ctx = canvas.getContext("2d");
    var canvasWidth = ctx.canvas.width;
    var canvasHeight = ctx.canvas.height;

    var initialState = typeof initialState === "undefined" ? [{
        id : "ground",
        x : ctx.canvas.width / 2 / SCALE,
        y : ctx.canvas.height / SCALE,
        halfHeight : 0.5,
        halfWidth : ctx.canvas.width / SCALE,
        color : 'yellow'
    }, {
        id : "ground2",
        x : ctx.canvas.width / 2 / SCALE,
        y : 0,
        halfHeight : 0.5,
        halfWidth : ctx.canvas.width / SCALE,
        color : 'blue',
        dynamic : false
    }, {
        id : "ground3",
        x : 0,
        y : ctx.canvas.height / 2 / SCALE,
        halfHeight : ctx.canvas.height / 2 / SCALE,
        halfWidth : 0.5,
        color : 'blue',
        dynamic : false
    }, {
        id : "ground4",
        x : ctx.canvas.width / SCALE,
        y : ctx.canvas.height / 2 / SCALE,
        halfHeight : ctx.canvas.height / 2 / SCALE,
        halfWidth : 0.5,
        color : 'blue',
        dynamic : false
    }, {
        id : "ball1",
        x : 9,
        y : 2,
        radius : 0.5
    }, {
        id : "ball2",
        x : 11,
        y : 4,
        radius : 0.5,
        color: 'red'
    }, {
        id : "ball3",
        x : 10,
        y : 10,
        radius : 2,
        color:'green'
    }, {
        id : "ball4",
        x : 10,
        y : 10,
        radius : 1,
        color : 'grey'
    }, {
        id : "ball5",
        x : 10,
        y : 10,
        radius : 1,
        color : 'purple'
    }] : initialState;

    var init = function() {
        for(var i = 0; i < initialState.length; i++) {
            world[initialState[i].id] = Entity.build(initialState[i]);
        }
        box = new bTest(60, false, canvasWidth, canvasHeight, SCALE);
        box.setBodies(world);

        var dampingRatio = .5; // 0-1 parseInt(document.getElementById('damping-ratio').value);
        var frequencyHz = 10; // 0-30parseInt(document.getElementById('frequency-hz').value);
        params = {};
        if(dampingRatio != 0)
            params['dampingRatio'] = dampingRatio;
        if(frequencyHz != 0)
            params['frequencyHz'] = frequencyHz;
        console.log(params);

        // box.addDistanceJoint('ball1', 'ball2', params);
        // box.addDistanceJoint('ball3', 'ball2', params);
    }

    var draw = function() {
        //console.log("d");
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for(var id in world) {
            var entity = world[id];
            entity.draw(ctx);
        }
    }


    this.pause = function() {
        var alpha;
    }

    var update = function(animStart) {

        var degree = 270;
        if('attraction' in initialRules) {
            for(var attractor in initialRules['attraction']) {
                var attractees = initialRules['attraction'][attractor];
                var attractorPos = box.bodiesMap[attractor].GetPosition();

                for(var i = 0; i < attractees.length; ++i) {
                	var attractee = attractees[i];
                    var attracteePos = box.bodiesMap[attractee].GetPosition();
                    var forceX = attractorPos.x - attracteePos.x;
                    var forceY = attractorPos.y - attracteePos.y;
                    var distanceSquared = forceX * forceX + forceY * forceY;
                    var power;
                    if(distanceSquared !== 0) {
                        power = 10 * Math.exp(-0.1 * distanceSquared);
                        box.bodiesMap[attractee].ApplyForce(new b2Vec2(power * forceX, power * forceY), box.bodiesMap[attractee].GetWorldCenter());
                    }
                    if(time % 30 == 0) {
                        console.log(power);
                    }
                }
            }
        }

 
        if(isMouseDown) {
            box.mouseDownAt(mouseX, mouseY);

        }
        else if(box.isMouseDown()) {
            box.mouseUp();
        }

        box.update();
        bodiesState = box.getState();

        var graveyard = [];

        for(var id in bodiesState) {
            var entity = world[id];

            if(entity && world[id].dead) {
                box.removeBody(id);
                graveyard.push(id);
            }
            else if(entity) {
                entity.update(bodiesState[id]);
            }
        }

        for(var i = 0; i < graveyard.length; i++) {
            delete world[graveyard[i]];
        }
        time += 1;
    }


    this.run = function() {(function loop(animStart) {
            update(animStart);
            draw();
            requestAnimFrame(loop);
        })();
    }

    /* ---- INPUT ----------------------------- */
    var mouseX, mouseY, isMouseDown;

    canvas.addEventListener("mousedown", function(e) {
        isMouseDown = true;
        handleMouseMove(e);
        document.addEventListener("mousemove", handleMouseMove, true);
    }, true);


    canvas.addEventListener("mouseup", function() {
        if(!isMouseDown)
            return;
        document.removeEventListener("mousemove", handleMouseMove, true);
        isMouseDown = false;
        mouseX = undefined;
        mouseY = undefined;
    }, true);

    function handleMouseMove(e) {
        mouseX = (e.clientX - canvas.getBoundingClientRect().left) / SCALE;
        mouseY = (e.clientY - canvas.getBoundingClientRect().top) / SCALE;
    };

    init();

}