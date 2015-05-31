// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';
var TROY = 0.911458333;
var coinId = "iG7BDqvF25";
var currentMetal;

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



// Gets the Ask, Bid price and calculates change from a live data feed (monex.com)
// through my proxy server cse134b.herokuapp.com
function getTableData(id) {
    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(req.responseText);

                var metal = document.getElementById('metal');
                metal.innerHTML = tmpObj.metal;

                var type = document.getElementById('type');
                type.innerHTML = tmpObj.item;

                var date = document.getElementById('date');
                date.innerHTML = tmpObj.createdAt;

                var quantity = document.getElementById('qty');
                quantity.innerHTML = tmpObj.quantity;

                var premium = document.getElementById('premium');
                premium.innerHTML = tmpObj.premium;

                var unitprice = document.getElementById('unitprice');
                unitprice.innerHTML = tmpObj.unitPrice;

                var metalpercent = document.getElementById('metalpercent');
                metalpercent.innerHTML = tmpObj.metal + ' %';

                var percent = document.getElementById('percent');
                percent.innerHTML = tmpObj.percent;

                var metalweight = document.getElementById('metalweight');
                metalweight.innerHTML = 'Weight/unit (' + tmpObj.metal + ')';

                var weightunit = document.getElementById('weightunit');
                percent.innerHTML = tmpObj.weight / unitprice;

                var metalunit = document.getElementById('metalunit');
                metalunit.innerHTML = tmpObj.metal + ' ' + tmpObj.metal.charAt(0) + '/u';

                var perunit = document.getElementById('perunit');
                perunit.innerHTML = 'derp';

                var metalozt = document.getElementById('metalozt');
                metalozt.innerHTML = tmpObj.metal + ' ozt/u';

                var totalmetal = document.getElementById('totalmetal');
                totalmetal.innerHTML = 'derp';

                var total = document.getElementById('total');
                total.innerHTML = 'derp';

            } else {

                console.log("Error: ", req.statusText); // Error Message
            }
        }
    };

    // Open the request with the Url Encoded String for login
    req.open("GET", "https://api.parse.com/1/classes/coin/" + id, true);

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

    getLiveData(function(liveData){

        // Get coin data for table, require current price to calculate value
        getTableData(coinId);
    });
};
