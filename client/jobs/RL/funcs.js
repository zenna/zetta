/**
 * @author Zenna Tavares: List of functions
 */
var baseFuncs = {
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