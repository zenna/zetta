/**
 * @author Zenna Tavares
 */

var main = function() {
    // Q - How to handle scope
    // Q - How to handle real numbers
    // Q - How to handle
    var program = new PolymorphicProgram(primitiveFuncs);
    program = makeFunction(program, 'fold', foldTypeSig);
    var fold = getCompoundFunc(program, 'fold');
    var fIf = getPrimitiveFunc(program, 'if');
    var fapp = getPrimitiveFunc(program, 'app');

    addInstance(fold, fIf);
    addInstance(fold, fapp);
    applyFuncToValues(fold, fapp, fIf, value, 0);
    applyFuncToValues(fold, fapp, fIf, value, 1);
    fold.compile();
    draw(funcToSimpleGraph(fold));

    program.addFunction(fold);
    program.applyFuncToValues()
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
    type : 'typeVariable',
    name : '[a]'
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
typeSig = [['a', 'b', 'c'], ['b'], ['a']];