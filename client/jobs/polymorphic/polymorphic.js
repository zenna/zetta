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
* TODO:
*     // Q - How to handle scope
// Q - How to handle real numbers
// Q - How to handle
*/
var PolymorphicProgram = function(primitiveFuncs) {
    var compoundFuncs = {};

    this.addCompoundFunc = function(func) {
        compoundFuncs[func.getName()] = func;
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
        var primitiveFuncsAsList = [];
        for(var funcName in primitiveFuncs) {
            primitiveFuncsAsList.push(primitiveFuncs[funcName])
        }
        return primitiveFuncsAsList;
    }

    this.DoesFuncNameExist = function(funcName) {
        return ( funcName in compoundFuncs);
    }

    this.getPrimitiveFunc = function(funcName) {
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

    this.getName = function() {
        return name;
    }

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
    this.getAllFuncAppInstances = function() {
        return instances.filter(function(instance) {instance.getType() === "funcApp";
        });
    }
    this.getAllValueInstances = function() {
        return instances.filter(function(instance) {instance.getType() === "value";
        });
    }
    // This function should not be accessed by non helper functions since it returns a list
    // of mixed types (funcAppInstances and valueInstances), we use it only for efficient drawing
    this.getAllInstances = function() {
        return instances;
    }
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
    // First funcApp is root of tree, and accepts fuction only of same type as
    // function
    this.addInstance(new FuncAppInstance(typeSig));
};
/**
 @brief  Instance of function application
 */
var FuncAppInstance = function() {
    var name;
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
    var name;
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
var isProposalTypeConsistent = function(containerFunc, funcAppInstance, valueInstance, slot) {
    var instancesAreTypeCorrect = getInstanceType(funcAppInstance) === "funcApp" && getInstanceType(valueInstance) === "value";
    var successors = containerFunc.getSuccessors(funcAppInstance);
    var slotIsAvailable = successors[slot] === undefined ? true : false;
    var proposalIsTypeConsistent = isProposalTypeConsistent(funcAppInstance, valueInstance, slot);
    var slotZeroTemplateType = inferTemplateType(successors[0]);

    // if the slot is 0, it should have no existing args and have template type
    // func
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
};
