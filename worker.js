importScripts('hylar-client.js');
importScripts('q.js');

var hylar = new Hylar(),
	q = Q;

Function.prototype.clone = function() {
    var that = this;
    var temp = function temporary() { return that.apply(this, arguments); };
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

Solver.handledEvaluation = Solver.evaluateThroughRestriction.clone();

Solver.evaluateThroughRestriction = function(rule, facts) {
    var mappingList = this.getMappings(rule, facts),
        consequences = [], deferred = q.defer(),
        substitution;

    try {
        this.checkOperators(rule, mappingList);

        for (var i = 0; i < mappingList.length; i++) {
            if (mappingList[i]) {
                // Replace mappings on all consequences
                for (var j = 0; j < rule.consequences.length; j++) {
                	substitution = this.substituteFactVariables(mappingList[i], rule.consequences[j], []);
                    consequences.push(substitution);
                    postMessage({
                    	action: "stream",
                    	partial: ParsingInterface.factToTurtle(substitution)
                    });
                }
            }
        }
        deferred.resolve(consequences);
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

onmessage = function(event) {
	var returnValue;
	switch(event.data.action) {
		case "classify":
			hylar
				.load(event.data.ontologyTxt, event.data.mimeType, event.data.keepOldValues)
				.then(function (done) {
					returnValue = done;
					returnValue.action = "classify";				
					postMessage(returnValue);
				});
			break;
		case "query":
			hylar
				.query(event.data.query)
				.then(function (done) {
					returnValue = done;
					returnValue.action = "query";									
					postMessage(returnValue);
				});
			break;
		default:
			console.error("Action not recognized.");			
	}
}