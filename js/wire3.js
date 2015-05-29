// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';
var currentMetal = 'gold';
var TROY = 0.911458333;

// Get the totals and percentage
function getTotalData(cb){
    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(req.responseText);
                console.log(tmpObj.results);
                cb(tmpObj.results, false);
            } else {
                console.log("Error: ", req.statusText); // Error Message
                cb(req.statusText, true);
            }
        }
    };

    // Open the request with the Url Encoded String for login
    req.open("GET", "https://api.parse.com/1/classes/Overview", true);

    // Set Request Header for Parse
    req.setRequestHeader("X-Parse-Application-Id", appId);
    req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
    req.setRequestHeader("X-Parse-Session-Token", sessionToken);
    req.send(); // Finally send the request
}


// Gets the Ask, Bid price and calculates change from a live data feed (monex.com)
// through my proxy server cse134b.herokuapp.com
function getLiveData (cb){
    var req = new XMLHttpRequest();
    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(req.responseText);
                cb(tmpObj, false);
                // console.log(tmpObj);
                console.log("DOM: ");
                var dailyPercent = document.getElementById('daily-percent');
                var dpVal = tmpObj[0].oneDayPercentChange;
                if(dpVal>=0){
                    dailyPercent.className = "pos-change-main";
                    dailyPercent.innerHTML='+'+dpVal.toFixed(2)+'%';
                } else {
                    dailyPercent.className = "neg-change";
                    dailyPercent.innerHTML=dpVal.toFixed(2)+'%';
                }

                var overall = document.getElementById('overall-percent');
                var overallVal = tmpObj[0].yearToDatePercentChange;
                if(overallVal>=0){
                    overall.className = "pos-change-main";
                    overall.innerHTML='+'+overallVal.toFixed(2)+'%';
                } else {
                    overall.className = "neg-change";
                    overall.innerHTML='-'+overallVal.toFixed(2)+'%';
                }




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
                cb(req.statusText, true);
            }
        }
    };

    // Open the request with the Url Encoded String for login
    req.open("GET", "http://cse134b.herokuapp.com/jm", true);
    req.send(); // Finally send the request
}

// Append Coin data to a row
function appendRow(id, data) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var imageNode = document.createElement("img");

    tr.id = data.objectId; // Add objectId to row for lookup
    tr.setAttribute('updatedat', data.updatedAt); // Add timestamp to row for lookup

    imageNode.src = data.image.url;
    imageNode.className = 'coin_mini';
    imageNode.width = 64;
    td.className = 'stack_img_col'
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


// Gets the Ask, Bid price and calculates change from a live data feed (monex.com)
// through my proxy server cse134b.herokuapp.com
function getTableData(query, cb) {
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
    req.open("GET", "https://api.parse.com/1/classes/coin?where="+JSON.stringify({metal:query}), true);

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

    // Get ask, bid, change for Overview Panel

    getLiveData(function(liveData){
        // Set loader div to hidden since were loaded
        document.getElementById('mloader').style.visibility = "hidden";

        var currentPrice = 0;
        var totalString = '';

        switch(currentMetal.toLowerCase()){
            case 'gold':
            currentPrice = liveData[0].bid;
            totalString = 'totalGold';
            break;
            case 'silver':
            currentPrice = liveData[1].bid;
            totalString = 'totalSilver';
            break;
            case 'platinum':
            currentPrice = liveData[2].bid;
            totalString = 'totalPlatinum';
            break;
        }

        // Get Total for Overview Panel
        getTotalData(function(data, err){
            if(err) { return console.log(err); }// Handle Error

            var totalPanelElement = document.getElementById('total-value')
            var totalElement = totalPanelElement.getElementsByClassName('total-dollars')[0];
            var metalTotal = data[0][totalString];
            totalElement.innerHTML = '$'+(metalTotal*currentPrice).toFixed(2);
        });

        // Get coin data for table, require current price to calculate value
        getTableData(currentMetal, function(rowData) {
            rowData.forEach(function(object, key) {
                // 1oz = 0.911458333 ozt
                object.value = (object.weight * TROY * object.percent * currentPrice ).toFixed(2);
                appendRow('table-data', object);
            });
            // Set loader div to hidden since were loaded
            document.getElementById('tloader').style.visibility = "hidden";
        });
    });



    // Load Up the zingchart
    zingchart.render({
        id:'chartDiv',
        height:455,
        width:"100%",
        data:chartData
    });

};
