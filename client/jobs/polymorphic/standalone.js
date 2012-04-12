/**
 * @author Zenna Tavares
 */

// TODO; Handle lists, and handle primitive vs compound funcs
// TODO: handle Type families
// TODO: how to prevent lists of lists containing hetrogenous types
// TODO: Change to use just string [(b -> b -> b) -> b -> [b] -> b]
var primitiveFuncs = {
    plus : new TypedFunction(),
    makeFunction : new TypedFunction(),
    fIf : new TypedFunction({
        name : 'fIf',
        type : convertTypesigListToObj(['Bool','a','a','a']),
        asNative : function(a, b, c) {
            if(a) {
                return b;
            }
            else {
                return c;
            }
        }
    }),
    size: new TypedFunction({
        name : 'length',
        type: convertTypeSigStringToObj("[a] -> Int"),
        asNative : function(list) {
            return list.length;
        }
    })
};

var main = function() {
    var program = new PolymorphicProgram(primitiveFuncs);
    program = makeFunction(program, 'fold', foldTypeSig);
    var fold = getCompoundFunc(program, 'fold'); 
    var fIf = getPrimitiveFunc(program, 'if');
    fold = addValueInstance(fold, fIf);
    fold = applyFuncToValues(fold, getPrimitiveFunc(program, 'length'), addValueInstance('arg1'));
    
    // The problem is, these functons would be more efficient if they returned more than jsut the typedFunction or program
    // However if they return more than one thing, need a data structure for mixed types
    // and how to ensure program is updated
    
    // Drawing
    var plainGraph = funcToPlainGraph(fold);
    var canvas = new drawPlainGraph(plainGraph,'#candidates',300,300);
    canvas.forceInit();
    canvas.drawInit();
    // applyFuncToValues(fold, fapp, fIf, value, 0);
    // applyFuncToValues(fold, fapp, fIf, value, 1);
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
