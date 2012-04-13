/**
 * @author Zenna Tavares
 */

// TODO; Handle lists, and handle primitive vs compound funcs
// TODO: handle Type families
// TODO: how to prevent lists of lists containing hetrogenous types
// TODO: Change to use just string [(b -> b -> b) -> b -> [b] -> b]
var primitiveFuncs = {
    fIf : new TypedFunction(
        'fIf',
        convertTypesigListToObj(['Bool','a','a','a']),
        function(a, b, c) {
            if(a) {
                return b;
            }
            else {
                return c;
            }
        }
    ),
    length: new TypedFunction(
        'length',
        //"[a] -> Int"
        convertTypesigListToObj(['List', 'Int']),
        function(list) {
            return list.length;
        }
    ),
    eq: new TypedFunction(
        'eq',
        convertTypesigListToObj(['a','a','Bool']),
        function(x, y) {
            return x === y;
        }
    ),
    isZero: new TypedFunction(
        'isZero',
        convertTypesigListToObj(['Int','Bool']),
        function(x) {
            return x === 0;
        }
    ),
    head: new TypedFunction(
        'head',
        convertTypesigListToObj(['List','a']),
        function(list) {
            return list.slice(0,1)[0];
        }
    ),
    tail: new TypedFunction(
        'tail',
        convertTypesigListToObj(['List','List']),
        function(list) {
            return list.slice(1,list.length);
        }
    )
};

var main = function() {
    var program = new PolymorphicProgram(primitiveFuncs);
    // FIXME: using string for name, renders this function unusable for RL agentf 
    // Problem is that fold_if we have to do every operation one by one, since otherwise program will be wring
    // Are there any times when you might want the programs to be different, e.g. to compare hypothetical change

    program_fold = makeFunction(program, 'fold', foldTypeSig);
    var fold_instance = addValueInstance(program_fold[1], getPrimitiveFunc(program, 'length'));
    fold_instance = addValueInstance(fold_instance[0], getLocalValue(fold_instance[0], 0)); // list
    fold_instance = addValueInstance(fold_instance[0], getPrimitiveFunc(program, 'isZero'));
    fold_instance = addValueInstance(fold_instance[0], getLocalValue(fold_instance[0], 1)); // z
    fold_instance = addValueInstance(fold_instance[0], getLocalValue(fold_instance[0], 2)); // fold func
    fold_instance = addValueInstance(fold_instance[0], getPrimitiveFunc(program, 'head'));
    fold_instance = addValueInstance(fold_instance[0], getLocalValue(fold_instance[0], 0)); // list
    fold_instance = addValueInstance(fold_instance[0], getCompoundFunc(program_fold[0], 'fold'));
    fold_instance = addValueInstance(fold_instance[0], getLocalValue(fold_instance[0], 2)); // fold func
    fold_instance = addValueInstance(fold_instance[0], getLocalValue(fold_instance[0], 1)); // z
    fold_instance = addValueInstance(fold_instance[0], getPrimitiveFunc(program, 'tail'));
    fold_instance = addValueInstance(fold_instance[0], getLocalValue(fold_instance[0], 0)); // list
    fold_instance = addValueInstance(fold_instance[0], getPrimitiveFunc(program, 'fIf'));

    fold_instance = applyFuncToValues(fold_instance[0], fold_instance[0].getInstanceByName(1), [fold_instance[0].getInstanceByName(2)]);
    fold_instance = applyFuncToValues(fold_instance[0], fold_instance[0].getInstanceByName(3), [fold_instance[0].getInstanceByName(14)]);
    fold_instance = applyFuncToValues(fold_instance[0], fold_instance[0].getInstanceByName(6), [fold_instance[0].getInstanceByName(7)]);
    fold_instance = applyFuncToValues(fold_instance[0], fold_instance[0].getInstanceByName(11), [fold_instance[0].getInstanceByName(12)]);
    fold_instance = applyFuncToValues(fold_instance[0], fold_instance[0].getInstanceByName(8), [fold_instance[0].getInstanceByName(9), fold_instance[0].getInstanceByName(10),fold_instance[0].getInstanceByName(17)]);
    fold_instance = applyFuncToValues(fold_instance[0], fold_instance[0].getInstanceByName(5), [fold_instance[0].getInstanceByName(16), fold_instance[0].getInstanceByName(18)]);
    fold_instance = applyFuncToValuesWithFuncApp(fold_instance[0], fold_instance[0].getInstanceByName(0), fold_instance[0].getInstanceByName(13), [fold_instance[0].getInstanceByName(15), fold_instance[0].getInstanceByName(4), fold_instance[0].getInstanceByName(19)]);

    // TODO- COMpile the thing
    var code = fold_instance[0].compileToString();
    alert(code);
        
    // Drawing
    var plainGraph = funcToPlainGraph(fold_instance[0]);
    var canvas = new drawPlainGraph(plainGraph,'#candidates',500,500);
    canvas.forceInit();
    canvas.drawInit();
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
    type : 'list',
    valueType: {
        type : 'typeVariable',
        name: 'a'
    }
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

$('document').ready(function() {
    main();
});
