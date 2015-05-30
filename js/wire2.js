
// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';
var TROY_PER_GRAM = 0.0321507466;

//Get the metal prices from a start to end date
function getMetalPrice(metal, start, end, cb)
{
    var json_url = "https://www.quandl.com/api/v1/datasets/WSJ/"; // there is a daily limit of 50 connections for unregistered users. You can create an account and add your security token like: https://www.quandl.com/api/v1/datasets/WSJ/PL_MKT.csv?auth_token=933vrq6wUfABXEf_sgH7&trim_start=2015-05-01 However the security is updated daily. Also you can use your own, or third party proxy like http://websitescraper.herokuapp.com/?url=https://www.quandl.com/api/v1/datasets/WSJ/AU_EIB.csv for additional 50 connections. This proxy will accept any url and return you the data, also helping to deal with same origin policy
    switch (metal) {
        case 'gold':
        json_url+="AU_EIB";
        break;
        case 'silver':
        json_url+="AG_EIB";
        break;
        case 'platinum':
        json_url+="PL_MKT";
        break;
    }
    json_url+=".csv?auth_token=933vrq6wUfABXEf_sgH7&trim_start="+start;
    if(end){
        json_url+="&trim_end="+end;
    }
    getCSV(json_url, cb);
}

//Get the csv
function getCSV(url, cb) {
    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                cb(csvArray(req.responseText), false);
            } else {
                console.log("Error: ", req.statusText); // Error Message
                cb(req.statusText, true);
            }
        }
    };

    // Open the request with the Url Encoded String for login
    req.open("GET", url, true);
    // Set Request Header
    req.setRequestHeader("Accept", 'text');
    req.send(); // Finally send the request
}

//CSV to JSON used in the monex scrapper
function csvArray(csv) {
    var lines = csv.split("\n");
    var result = [];

    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(",");

        result.push([currentline[0],parseInt(currentline[1])]);
    }

    // Remove the uwanted empty string and NaN at the end
    if(result[result.length-1]) { result.pop(); }

    return result.reverse(); //JSON
}

// Get the totals and percentage
function getTotalData(id, cb){
    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(req.responseText);
                console.log(tmpObj);
                cb(tmpObj, false);
            } else {
                console.log("Error: ", req.statusText); // Error Message
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
                console.log("DOM: ");
                /*
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

*/
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


// Timestamp table look up only refresh certain row
// Loop through table, check timestamp of each row,
// if it's changed replace the element, if not continue,
// if the element does not exist, append
window.onload = function() {

    // Get the live data required to calculate table and overview panel data
    getLiveData(function(liveData){

        var currentPrice = 0;
        var totalString = '';
		

        // Get Total for Overview Panel
        getTotalData('sV6tdOBQCe', function(data, err){
            if(err) { return console.log(err); }// Handle Error

            var totalElement = document.getElementsByClassName('total-dollars')[0];
            var metalTotal = data[totalString];
            totalElement.innerHTML = '$'+((data.totalGold*liveData[0])+(data.totalSilver*liveData[1])
            							+(data.totalPlatinum*liveData[2])).toFixed(2);
			
            getMetalPrice('gold','2015-05-11','2015-05-29', function(marketData, err){
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
                   /* zingchart.render({
                        id:'chartDiv',
                        height:455,
                        width:"100%",
                        data: myChart(data, marketData,"2015-05-11","2015-05-29")
                        });*/
                    });
                });

               });




        };