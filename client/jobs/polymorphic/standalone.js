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
    )
};

var main = function() {
    var program = new PolymorphicProgram(primitiveFuncs);
    // FIXME: using string for name, renders this function unusable for RL agentf 
    program_fold = makeFunction(program, 'fold', foldTypeSig);
    var length = getPrimitiveFunc(program, 'length');
    var fIf = getPrimitiveFunc(program_fold[0], 'fIf');
    var arg0 = getLocalValue(program_fold[1], 0);
    var fold_fIf = addValueInstance(program_fold[1], fIf);
    var fold_length = addValueInstance(fold_fIf[0], length);

    // Problem, is length still valid in fold after fold is modified?

    // Problem is that fold_if we have to do every operation one by one, since otherwise program will be wring
    // Are there any times when you might want the programs to be different, e.g. to compare hypothetical change
    fold_arg = addValueInstance(fold_fIf[0], arg0);
    fold_funcApp = applyFuncToValues(fold_arg[0], getPrimitiveFunc(program, 'length'), [fold_arg[1]]);
        
    // Drawing
    var plainGraph = funcToPlainGraph(fold_funcApp[0]);
    var canvas = new drawPlainGraph(plainGraph,'#candidates',300,300);
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
