// TODO: Do loading and savnig to local storage
// TODO: Implement state of the art GP methods

// So if i ca// ll zetta.loadData('local', 'migrationPopulation')
// the challenges are this will have to go through events
// callback
// // Soon to be indexedDB storage, currently deprecated web sql
// // Now we can use localstorage 
// var reader = new FileReader();
// reader.onload = function(e) {
// 	var landscape_json =  $.parseJSON( e.target.result ) ;
// 	load_landscape(landscape_json);
// }
// reader.readAsText(f);
// 
// var loader = new zetta.Loader();
// loader.onload = function() {
// 	
// }
// loader.load()

// Do the local loader
// We have sync access through indexedDB which is not ready yet, and possibly both async and sync (by blocking)
// We *NEED* a library for local storage.: Options, made fake indexedDB, make wrapper f store/load library
// Regional loader on fixed address

// importScripts('zetta.js');
function Job() {
    this.doCleanUp = false;

    self.addEventListener('message',
    function(event) {
        var action = event.data.action;
        var guid = event.data.guid;
        switch (action) {
        case 'start':
            main(guid);
            doCleanUp = false;
            break;
        case 'clean':
            doCleanUp = true;
            break;
        }
    },
    false);

	this.actualFunction = function(x,y) {
		return (x * x - y)/(x + y);
	}

    // Return fitness for symbolic regression task
    // TODO: Include time
    this.findFitness = function(program) {
        var numTestCases = 100;
        var fitness = 0.0;
        var totalError = 0.0;
        for (var i = 0; i < numTestCases; ++i) {
            var x = Math.random();
            var y = Math.random();
            var actualOutput = this.actualFunction(x,y);
            var programOutput = program.program(x, y);
            var error = actualOutput - programOutput;
            totalError += error * error;
        }
        totalError /= numTestCases;
        return totalError + program.jsExpr.length / 10;
    }

    // Return fitness of program
    this.fitnessSegmentation = function(program) {
        // Symbolic regression
        var testCases = 100;
        var fitness = 0.0;

        for (var i = 0; i < testCases; ++i) {
            var x = Math.Random();
            var actualY = x * x + 2 - x;
            var programY = program(x);
        }
        return fitness;
    }

    this.isSymbolFunction = function(symbol) {
        if (symbol[1] >= 0) {
            return true;
        }
        else {
            return false;
        }
    }

    this.depthFirstGrowTree = function(currentDepth, functionSet, terminalSet, maxDepth) {
        var randomSymbol;
        if (currentDepth == 0) {
            var index = Math.floor(Math.random() * functionSet.length);
            randomSymbol = functionSet[index];
        }
        else if (currentDepth == maxDepth) {
            var index = Math.floor(Math.random() * terminalSet.length);
            randomSymbol = terminalSet[index];
        }
        else {
            // TODO: Add some probability of choosing temrinalSet
            var index = Math.floor(Math.random() * functionSet.length);
            randomSymbol = functionSet[index];
        }
        if (this.isSymbolFunction(randomSymbol)) {
            functionAsList = [randomSymbol];
            var numArguments = randomSymbol[1];
            for (var i = 0; i < numArguments; ++i) {
                functionAsList = functionAsList.concat(this.depthFirstGrowTree(currentDepth + 1, functionSet, terminalSet, maxDepth));
            }
            return functionAsList;
        }
        else {
            return [randomSymbol];
        }
    }

    // Generate tree, compile to string, compile to program
    this.growRandomProgram = function(functionSet, terminalSet, maxDepth) {
        var newProgram = new Program();
        var newProgramJsExpr = newProgram.jsExpr;
        var treeDepth = Math.ceil(Math.random() * maxDepth);
        newProgram.jsExpr = this.depthFirstGrowTree(0, functionSet, terminalSet, treeDepth);
        newProgram.compile();
        return newProgram;
    }

    // Creates a randomPopulation
    this.growRandomPopulation = function(functionSet, terminalSet, maxDepth, populationSize) {
        var population = [];
        for (var i = 0; i < populationSize; ++i) {
            population.push(this.growRandomProgram(functionSet, terminalSet, maxDepth));
        }
        return population;
    }

    this.getSubtreeEndIndex = function(symbolIndex, jsExpr) {
        var symbol = jsExpr[symbolIndex.index];
        if (this.isSymbolFunction(symbol)) {
            var numArguments = symbol[1];
            for (var i = 0; i < numArguments; ++i) {
                symbolIndex.index += 1;
                this.getSubtreeEndIndex(symbolIndex, jsExpr);
            }
        }
        return symbolIndex.index;
    }

    // Take random nodes in parents and crossover subtrees
    this.crossover = function(parentProgram1, parentProgram2) {
        var jsExpr1 = parentProgram1.jsExpr;
        var jsExpr2 = parentProgram2.jsExpr;
		
		// Prevent copying first 
		var dontAffectFirst = Math.min(3,jsExpr1.length - 1);
		var dontAffectFirst2 = Math.min(3,jsExpr2.length - 1);
        var crossPoint1 = Math.floor(Math.random() * (jsExpr1.length-dontAffectFirst)) + dontAffectFirst;
        var crossPoint2 = Math.floor(Math.random() * (jsExpr2.length-dontAffectFirst2)) + dontAffectFirst2;
        var range1 = [crossPoint1, this.getSubtreeEndIndex(new StatefulIndex(crossPoint1), jsExpr1)];
        var range2 = [crossPoint2, this.getSubtreeEndIndex(new StatefulIndex(crossPoint2), jsExpr2)];

        var offspring = new Program();
        // Combine: start of from start of parent1 to crossPoint,
        // Subtree of expression 2
        // and end of expression 1 again
        offspring.jsExpr = jsExpr1.slice(0, range1[0]);
        // +1 since slice is not end-inclusive
        offspring.jsExpr = offspring.jsExpr.concat(jsExpr2.slice(range2[0], range2[1] + 1));
        offspring.jsExpr = offspring.jsExpr.concat(jsExpr1.slice(range1[1] + 1));
        offspring.compile();
        return offspring;
    }

    // Randomly mutates a program
	// Stateful
    this.mutate = function(program, functionSet, terminalSet) {
		var maxDepth = 4;
		var crossPoint = Math.floor(Math.random() * program.jsExpr.length);
		var range = [crossPoint, this.getSubtreeEndIndex(new StatefulIndex(crossPoint), program.jsExpr)];
        var treeDepth = Math.ceil(Math.random() * maxDepth);
        
		var mutantProgram = new Program();
		var mutantSubtree = this.depthFirstGrowTree(0, functionSet, terminalSet, treeDepth);
		mutantProgram.jsExpr = program.jsExpr.slice(0, range[0]);
		mutantProgram.jsExpr = mutantProgram.jsExpr.concat(mutantSubtree);
		mutantProgram.jsExpr = mutantProgram.jsExpr.concat(program.jsExpr.slice(range[1]+1));
		mutantProgram.compile();
		return mutantProgram;
    }

    this.selectTournamentBestIndex = function(population, tourSize) {
        var populationSize = population.length;
        var bestCost = 1E9;
        for (var j = 0; j < tourSize; ++j) {
            var tourIndex = (Math.floor(Math.random() * populationSize));
            var cost = population[tourIndex].cost;
            if (isFinite(cost) && !isNaN(cost) && (cost < bestCost)) {
                bestCost = cost;
                bestProgramIndex = tourIndex;
            }
        }
        return bestProgramIndex;
    }

    this.main = function(guid) {
        // Parameters
        var numGenerations = 100;
        var numGenerationsPerSave = 20;
        var numElite = 2;
        var populationSize = 50;
        var mutationRate = 0.45;
        var programDepth = 3;
        var numGenerationsBeforeMigration = 50;
        var numToMigrate = 5;

        // Function and Terminal sets
        var functionSet = [['add', 2], ['minus', 2], ['div', 2], ['mul', 2], ['Math.cos', 1]];
        var terminalSet = [['x', -1], ['y', -1]];

        // Initialise population (from scratch or load
        var generation = 0;
        // TODO2: Do notalways start from scratch
        //var generation = loadData('regional', 'generation');
        var population;
        if (generation === 0) {
            population = this.growRandomPopulation(functionSet, terminalSet, programDepth, populationSize)
        }
        else {
            // TODO2: saveData regionally
            // Blocking/Non Blocking?
            var population = loadData('regional', 'population');
        }

		var bestEverProgram;
		var bestEverCost = 1E9;

        for (var generation = 0; generation < numGenerations; ++generation) {
			var bestCost = 1E9;
			var bestIndex;
            for (var i = 0; i < populationSize; ++i) {
                var program = population[i];
                program.cost = (program.jsExpr.length < 20) && (program.jsExpr.length > 3) ? this.findFitness(program) : 1E9;
				if (program.cost < bestCost) {
					bestCost = program.cost;
					bestIndex = i;
				}
				if(program.cost < bestEverCost) {
					bestEverCost = program.cost;
					bestEverProgram = program;
					console.log("BEST EVER " + bestEverCost);
					console.log(program.jsString);
				}
            }

            // Generate tour
            var newPopulation = [];
            var tourSize = 2;
            for (var i = 0; i < populationSize; ++i) {
                var mumIndex = this.selectTournamentBestIndex(population, tourSize);
                var dadIndex = this.selectTournamentBestIndex(population, tourSize);
                var offspring = this.crossover(population[mumIndex], population[dadIndex]);
                if (Math.random() < mutationRate) {
                    offspring = this.mutate(offspring, functionSet, terminalSet);
                }
				offspring.compile();
                newPopulation.push(offspring);
            }

            population = newPopulation;

            var migrationPopulation;
            //TODO2: saveData('regional', migrationPopulation);
            if (this.doCleanUp === true) {
                // TODO2: Save to regional
                break;
            }
        }
    }
}

// Program object, stores program in three different
// representations for 1) manipulation 2) execution
function Program() {
    this.jsString = "";
    this.jsExpr = [];
    this.__dirty = true;

	this.execute = function() {
		if (this.__dirty === true) {
			this.compile();
		}
		return program();
	}
    // Avoid unnecessarily recompiling program
    // Compile jsExpr to jsString then string to executable functon
    this.compile = function() {
        if (this.__dirty === true) {
            this.jsString = this.programListToJsString(this.jsExpr);
            //TODO, make this draw from terminal set by 1) hacking function constructor 2) passing in data object and modifying jsString
            this.program = new Function("x", "y", this.jsString);
        }
        this.__dirty = false;
    }

    this.isSymbolFunction = function(symbol) {
        if (symbol[1] >= 0) {
            return true;
        }
        else {
            return false;
        }
    }

    this.processSymbols = function(symbolIndex, jsExpr) {
        var symbol = jsExpr[symbolIndex.index];
        var functionAsString = "";
        if (this.isSymbolFunction(symbol)) {
            functionAsString += symbol[0] + "(";
            var numArguments = symbol[1];
            for (var i = 0; i < numArguments; ++i) {
                symbolIndex.index += 1;
                functionAsString += this.processSymbols(symbolIndex, jsExpr);
                if (i != numArguments - 1) {
                    functionAsString += ",";
                }
            }
            functionAsString += ")";
            return functionAsString;
        }
        else {
            return symbol[0];
        }
    }

    // Converts a programList (similar to s-expression)
    // To javascript function
    this.programListToJsString = function(jsExpr) {
        statefulIndex = new StatefulIndex(0);
        return "return " + this.processSymbols(statefulIndex, jsExpr);
    }
}

function StatefulIndex(startIndex) {
    this.index = startIndex;
}

function add(x, y) {
    return x + y;
}

function minus(x, y) {
    return x - y;
}

function div(x, y) {
    return x / y;
}

function mul(x, y) {
    return x * y;
}

function zif(x, y, z) {
    // zif()
    }

f = new Program();
a = f.programListToJsString('ok');
console.log(a);
g = new Function("x", "y", a);

job = new Job();
// job.main();

// Todo implement TOdo1, and get symbolic regression
// Extend to case where we need data, e.g. image segmentation
// Questions:
// How to resume (quickly)
// Want to periodically save data to local storage
// And perhaps less periodically save data to regional storage
// How to ensure random migration
// Decide whether to randomly seed or load data
// will check regional server for datastored in bucket jobId-generation
// How to ensure other jobs cant interfere?
// How will this get set
// By last job in generation
// A better way could be to make the whole thing an object
// Make the message change the state of the object
// Have an event which is on state change co

// ERPS ---
// 
// // Bernoulli distribution
// var flip = function(weight) {
// 	return Math.random() < weight ? true : false;
// }
// 
// // Return a random integer between 0 and n-1.
// // n: the number of values possible
// // Returns: an integer between 0 and n-1
// var sampleInteger = function(n) {
// 	return Math.floor(Math.random() * n);
// }
// 
// // Stochastic operators ---
// var sIf = function(noiseLevel, predicate, consequent, alternate) {		
// 	noisyPredicate = flip(noiseLevel) ? predicate : !predicate;
// 	if (noisyPredicate) {
// 		return consequent ;
// 	}
// 	else {
// 		return alternate;
// 	}
// }
// 
// 
// // Query ---
// 
// // Rejection sampling based query
// var query = function(expression, predicate) {
// 	var val = eval(expression); // or = expression() return [a,b,c], how to get a,b,c
// 	if (predicate(val) === true) {
// 		return val;
// 	}
// 	else {
// 		return query(expression, predicate);
// 	}
// }
// 
// // Lexicalised sampling based query
// var lexQuery = function(lexicons, expression, predicate) {
// 	var evaluatedLexicons = [];
// 	for (var i=0;i<lexicons.length;++i) {
// 		evaluatedLexicons[i] = lexicons[i]();
// 	}
// 	var val = expression.apply(this,evaluatedLexicons);
// 	if (predicate.apply(this,val) === true) {
// 		return val;
// 	}
// 	else {
// 		return lexQuery(lexicons, expression, predicate);
// 	}
// }
// 
// // Helpers
// 
// var runJsExpr = function(jsExpr) {
// 	var program = new Program();
// 	program.jsExpr = jsExpr;
// 	program.compile();
// 	return program.program();
// }
// 
// 
// // Reepats expression numTimes times and returns list of results
// var repeat = function(expression, numTimes) {
// 	var results = [];
// 	for (var i=0;i<numTimes;++i) {
// 		results.push(expression());
// 	}
// 	return results;
// }
// 
// var hist = function(list) {
// 	var histogram = {};
// 	for (var i=0;i<list.length;++i) {
// 		if(list[i] in hist) {
// 			histogram[list[i]] += 1;
// 		}
// 		else {
// 			histogram[list[i]] = 1;
// 		}
// 	} 
// 	return histogram;
// }
// 
// // Examples --
// var pairFlip = function() {
// 	return query("[flip(), flip()]", function(pair) {return ((pair[0] === true) || (pair[1] == true)) ? true : false;});
// }
// 
// var abcCoinFlip = function() {
// 	return lexQuery(
// 		[function() {return flip(0.5);}, function() {return flip(0.5);},function() {return flip(0.5);}],
// 		function(a,b,c) {return [a,b,c];},
// 		function(a,b,c) {return (c || (a && (!b))) ? true : false}
// 	)
// }
// 
// var genExp = function() {
// 	if (flip(0.4)) {
// 		return [flip(0.5) ? ["add",2]:["minus",2]].concat(genExp(),genExp());
// 	}
// 	else {
// 		return [[1 + sampleInteger(10),-1]];
// 	}
// }
// 
// var inductProgram = function() {
// 	return lexQuery([function() {return genExp()}],
// 					function(exp) {return [exp]},
// 					function(exp) {return runJsExpr(exp) == 24})
// }
// // 
// // (lex-query ’((exp (gen-exp))) ’exp
// // ’(begin (equal? (eval exp (get-current-environment)) 24) )
// 
// var results = repeat(abcCoinFlip, 1000);
// var histogram = hist(results);
// 
// var resultsInduction = repeat(inductProgram, 100);
// var histogramInduction = hist(resultsInduction);