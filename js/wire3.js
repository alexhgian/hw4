// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';
var currentMetal = 'gold';
var TROY_PER_GRAM = 0.0321507466;

var Cache = CacheIt(appId,apiKey);

// Get the totals and percentage
function getTotalData(id, cb){
    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(req.responseText);
                //console.log(tmpObj);
                cb(tmpObj, false);
            } else {
                //console.log("Error: ", req.statusText); // Error Message
                cb(req.statusText, true);
            }
        }
    };

    // Open the request with the Url Encoded String for login
    req.open("GET", "https://api.parse.com/1/classes/Overview/"+id, true);

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
            } else {
                //console.log("Error: ", req.statusText); // Error Message
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

    if(data.image){
        imageNode.src = data.image.url;
        imageNode.className = 'coin_mini';
        imageNode.width = 64;
        td.className = 'stack_img_col'
        td.appendChild(imageNode);
        tr.appendChild(td);
        delete data.image;
    } else {
        td.appendChild(document.createTextNode(""));
        tr.appendChild(td);
    }




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
    var xhr = new XMLHttpRequest();

    // Request Handler
    xhr.onreadystatechange = function(oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(xhr.responseText);
                //console.log(tmpObj.results);
                cb(tmpObj.results);
            } else {

                //console.log("Error: ", xhr.statusText); // Error Message
            }
        }
    };

    // Open the request with the Url Encoded String for login
    xhr.open("GET", "https://api.parse.com/1/classes/coin?where="+JSON.stringify({metal:query}), true);

    // Set Request Header for Parse
    xhr.setRequestHeader("X-Parse-Application-Id", appId);
    xhr.setRequestHeader("X-Parse-REST-API-Key", apiKey);
    xhr.send(); // Finally send the request
}


// Timestamp table look up only refresh certain row
// Loop through table, check timestamp of each row,
// if it's changed replace the element, if not continue,
// if the element does not exist, append
window.onload = function() {
    // Get the live data required to calculate table and overview panel data
    getLiveData(function(liveData){
        var dpVal = liveData[0].oneDayPercentChange;
        Cache.toggleClass('daily-percent','pos-change-main','neg-change',dpVal.toFixed(2),'%');

        var overallVal = liveData[0].yearToDatePercentChange;
        Cache.toggleClass('overall-percent','pos-change-main','neg-change',overallVal.toFixed(2),'%');

        var askNode = document.getElementById('ask');
        askNode.innerHTML=liveData[0].ask;

        var bidNode = document.getElementById('bid');
        bidNode.innerHTML=liveData[0].bid;

        var diff = (liveData[0].bid-liveData[0].ask).toFixed(2);
        Cache.toggleClass('change','pos-change','neg-change',diff);

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
        getTotalData('sV6tdOBQCe', function(data, err){
            if(err) { return console.log(err); }// Handle Error

            var totalPanelElement = document.getElementById('total-value')
            var totalElement = totalPanelElement.getElementsByClassName('total-dollars')[0];
            var metalTotal = data[totalString];
            totalElement.innerHTML = '$'+(metalTotal*currentPrice).toFixed(2);


            /*
            * Get the current date and the date 30 days into the past
            */
            var curTime = new Date();
            var prevTime = new Date();
            prevTime.setDate(curTime.getDate()-30);
            var currentDate = Cache.formatTime(curTime);
            var previousDate = Cache.formatTime(prevTime);


            getMetalPrice('gold',previousDate,currentDate, function(marketData, err){
                if(err){
                    zingchart.render({
                        id:'chartDiv',
                        height:455,
                        width:"100%",
                        data: {
                            "graphset":[
                                {
                                    "type":"bar",
                                    "labels":[
                                        {
                                            "text":"Sorry, the chart is down! Try again later.",
                                            "vertical-align": "middle",
                                            "width" : 1,
                                            "height" : 1,
                                            "wrap-text":true,
                                            "font-family":"helvetica",
                                            "font-size":"22px",
                                            "shadow":true,
                                            "shadow-distance":"1px",
                                            "shadow-angle":225
                                        }]
                                    }
                                ]
                            }
                        });
                        return err;
                    }
                    // Load Up the zingchart
                    zingchart.render({
                        id:'chartDiv',
                        height:455,
                        width:"100%",
                        data: myChart(data, marketData,previousDate,currentDate)
                    });
                });
            });

            // Get coin data for table, require current price to calculate value
            getTableData(currentMetal, function(rowData) {
                rowData.forEach(function(object, key) {
                    // 1oz = 0.911458333 ozt
                    object.value = (object.weight * TROY_PER_GRAM * object.percent * currentPrice ).toFixed(2);
                    appendRow('table-data', object);
                });
                // Set loader div to hidden since were loaded
                document.getElementById('tloader').style.visibility = "hidden";
            });
        });
    };
