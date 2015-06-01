// API ID and API Key for parse
var appId = 'iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W';
var apiKey = 'xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1';
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';
var TROY = 31.1034768;
var coinId = 'cr1B03e4N2';
var currentMetal;
var marketPrice;

//Get and set coin table data
function getTableData(id) {
    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                var Cache = CacheIt(appId, apiKey);
                Cache.getMarketPrice(function(data, err){
                    if(err){
                        console.log("Oh no an error!");
                        return err;
                    }
                    
                    // Parse the string into a JSON obj
                    var tmpObj = JSON.parse(req.responseText);

                    console.log(tmpObj.metal);
                    switch(tmpObj.metal) {
                        case 'Gold':
                            marketPrice = data[0].bid;
                            break;
                        case 'Silver':
                            marketPrice = data[1].bid;
                            break;
                        case 'Platinum':
                            marketPrice = data[2].bid;
                            break;
                    }

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

                    var marketprice = document.getElementById('marketprice');
                    marketprice.innerHTML = marketPrice;

                    var percent = document.getElementById('percent');
                    percent.innerHTML = tmpObj.metal + ' %';

                    var percentdata = document.getElementById('percentdata');
                    percentdata.innerHTML = tmpObj.percent;

                    var weightdata = document.getElementById('weightdata');
                    weightdata.innerHTML = tmpObj.weight;

                    var perunit = document.getElementById('perunit');
                    perunit.innerHTML = 'Weight/unit (' + tmpObj.metal + ')';

                    var perunitdata = document.getElementById('perunitdata');
                    perunitdata.innerHTML = (tmpObj.weight / marketPrice).toFixed(5);

                    var total = document.getElementById('total');
                    total.innerHTML = (marketPrice * tmpObj.weight * tmpObj.percent).toFixed(2);

                    var img = document.getElementById('coin-img');
                    img.src = tmpObj.image.url;
                });


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
    getTableData(coinId);
};
