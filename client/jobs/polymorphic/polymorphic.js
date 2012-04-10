"use strict"
/* @authors Zenna Tavares-zennatavares@gmail.com
* Typed polymorphic probabilistic program
* TODO: figure out type signature format
* TODO: Resolve type / instance type conflict
* TODO: Write type checking functions
* TODO: Write action sampler
* TODO: write compilation function
* TODO:
*
* TODO: How to treat alues
* TODO: implement getTemplate
* TODO: implement type checking
* TODO: Type constraints: 1) on function application
* 2) on the types of applications that can happen with variables
* e.g. we know that plus can't be applied to a string;
*/

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if(null == obj || "object" != typeof obj)
        return obj;

    // Handle Date
    if( obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if( obj instanceof Array) {
        var copy = [];
        for(var i = 0,              var len = obj.length; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if( obj instanceof Object) {
        var copy = {};
        for(var attr in obj) {
            if(obj.hasOwnProperty(attr))
                copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

var PolymorphicProgram = function(primitiveFuncs) {
    var compoundFuncs = {};

    this.addCompoundFunc = function(func) {
        compoundFuncs[func.name] = func;
    };

    this.getCompoundFunc = function(funcName) {
        return compoundFuncs[funcName];
    };
    // Return all compound funcs as a list of
    // TODO: use dirty/memoisation to make this faster
    this.getAllCompoundFuncs = function() {
        var compoundFuncsAsList = [];
        for(var funcName in compoundFuncs) {
            compoundFuncsAsList.push(compoundFuncs[funcName])
        }
        return compoundFuncsAsList;
    };

    this.getAllPrimitiveFuncs = function() {
        var primitiveFuncsAsList = []
        for(var funcName in primitiveFuncs) {
            compoundFuncsAsList.push(primitiveFuncs[funcName])
        }
        return compoundFuncsAsList;
    }

    this.DoesFuncNameExist = function(funcName) {
        return ( funcName in compoundFuncs);
    }

    this.getPrimitve = function(funcName) {
        return primitiveFuncs[funcName];
    }
}
// Typed function represented as graph
var TypedFunction = function(name, typeSig) {
    var instances = [];
    // Nodes, funcApps, values, functions
    var edges = [];
    var asString = "";
    // Function as a string of Javascript code
    var asStringIsDirty = true;
    // True whenever graph is updated, and string not
    var asNative;
    // Function compiled into executable native code

    // First funcApp is root of tree, and accepts fuction only of same type as
    // function
    this.addInstance(new funcAppInstance(typeSig));

    this.addInstance = function(instance) {
        instance.setName(edges.length);
        instances.push(instance);
        edges.push([]);
    };
    // Adds an edge between a funcApp instance and a value (after some sanity
    // checking)
    this.addEdge = function(funcAppInstance, valueInstance, slot) {
        // Check that slot is valid and empty
        var successors = this.getSuccessors(funcAppInstance);
        var slotIsAvailable = successors[slot] === undefined ? true : false;
        var proposalIsTypeConsistent = isProposalTypeConsistent(funcAppInstance, valueInstance, slot);
        if(instancesAreTypeCorrect && proposalIsTypeConsistent) {
            // Slot 0 is for a function only
        }
    };
    // Return a list of instances which are successors (i.e. connected to)
    // given instance
    this.getSuccessors = function(instance) {
        // Name should be integer index ndex
        var name = instance.getName();
        if( typeof name !== "number" || edges.length <= name) {
            throw "invalid instance name";
        }
        return edges[name];
    };
    // Compile the function
    this.compileToNative = function() {
        asNative = new Function("primitiveFuncs", "compoundFuncs", codeAsString);
    }
    // Compile the graph into a Javascript string
    this.compileToString = function() {
        asString = "return " + (function loop(instance) {
            var funcAsString = "";
            if(instance.getType() === "funcApp") {
                var successors = this.getSuccessors(instance);
                // TODO: Check funcApp is type correct and complete;

                // Get function (in 0th pos) name as string e.g 'myFunc('
                funcAsString += loop(successors[0]) + "(";

                // Now get recursively arguments
                for(var i = 0; i < successors.length; ++i) {
                    functionAsString += loop(successors[i]);
                    if(i != successors.length - 1) {
                        functionAsString += ",";
                    }
                }
                functionAsString += ")";
                return functionAsString;
            }
            else if(instance.getType() === "value") {
                // TODO: preped primitiveFuncs, compoundFuncs,
                return funcInstance.getTemplateName();
            }

            else {
                throw "invalid instance type in compilation:" + instance.getType();
            }

        })(instances[0]);
        //0th instance is root funcApp
        return asString;
    }
};
// TODO - implement this
var getNumArgs = function(instance) {

}
//
var isProposalTypeConsistent = function(containerFunc, funcAppInstance, valueInstance, slot) {
    var instancesAreTypeCorrect = getInstanceType(funcAppInstance) === "funcApp" && getInstanceType(valueInstance) === "value";
    var successors = containerFunc.getSuccessors(funcAppInstance);
    var slotIsAvailable = successors[slot] === undefined ? true : false;
    var proposalIsTypeConsistent = isProposalTypeConsistent(funcAppInstance, valueInstance, slot);
    var slotZeroTemplateType = inferTemplateType(successors[0]);

    // if the slot is 0, it should have no existing args and have template type func
    if(slot === 0 && successors.length === 0 && inferTemplateType(valueInstance) === "func") {
        // Create required number of empty slots
        var numArgs = getNumArgs(funcAppInstance);
        for(var i = 0; i < numArgs; ++i) {
            edges[funcAppInstance.getName()].push([]);
        }
        edges[funcAppInstance.getName()][slot] = valueInstance;
    }
    // Otherwise, there should always be a func before adding any new args
    else if(slot > 0 && slot < successors.length && successors[0] != undefined) {
        // Only add edge if the fa instance has a function attached and
        // type of valueInstance is consistent with funtion at that slot
        var typesAreConsistent = isProposalTypeConsistent(funcAppInstance, valueInstance, slot);
        if(typesAreConsistent) {
            edges[funcAppInstance.getName()][slot] = valueInstance;
        }
    }
}
/**
 @brief  Instance of function application
 */
var FuncAppInstance = function() {
    var instanceType = "funcApp";
    this.getName = function() {
        return name;
    };
    this.setName = function(newName) {
        name = newName;
    }
    this.getType = function() {
        return instanceType;
    }
};
/**
 @brief  Instance of function, value, functionApplication.
 */
var ValueInstance = function(name, template) {
    var instanceType = "value";
    this.getName = function() {
        return name;
    };
    this.setName = function(newName) {
        name = newName;
    }
    this.getType = function() {
        return instanceType;
    }
};
/*
 @ Returns a list of instances to which instance projects
 */
var getSuccessors = function(containerFunc, instance) {
    // FIXME: Maybe containerFunc should not be passed and each instance
    // Should contain a reference to its container func.
};
/**
 @brief  Adds an instance of template (e.g. function/value) to containerFunc

 @param[in] containerFunc      Function (i.e. graph), within which this
 application will occur
 @param[in] func               Template from which instance is created
 */
var addValueInstance = function(containerFunc, template) {
    var containerFunc = clone(containerFunc);
    var instance = new ValueInstance(template);
    containerFunc.addInstance(instance);
    return containerFunc;
};
var addFuncAppInstance = function(containerFunc, template) {
    var containerFunc = clone(containerFunc);
    var instance = new FuncAppInstance(template);
    containerFunc.addInstance(instance);
    return containerFunc;
};
/**
 @brief  Applies a function to value.

 @param[in] containerFunc      Function (i.e. graph), within which this
 application will occur
 @param[in] func               Function to be applied
 @param[in] slot               Argument position which value will occupy
 */
var connectInstances = function(containerFunc, funcAppInstance, funcInstance, valueInstance, slot) {
    // TODO: Check that value is not parent of func
    containerFunc.addEdge(funcAppInstance, valueInstnace, slot);
};
getInstanceType = function(instance) {
    return instance.getType();
};
// Create a function and add it to function
var makeFunction = function(program, funcName, typeSig) {
    // Do nothing is the function name is already in use
    var funcNameExists = program.DoesFuncNameExist(funcName);
    if(!funcNameExists) {
        var program = clone(program);
        var func = new TypedFunction(funcName, typeSig);
        program.addFunction(func);
        return program;
    }
    return program;
};
// Get a function by name
var getCompoundFunc = function(program, funcName) {
    return program.getCompoundFunc(funcName);
};
var getPrimitiveFunc = function(program, primitiveName) {
    return program.getPrimitiveFunc(funcName);
};
// Return list all functions
var getAllCompoundFuncs = function(program) {
    program.getAllCompoundFuncs();
};
// Return list all functions
var getAllPrimitiveFuncs = function(program) {
    program.getAllPrimitiveFuncs();
};
var primitiveFuncs = {
    plus : new TypedFunction(),
    makeFunction : new TypedFunction(),
};

var main = function() {
    // Q - How to handle scope
    // Q - How to handle real numbers
    // Q - How to handle
    var program = new PolymorphicProgram(primitiveFuncs);
    program = makeFunction(program, 'fold', foldTypeSig);
    var fold = getCompoundFunc(program, 'fold');
    var fIf = getPrimitiveFunc(program, 'if');
    var fapp = getPrimitiveFunc(program, 'app');

    addInstance(fold, fIf);
    addInstance(fold, fapp);
    applyFuncToValues(fold, fapp, fIf, value, 0);
    applyFuncToValues(fold, fapp, fIf, value, 1);
    fold.compile();
    draw(funcToSimpleGraph(fold));

    program.addFunction(fold);
    program.applyFuncToValues()
}

var foldArg1 = {
    type : 'function',
    argType : [{
        type : 'typeVariable',
        name : 'a'
    }, {
        type : 'typeVariable',
        name : 'b'
    }],
    returnType : [{
        type : 'typeVariable',
        name : 'b'
    }],
}

var foldArg2 = {
    type : 'typeVariable',
    name : 'b'
}

var foldArg3 = {
    type : 'typeVariable',
    name : '[a]'
}

var foldReturn = {
    type : 'typeVariable',
    name : 'a',
}

var foldTypeSig = {
    type : 'function',
    returnType : [foldReturn],
    args : [foldArg1, foldArg2, foldArg3]
}
typeSig = [['a', 'b', 'c'], ['b'], ['a']];
