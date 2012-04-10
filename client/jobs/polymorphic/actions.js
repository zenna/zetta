"use strict"
/* @authors Zenna Tavares-zennatavares@gmail.com
*  (Mostly purely) function actions that can be taken upon programs to modify them
*/

// TODO - implement this
var getNumArgs = function(instance) {

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
var getInstanceType = function(instance) {
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