
function Program(observedData, stateQueries) {
    this.stateQueries = stateQueries;
    this.observedData = observedData;
    this.length = 0;
    this.functions = {
        'main' : {
            modifyable : true,
            typeSig : [['state', 'state'], 'stateReward'],
            codeAsTree : {
                returnNode : [{
                    combineStateReward : [null, null]
                }]
            },
            __dirty : true
        },
        'combineStateReward' : {
            modifyable : false,
            typeSig : [['state', 'number'], 'stateReward'],
            codeAsFunction : function(state, reward) {
                return [state, reward];
            }

        },
        'plus' : {
            modifyable : false,
            typeSig : [['number', 'number'], 'number'],
            codeAsFunction : function(a, b) {
                return a + b;
            }

        },
        'minus' : {
            modifyable : false,
            typeSig : [['number', 'number'], 'number'],
            codeAsFunction : function(a, b) {
                return a - b;
            }

        },
        'mul' : {
            modifyable : false,
            typeSig : [['number', 'number'], 'number'],
            codeAsFunction : function(a, b) {
                return a * b;
            }

        },
        'gDiv' : {
            modifyable : false,
            typeSig : [['number', 'number'], 'number'],
            codeAsFunction : function(a, b) {
                return b === 0 ? 0 : a / b;
            }

        },
        'sum' : {
            modifyable : false,
            typeSig : [['list'], 'number'],
            codeAsFunction : function(arrayToSum) {
                return arrayToSum.reduce(function(previousValue, currentValue, index, array) {
                    return previousValue + currentValue;
                });

            }

        },
        'cons' : {
            modifyable : false,
            typeSig : [['number', 'number'], 'list'],
            codeAsFunction : function(a, b) {
                return [a, b];
            }

        },
        'increment' : {
            modifyable : false,
            typeSig : [['number'], 'number'],
            codeAsFunction : function(a) {
                return a + 1;
            }

        },
        'decrement' : {
            modifyable : false,
            typeSig : [['number'], 'number'],
            codeAsFunction : function(a) {
                return a - 1;
            }

        },
    }

    jQuery.extend(this.functions, stateQueries);

    this.codeAsString = "";
    this.__dirty = true;

    this.getAllNodes = function(funcForLocals) {
        var allNodes = {};
        var localVariables = this.getLocalVariables(funcForLocals);
        for(var func in this.functions) {
            if(!( func in allNodes) && func != funcForLocals) {
                allNodes[func] = this.functions[func];
            }
        }
        for(var func in localVariables) {
            if(!( func in allNodes)) {
                allNodes[func] = localVariables[func];
            }
        }
        return allNodes;
    }

    // Makes (locally to this object) unique function name e.g. f1231
    this.makeGuid = function() {
        var guid;
        do {
            guid = 'f' + parseInt(Math.random() * 1000000);
        } while (guid in this.functions);
        return guid;
    }


    this.compileAll = function() {
        // If program has nulls in it, it is invalid
        try {
            if(this.__dirty === true) {
                for(func in this.functions) {
                    if(this.functions[func]['modifyable'] === true) {
                        var compiledFunc = this.compileFunction(func);
                    }
                }
            }
            this.__dirty = false;
            var functions = this.functions;
            return function(state, action, stateQueries) {
                return functions['main']['codeAsFunction'](functions, state, action);
            }

        } catch(er) {
            if(er === "nullInTree") {
                return function(state, action, stateQueries) {
                    return [state, -1];
                };

            }
        }
    }

    // Convert tree or list expression into compiled code
    this.compileFunction = function(func) {
        if(this.functions[func]['__dirty'] === true) {
            this.functions[func]['codeAsString'] = this.processSymbols(this.functions[func]['codeAsTree']);
            var localVariables = this.getLocalVariables(func);
            var localVariablesAsList = ['functions'];
            for(localFunc in localVariables) {
                localVariablesAsList.push(localFunc);
            }
            this.functions[func]['codeAsFunction'] = new Function(localVariablesAsList, this.functions[func]['codeAsString']);
            this.functions[func]['__dirty'] = false;
            return this.functions[func]['codeAsFunction'];
        } else {
            console.log("not dirtty");
            return this.functions[func]['codeAsFunction'];
        }
    }

    // Is a node in codeAsTree a function or not?
    this.isSymbolFunction = function(symbol, isNullOk) {
        if(symbol === null) {
            if(isNullOk === true) {
                return false;
            } else {
                console.log("Null in tree");
                // throw "nullInTree";
            }
        } else if( typeof symbol === "object") {
            return true;
        } else {
            return false;
        }
    }

    // Reursively compile codeAsTree into codeAsString
    this.processSymbols = function(funcTree) {
        var functionAsString = "";
        if(this.isSymbolFunction(funcTree, false)) {

            // Object has single proprety, get key
            var symbol;
            for(x in funcTree) {
                symbol = x;
            }

            if(symbol === "returnNode") {
                functionAsString += "return (";
            } else {
                functionAsString += "functions." + symbol + ".codeAsFunction" + "(";
                if(this.functions[symbol]['modifyable'] === true) {
                    // Need to pass functions object to modifyable objects
                    functionAsString += "functions,";
                }
            }
            var numArguments = funcTree[symbol].length;
            for(var i = 0; i < numArguments; ++i) {
                functionAsString += this.processSymbols(funcTree[symbol][i]);
                if(i != numArguments - 1) {
                    functionAsString += ",";
                }
            }
            functionAsString += ")";
            return functionAsString;
        } else {
        	// is action
        	if (funcTree === "main_a1") {
        		return "functions['main_a1'].codeAsFunction(main_a0)";
        	}
            return funcTree;
        }
    }


    this.getLocalVariables = function(func) {
        var localVariables = {};
        var typeSig = this.functions[func]['typeSig'][0];
        for(var i = 0; i < typeSig.length; ++i) {
            localVariables[func + "_a" + i] = {
                typeSig : [typeSig[i]]
            };
        }
        return localVariables;
    }

    // Recurse through funcTree building filtered list
    this.treeFilter = function(funcTree, filterFunc, position) {
        // var filteredFuncs = [];
        var filteredPositions = [];
        if(this.isSymbolFunction(funcTree, true)) {

            // Object has single proprety, get key
            var symbol;
            for(x in funcTree) {
                symbol = x;
            }
            position = position.concat(symbol);

            if(filterFunc.apply(filterFunc, [funcTree, symbol])) {
                // filteredFuncs.push(funcTree);
                filteredPositions.push(position);
            }

            var numArguments = funcTree[symbol].length;
            for(var i = 0; i < numArguments; ++i) {
                filteredPositions = filteredPositions.concat(this.treeFilter(funcTree[symbol][i], filterFunc, position.concat(i)));
            }
            return filteredPositions;
        } else {
            return [];
        }
    }


    this.treeRecursiveDraw = function(funcTree, graph) {
        var filteredFuncs = [];
        var name = this.makeGuid();
        if(this.isSymbolFunction(funcTree, true)) {
            // Object has single proprety, get key
            var symbol;
            for(x in funcTree) {
                symbol = x;
            }
            graph.addNode(name, {
                label : symbol //,
            });
            var st = {
                directed : true
            };
            var numArguments = funcTree[symbol].length;
            for(var i = 0; i < numArguments; ++i) {
                var childName = this.treeRecursiveDraw(funcTree[symbol][i], graph);
                graph.addEdge(name, childName, st);
            }
        } else {
            graph.addNode(name, {
                label : "" + funcTree //,
            });
        }
        return name;
    }

    // Draw all the functions
    this.draw = function(index) {
        var width = 300;
        var height = 300;
        var graphs = [];
        var renderers = [];
        var layouters = [];

        var i = 0;
        for(func in this.functions) {
            if(this.functions[func]['modifyable'] === true) {
                if(i === index || typeof (index) === 'undefined') {
                    graphs[i] = new Graph();

                    // var gr = new Graph();
                    $('#canvas').append("<div id='" + func + "Div' class='programBox'></div>");
                    this.treeRecursiveDraw(this.functions[func]['codeAsTree'], graphs[i])
                    /* layout the graph using the Spring layout implementation */
                    layouters[i] = new Graph.Layout.Spring(graphs[i]);
                    /* draw the graph using the RaphaelJS draw implementation */
                    renderers[i] = new Graph.Renderer.Raphael(func + "Div", graphs[i], width, height);
                }
                i = i + 1;
            }
        }
        redraw = function() {
            layouter.layout();
            renderer.draw();
        };

        hide = function(id) {
            g.nodes[id].hide();
        };

        show = function(id) {
            g.nodes[id].show();
        };

    }

}

// Actions	------------------- this is bound to program object.
var addBoundNode = function(program, child, parentFunc, parentPropertyTrace, availableSlotPos) {
    var parentSlot = getNestedObjectFromPropertyStack(program.functions[parentFunc]['codeAsTree'], parentPropertyTrace);
    var childObj = program.getAllNodes(parentFunc)[child];

    if(childObj['typeSig'].length === 1) {
        // Am a variable
        parentSlot[availableSlotPos] = child;
    } else if(childObj['typeSig'].length === 2) {
        // Am a function
        var numArgs = childObj['typeSig'][0].length;
        var nullArgs = [];
        for(var i = 0; i < numArgs; ++i) {
            nullArgs.push(null);
        }
        parentSlot[availableSlotPos] = {};
        parentSlot[availableSlotPos][child] = nullArgs;
    } else {
        throw "typeSig length is wrong";
    }
    program.length += 1;
    program.__dirty = true;
    program.functions[parentFunc].__dirty = true;
}

var replace = function(func) {
}

var lambdarise = function() {
}

var doNothing = function() {
}

// TODO: Where does typeSig come from?
this.makeLambda = function(typeSig) {
    var numArgs = typeSig[0].length;
    var nullArgs = [];
    for(var i = 0; i < numArgs; ++i) {
        nullArgs.push(null);
    }
    var funcName = this.makeGuid();
    this.functions[funcName] = {
        modifyable : true,
        __dirty : true,
        typeSig : typeSig,
        codeAsTree : {}
    };
    this.functions[funcName]['codeAsTree'][funcName] = nullArgs;
}

// ------------------------------------------------------------------

// Action sampler, returns function => [listOfArguments]
var sampleProgramAction = function(program) {
    var topLevelActions = ['addBoundNode', 'addBoundNode', 'addBoundNode', 'addBoundNode', 'doNothing'];
    var actionType = stGetRandomElement(topLevelActions);

    if(actionType === 'makeLambda') {
        //TODO generate Typesig
        return [makeLambda, [[['number', 'list'], 'number']]];
    }
    // takes a node from function set, binds to bindTo node as argument
    else if(actionType === 'addBoundNode') {
        // Choose function we will modify
        var funcs = [];
        for(var func in program.functions) {
            if(program.functions[func]['modifyable'] === true) {
                funcs.push(func);
            }
        }

        var parentFunc = stGetRandomElement(funcs);
                if (parentFunc === 'main') {
        	var alphabrea;
        }
        var codeAsTree = program.functions[parentFunc]['codeAsTree'];

        // Recursively find all nodes within chosen function with empty slot ( null)
        var viableParents = program.treeFilter(codeAsTree, function(funcTree, symbol) {
            var numArguments = funcTree[symbol].length;
            var hasEmptySlot = false;
            for(var i = 0; i < numArguments; ++i) {
                if(funcTree[symbol][i] === null) {
                    hasEmptySlot = true;
                    break;
                }
            }
            return hasEmptySlot;
        }, []);

        if(viableParents.length === 0) {
            console.log("no empty slots");
            return ['doNothing', []];
        }
        var parentPropertyTrace = stGetRandomElement(viableParents);
        var parentSlots = getNestedObjectFromPropertyStack(program.functions[parentFunc]['codeAsTree'], parentPropertyTrace);
        var availableSlotPos = stGetRandomFilteredElementIndex(parentSlots, function(element) {
            return element === null ? true : false
        });

        if(availableSlotPos === undefined) {
            throw "no slot found";
        }
        // Candidate list should be program.functions
        var parentObj = parentPropertyTrace[parentPropertyTrace.length - 1];
        var requiredType;
        if(parentObj === 'returnNode') {
            requiredType = program.functions[parentFunc]['typeSig'][1];
        } else {
            requiredType = program.functions[parentObj]['typeSig'][0][availableSlotPos];
        }

        var viableChildren = [];
        var allNodes = program.getAllNodes(parentFunc);
        for(var func in allNodes) {
            if((allNodes[func]['typeSig'].length === 1 && allNodes[func]['typeSig'][0] === requiredType) || 
            (allNodes[func]['typeSig'][1] === requiredType && allNodes[func]['placable'] !== false)) {
                viableChildren.push(func);
            }
        }

        if(viableChildren.length === 0) {
            console.log("no viable Children");
            return ['doNothing', []];
        }

        var child = stGetRandomElement(viableChildren);
        return ['addBoundNode', [child, parentFunc, parentPropertyTrace, availableSlotPos]];
    } else if(actionType === 'replace') {
        var viableFunctions = getConstrainedFunction(functionSet, function(lambda) {
            return (func.slotsAvailable > 0)
        });

    }
    // creates new function from subtree beginning at node,
    // match subtree in graph and replace subtree with function node,
    // add function node to set
    else if(actionType === 'lamdarise') {
    } else if(actionType === 'doNothing') {
        return ['doNothing', []];
    } else {
        throw "Action " + actionType + " type not found";
    }
}

// var prog;
// window.onload = function() {
// prog = new Program();
// for(var i = 0; i < 30; ++i) {
// $('#canvas').empty();
// action = sampleAction(prog);
// action[0].apply(prog, action[1]);
// }
// prog.draw();
// };