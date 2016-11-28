importScripts('hylar-client.js');
importScripts('q.js');

var hylar = new Hylar(),
	q = Q;

// Adapter of the evaluation function (to catch new results)
Solver.evaluateThroughRestriction = function(rule, facts) {
    var mappingList = this.getMappings(rule, facts),
        consequences = [], deferred = q.defer(),
        substitution;

    try {
        this.checkOperators(rule, mappingList);

        for (var i = 0; i < mappingList.length; i++) {
            if (mappingList[i]) {
                for (var j = 0; j < rule.consequences.length; j++) {
                	substitution = this.substituteFactVariables(mappingList[i], rule.consequences[j], []);
                    consequences.push(substitution);
                    // Additional postMessage
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

// Handles classification and querying requests
onmessage = function(event) {
	var returnValue;
	switch(event.data.action) {
		case "classify":
			hylar
				.load(event.data.ontologyTxt, event.data.mimeType, event.data.keepOldValues)
				.then(function (done) {					
					postMessage({
						results: done,
						action: "classify"
					});
				});
			break;
		case "query":
			hylar
				.query(event.data.query)
				.then(function (done) {
					postMessage({
						results: done,
						action: "query"
					});
				});
			break;
		default:
			console.error("Action not recognized.");			
	}
}