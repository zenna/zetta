/**
 * @author Zenna Tavares
 */

var Infon = function(bitString) {
    this.length = bitString.length;
    this.permBody = bitString;
    this.currentBody = bitString;
    this.types = [];

    this.getLength = function() {
        return this.length;
    };


    this.getCurrentBody = function() {
        return this.currentBody;
    };


    this.updateCurrentBody = function() {
        this.currentBody = this.tempBody;
    };


    this.updateCurrentBodyDirectly = function(bitString) {
        this.currentBody = bitString;
    }


    this.updatePermBody = function(bitString) {
        this.permBody = bitString;
        this.currentBody = bitString;
    }


    this.getPermBody = function() {
        return this.permBody;
    }

};

// Updates the current body of one or more infons
// With a decimal integer which when converted to a bitString
// is of the appropriate lenght: makes it easy to enumerate
// over possible argument values
var updateInfonsFromDec = function(dec, space, infonsToUpdate) {
    var argLengths = [], allArgs = [];
    var totalArgLength = 0;
    for(var i = 0; i < infonsToUpdate.length; ++i) {
        var infon = space.getInfonFromId(infonsToUpdate[i]);
        argLengths.push(infon.getLength());
        totalArgLength += argLengths[i];
    }
    var unslicedArgs = decToBitString(dec, totalArgLength);
    if(Math.log(dec + 1) / Math.LN2 > totalArgLength) {
        throw "i is too big for number of infons specified";
    }

    var startSlice = 0;
    for(var j = 0; j < infonsToUpdate.length; ++j) {
        var slice = unslicedArgs.slice(startSlice, startSlice + argLengths[j]);
        space.getInfonFromId(infonsToUpdate[j]).updatePermBody(slice);
        allArgs.push(slice);
        startSlice += argLengths[j];
    }
    return allArgs;
}