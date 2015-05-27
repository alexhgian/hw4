function updateTable (){
    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(req.responseText);
                console.log(tmpObj);
                var askNode = document.getElementById('ask');
                askNode.innerHTML=tmpObj[0].ask;

                var bidNode = document.getElementById('bid');
                bidNode.innerHTML=tmpObj[0].bid;

                var changeNode = document.getElementById('change');
                var diff = (tmpObj[0].bid-tmpObj[0].ask).toFixed(2);

                if(diff>=0){
                    changeNode.className = "pos-change";
                    changeNode.innerHTML='+'+diff;
                } else {
                    changeNode.className = "neg-change";
                    changeNode.innerHTML=diff;
                }
            } else {
                console.log("Error: ", req.statusText); // Error Message
            }
        }
    };

    // Open the request with the Url Encoded String for login
    req.open("GET", "http://cse134b.herokuapp.com", true);
    req.send(); // Finally send the request
}
updateTable();

function appendRow(id, data) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var imageNode = document.createElement("img");

    tr.id = data.objectId; // Add objectId to row for lookup
    tr.setAttribute('updatedat', data.updatedAt); // Add timestamp to row for lookup

    imageNode.src = data.image.url;
    imageNode.className = 'coin-img';
    imageNode.width = 64;
    td.appendChild(imageNode);
    tr.appendChild(td);
    delete data.image;

    var tmpArr = [data.item, data.quantity, data.weight, data.percent, data.value];
    tmpArr.forEach(function(val, key) {
        var textNode = document.createTextNode(val);
        var td = document.createElement("td");

        td.appendChild(textNode);
        tr.appendChild(td);
    });

    document.getElementById(id).appendChild(tr);
}

function getData(cb) {
    var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
    var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";

    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(req.responseText);
                console.log(tmpObj.results);
                cb(tmpObj.results);
            } else {

                console.log("Error: ", req.statusText); // Error Message
            }
        }
    };

    // Open the request with the Url Encoded String for login
    req.open("GET", "https://api.parse.com/1/classes/coin", true);

    // Set Request Header for Parse
    req.setRequestHeader("X-Parse-Application-Id", appId);
    req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
    req.send(); // Finally send the request
}

// Timestamp table look up only refresh certain row
// Loop through table, check timestamp of each row,
// if it's changed replace the element, if not continue,
// if the element does not exist, append
window.onload = function() {
    getData(function(data) {
        console.log(data);
        data.forEach(function(val, key) {

            appendRow('table-data', val);
        });
    });
    
    zingchart.render({
        id:'chartDiv',
        height:455,
        width:"100%",
        data:chartData
    });
    console.log(document.getElementById('chartDiv-license'));
};
