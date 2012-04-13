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

// Statefulness vs stateless functions
For stateless pure functions
 - pros: we need state free objects if we want to do something like sparse samplinge
 - cons: possibility for disconnect between programs, functions, and instances
    - for example 
stateful (i.e. actions can modify state of program)
 - more efficient in time and space
 - javacript objects are difficult to copy

*/
var PolymorphicProgram = function(primitiveFuncs) {
    this.compoundFuncs = {};
    this.primitiveFuncs = primitiveFuncs;

    this.addCompoundFunc = function(func) {
        this.compoundFuncs[func.getName()] = func;
        return func;
    };

    this.getCompoundFunc = function(funcName) {
        return this.compoundFuncs[funcName];
    };
    // Return all compound funcs as a list of
    // TODO: use dirty/memoisation to make this faster
    this.getAllCompoundFuncs = function() {
        var compoundFuncsAsList = [];
        for(var funcName in this.compoundFuncs) {
            compoundFuncsAsList.push(this.compoundFuncs[funcName])
        }
        return compoundFuncsAsList;
    };

    this.getAllPrimitiveFuncs = function() {
        var primitiveFuncsAsList = [];
        for(var funcName in this.primitiveFuncs) {
            primitiveFuncsAsList.push(this.primitiveFuncs[funcName])
        }
        return primitiveFuncsAsList;
    }

    this.DoesFuncNameExist = function(funcName) {
        return ( funcName in this.compoundFuncs);
    }

    this.getPrimitiveFunc = function(funcName) {
        return this.primitiveFuncs[funcName];
    }
}
// Typed function represented as graph
var TypedFunction = function(name, typeSig, asNative) {
    this.name = name;
    this.typeSig = typeSig;
    this.asNative = asNative;
    this.instances = [];
    // Nodes, funcApps, values, functions
    this.edges = [];
    this.asString = "";
    // Function as a string of Javascript code
    this.asStringIsDirty = true;
    // True whenever graph is updated, and string not
    if (typeof asNative !== "undefined") {
        this.asNative = asNative;
    };
    // Function compiled into executable native code

    this.getName = function() {
        return name;
    };

    this.getTypeSig = function() {
        return typeSig;
    };

    this.addInstance = function(instance) {
        instance.setName(this.instances.length);
        this.instances.push(instance);
        this.edges.push([]);
        return instance;
    };
    // Adds an edge between a funcApp instance and a value (after some sanity
    // checking)
    this.addEdge = function(funcAppInstance, valueInstance, slot) {
        // Check that slot is valid and empty
        var successors = this.getSuccessors(funcAppInstance);
        var slotIsAvailable = successors[slot] === undefined ? true : false;
        var proposalIsTypeConsistent = isProposalTypeConsistent(this, funcAppInstance, valueInstance, slot);
        if(proposalIsTypeConsistent) {
            this.edges[funcAppInstance.getName()][slot] = valueInstance;
        }
    };
    this.getAllFuncAppInstances = function() {
        return this.instances.filter(function(instance) {return instance.getType() === "funcApp" ? true : false;
        });
    }
    this.getAllValueInstances = function() {
        return this.instances.filter(function(instance) {return instance.getType() === "value" ? true : false;
        });
    }
    this.getInstanceByName = function(name) {
        return this.instances[name];
    }
    // This function should not be accessed by non helper functions since it returns a list
    // of mixed types (funcAppInstances and valueInstances), we use it only for efficient drawing
    this.getAllInstances = function() {
        return this.instances;
    }
    // Return a list of instances which are successors (i.e. connected to)
    // given instance
    this.getSuccessors = function(instance) {
        // Name should be integer index ndex
        var name = instance.getName();
        if( typeof name !== "number" || this.edges.length <= name) {
            throw "invalid instance name";
        }
        return this.edges[name];
    };
    // Compile the function
    this.compileToNative = function() {
        this.asNative = new Function("primitiveFuncs", "compoundFuncs", this.asString);
    }
    // Compile the graph into a Javascript string
    this.compileToString = function() {
        var self = this;
        this.asString = "return " + (function loop(instance) {
            var funcAsString = "";
            if(instance.getType() === "funcApp") {
                var successors = self.getSuccessors(instance);
                // TODO: Check funcApp is type correct and complete;

                // Get function (in 0th pos) name as string e.g 'myFunc('
                funcAsString += loop(successors[0]) + "(";

                // Now get recursively arguments
                for(var i = 1; i < successors.length; ++i) {
                    funcAsString += loop(successors[i]);
                    if(i != successors.length - 1) {
                        funcAsString += ",";
                    }
                }
                funcAsString += ")";
                return funcAsString;
            }
            else if(instance.getType() === "value") {
                // TODO: preped primitiveFuncs, compoundFuncs,
                return instance.getTemplateName();
            }

            else {
                throw "invalid instance type in compilation:" + instance.getType();
            }

        })(this.instances[0]);
        //0th instance is root funcApp
        return this.asString;
    }
    // First funcApp is root of tree, and accepts fuction only of same type as
    // function
    var rootInstance = new FuncAppInstance()
    this.addInstance(rootInstance);
};
/**
 @brief  Instance of function application
 */
var FuncAppInstance = function(template) {
    this.template = template;
    this.instanceType = "funcApp";
    this.getName = function() {
        return this.name;
    };
    this.setName = function(newName) {
        this.name = newName;
    }
    this.getType = function() {
        return this.instanceType;
    };
    this.getTemplate = function() {
        return this.template;
    }
    this.getTemplateName = function() {
        return this.instanceType;
    }
};
/**
 @brief  Instance of function, value, functionApplication.
 */
var ValueInstance = function(template) {
    this.template = template;
    this.instanceType = "value";
    this.getName = function() {
        return this.name;
    };
    this.setName = function(newName) {
        this.name = newName;
    }
    this.getType = function() {
        return this.instanceType;
    }
    this.getTemplateName = function() {
        return this.template.getName();
    }
};
var isProposalTypeConsistent = function(containerFunc, funcAppInstance, valueInstance, slot) {
    // FIXME: hack
    return true;
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