"use strict"
/* @authors Zenna Tavares-zennatavares@gmail.com
*  (Mostly purely) function actions that can be taken upon programs to modify them
*/

// TODO - implement this
var getNumArgs = function(instance) {

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
    instance = containerFunc.addInstance(instance);
    return [containerFunc, instance];
};
// Add new funcApp (function application) instance to containerFunc
// typeSig: compoundFunc -> func (in primitiveFunc,compoundFunc) -> {compoundFunc, instance}
var addFuncAppInstance = function(containerFunc, template) {
    var containerFunc = clone(containerFunc);
    var instance = new FuncAppInstance(template);
    instance = containerFunc.addInstance(instance);
    return [containerFunc, instance];
};
/**
 @brief  Applies a function to value.

 @param[in] containerFunc      Function (i.e. graph), within which this
 application will occur
 @param[in] func               Function to be applied
 @param[in] slot               Argument position which value will occupy
 */
var connectInstances = function(containerFunc, funcAppInstance, valueInstance, slot) {
    // TODO: Check that value is not parent of func
    // FIXME: will cloning container funcm nake instances broken references?
    var containerFunc = clone(containerFunc);
    containerFunc.addEdge(funcAppInstance, valueInstance, slot);
    return containerFunc;
};

// Apploies a function to a list of values, number of values should be sufficient and correct type
var applyFuncToValues = function(containerFunc, funcInstance, valueInstances) {
    // TODO: Check type consistency
    var containerFunc = clone(containerFunc);
    var funcAppInstance = new FuncAppInstance();
    containerFunc.addInstance(funcAppInstance);
    containerFunc = connectInstances(containerFunc, funcAppInstance, funcInstance, 0);
    for (var i=0;i<valueInstances.length;++i) {
        // i+1 since slot 0 is taken by function, remainder for args
        containerFunc = connectInstances(containerFunc, funcAppInstance, valueInstances[i], i+1);
    }
    return [containerFunc, funcAppInstance];
}
// either value or funcApp
var getInstanceType = function(instance) {
    return instance.getType();
};
// Return list of instances
var getAllFuncAppInstances = function(func) {
    return func.getAllFuncAppInstances();
};
var getAllValueInstances = function(func) {
    return func.getAllValueInstances();
};
// Create a function and return a new program with it appended
// Typesig: (program -> funcName -> typeSig) -> {program, compoundFunc}
var makeFunction = function(program, funcName, typeSig) {
    // Do nothing is the function name is already in use
    var funcNameExists = program.DoesFuncNameExist(funcName);
    if(!funcNameExists) {
        var program2 = clone(program);
        var func = new TypedFunction(funcName, typeSig);
        func = program2.addCompoundFunc(func);
        return [program2, func];
    }
    throw "Tried to create existing function name";
};
// Get a compound/primitive functions by name
var getCompoundFunc = function(program, funcName) {
    return program.getCompoundFunc(funcName);
};
var getPrimitiveFunc = function(program, funcName) {
    return program.getPrimitiveFunc(funcName);
};
// Return list all functions
var getAllCompoundFuncs = function(program) {
    return program.getAllCompoundFuncs();
};
// Return list all functions
var getAllPrimitiveFuncs = function(program) {
    return program.getAllPrimitiveFuncs();
};

var getLocalValue = function(func, slot) {
    //TODO: check func is a func and slot is within range
    var typeSig = func.getTypeSig();
    return typeSig.args[slot];
}
