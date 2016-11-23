var hylarWorker = new Worker("worker.js");

hylarWorker.onmessage = function(event) {
	if (event.data.action === "stream") {
		appendResult(event.data.partial.toString());
	} else if (event.data.action === "classify") {
		console.log("Classif finie");
	} else if (event.data.action === "query") {
		console.log(event.data);
	}
};

function clear() {
	document.getElementById("results").innerHTML = "";
};

function appendResult(result) {
	document.getElementById("results").innerHTML += (result.replace(/</g, '&lt;').replace(/>/g, '&gt;') + "<br/>");
};

function classify() {
	clear();
	hylarWorker.postMessage({
		action: "classify",
		ontologyTxt: document.getElementById("texte").value,
		mimeType: "application/ld+json",
		keepOldValues: true
	})
};

function query() {
	clear();
	hylarWorker.postMessage({
		action: "query",
		query: document.getElementById("sparql").value
	})
};
