/**
 * @author Zenna Tavares, Assortment of helper functions
 */
// ------ Array Functions ---------
// Sum values in array
"use strict";
var sum = function(arrayToSum) {
    return arrayToSum.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + currentValue;
    });

};

// Min value in array
var min = function(arrayToMin) {
    return Math.min.apply(Math.min, arrayToMin);
};

// Are arrays a and b equal? (required because [1,2] != [1,2] in js)
var arraysEqual = function(a, b) {
    return !(a < b || b < a);
};

var indexInListOfArrays = function(list, searchValue) {
    return list.indexOf(searchValue);
};

// Return a random element from a list
var getRandomElement = function(list) {
    var i = Math.floor(Math.random() * list.length);
    return list[i];
};

var sumArray = function(arrayToSum) {
    return arrayToSum.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + currentValue;
    });
};

var allIndexesOf = function(list, value) {
    var done = false, pos = 0;
    var indices = [];
    while(done === false) {
        pos = list.indexOf(value, pos);
        if(pos === -1) {
            done = true;
        }
        else {

            indices.push(pos++);
        }
    }
    return indices;
};

// Return a range on interval [begin,end)
var range = function(begin, end) {
    var range = [];
    for(var i = begin; i < end; ++i) {
        range.push(i);
    }
    return range;
};

// Picks a random property from an object
var pickRandomProperty = function(obj) {
    var result, count = 0;
    for(var prop in obj) {
        if(Math.random() < 1 / ++count) {
            result = prop;
        }
    }
    return result;
};

// This function is for rearranging a list into an object keyed by some
// property of elements in the lsit 
// it applies keyFilterFunc to elements to generate the key
// And applies objFilterFunc to elements to define what is stored
// By default objFilterFunc stores the entire element
var rearrangeListToObj = function(list, keyFilterFunc, objFilterFunc) {
    var objFilterFunc = typeof objFilterFunc === "undefined" ? function(x) {
        return x;
    } : objFilterFunc;

    var rearranged = {};
    for(var i = 0; i < list.length; ++i) {
        var key = keyFilterFunc(list[i]).toString();
        if(!( key in rearranged)) {
            rearranged[key] = [];
        }
        rearranged[key].push(objFilterFunc(list[i]));
    }
    return rearranged;
};

// Returns nested object from parent and list of properties (i.e. strack trace)
// e.g. parentObj = {a:{b:{c:true}}}, propertyStack = [a,b,c], returns true
var getNestedObjectFromPropertyStack = function(parentObj, propertyStack) {
    var nestedObj = parentObj;
    for(var i = 0; i < propertyStack.length; i++) {
        nestedObj = nestedObj[propertyStack[i]];
    }
    return nestedObj;
};

// (e.g. [true,true,true,false] => {true:3,false:1})
var hist = function(list) {
    var histogram = {};
    for(var i = 0; i < list.length; ++i) {
        if(list[i] in hist) {
            histogram[list[i]] += 1;
        }
        else {
            histogram[list[i]] = 1;
        }
    }
    return histogram;
};