"use strict"
/* @authors Zenna Tavares-zennatavares@gmail.com
*  Helpers for Typed polymorphic probabilistic program
*/

// Clones a javascript object
var clone = function(obj) {
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
        for(var i = 0, len = obj.length; i < len; ++i) {
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
};
// Type variables are always all lower case
var isTypeVariable = function(value) {
    // is the character loer case
    if(value == value.toLowerCase()) {
        return true;
    }
    else {
        return false;
    }
};
// Converts of a type sig of long and structure object form
// into more compact and readable list form e.g. [['a', 'b', 'c'], ['b'], ['a']];
var convertTypesigListToObj = function(objTypeSig) {
    return (function loop(value) {
        if( typeof value === "object") {
            var typeSig = {
                type : 'PrimitiveFunc',
                argType : []
            };
            for(var i = 0; i < value.length - 1; ++i) {
                typeSig.argType.push(loop(value[i]));
            }
            typeSig['returnType'] = loop(value[value.length - 1]);
        }
        else if(isTypeVariable(value)) {
            var typeSig = {
                type : 'typeVariable',
                name : value
            }
        }
        else {
            var typeSig = {
                type : 'type',
                name : value
            }
        }
        return typeSig;
    })(objTypeSig);
};
// Convert a typed function into plain graph format for drawing
var funcToPlainGraph = function(typedFunc) {
    var nodes = [], links = [];
    var instances = typedFunc.getAllInstances();

    // First add all the nodes
    for(var i = 0; i < instances.length; ++i) {
        nodes.push({
            id : instances[i].getName(),
        });
    }

    // Then add all the links from an instance to its successors
    for(var i = 0; i < instances.length; ++i) {
        var successors = typedFunc.getSuccessors(instances[i]);
        for(var j = 0; j < successors.length; ++j) {
            links.push({
                source : instances[i].getName(),
                target : successors[j].getName(),
                value : 1,
            });
        }
    }
    return {
        nodes : nodes,
        links : links
    };
};
