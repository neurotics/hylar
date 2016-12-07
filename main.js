var hylarWorker = new Worker("worker.js");

// Worker messages handler
hylarWorker.onmessage = function(event) {
	if (event.data.action === "stream") {
		// On incomplete results... (returns turtle-ized triples)
		appendResult(event.data.partial.toString());
	} else if (event.data.action === "classify") {
		// On successful classification... (returns true)
		appendResult(JSON.stringify(event.data));
		console.log("Classif finie");
	} else if (event.data.action === "query") {
		// On successful query answering... (returns SPARQL query results)
		appendResult(JSON.stringify(event.data));
		console.log(event.data);
	}
};

// Executes the JSON-LD ontology classification onto the HyLAR worker
function classify() {
	clear();
	hylarWorker.postMessage({
		action: "classify",
		ontologyTxt: document.getElementById("texte").value,
		mimeType: "application/ld+json",
		keepOldValues: true
	})
};

// Launches a SPARQL query onto the HyLAR worker
function query() {
	clear();
	hylarWorker.postMessage({
		action: "query",
		query: document.getElementById("sparql").value
	})
};

// View update functions
function clear() {
	document.getElementById("results").innerHTML = "";
};
function appendResult(result) {
	document.getElementById("results").innerHTML += (result.replace(/</g, '&lt;').replace(/>/g, '&gt;') + "<br/>");
};
