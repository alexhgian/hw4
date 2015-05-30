// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';
var currentMetal = 'gold';
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
                console.log("Error: ", req.statusText); // Error Message
                cb(req.statusText, true);
            }
        }
    };

    // Open the request with the Url Encoded String for login
    req.open("GET", "http://cse134b.herokuapp.com/jm", true);
    req.send(); // Finally send the request
}


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

function updateTime(){
    var timeString = '';
    // market-time
    var myTime = new Date();

    var marketOpenEl = document.getElementsByClassName('market-open')[0];

    if( myTime.getDay()==1 || myTime.getDay()==6 ){
        marketOpenEl.innerHTML = "Market is close";
        timeString = 'opening in ';

    } else {

        marketOpenEl.innerHTML = "Market is open";
        timeString = 'closing in ';
    }


    var timeEl = document.getElementsByClassName('market-time')[0];

    timeEl.innerHTML = timeString + myTime.getUTCHours()+'h '+myTime.getUTCMinutes()+'m';
}


window.onload = function(){
    getLiveData(function(lData){
        console.log(lData);
        var gAsk = document.getElementById('gold-ask');
        var gBid = document.getElementById('gold-bid');
        var gChange = document.getElementById('gold-change');
        gAsk.innerHTML = (lData[0].ask).toFixed(2);
        gBid.innerHTML = (lData[0].bid).toFixed(2);
        gChange.innerHTML = (lData[0].bid - lData[0].ask).toFixed(2);

        var sAsk = document.getElementById('silver-ask');
        var sBid = document.getElementById('silver-bid');
        var sChange = document.getElementById('silver-change');

        sAsk.innerHTML = (lData[1].ask).toFixed(2);
        sBid.innerHTML = (lData[1].bid).toFixed(2);
        sChange.innerHTML = (lData[1].bid - lData[1].ask).toFixed(2);

        var pAsk = document.getElementById('platinum-ask');
        var pBid = document.getElementById('platinum-bid');
        var pChange = document.getElementById('platinum-change');

        pAsk.innerHTML = (lData[2].ask).toFixed(2);
        pBid.innerHTML = (lData[2].bid).toFixed(2);
        pChange.innerHTML = (lData[2].bid - lData[2].ask).toFixed(2);


        getTotalData(function(tData){

            // Total Metal
            var total = ((lData[0].bid*tData[0].totalGold) +
            (lData[1].bid*tData[0].totalSilver) +
            (lData[2].bid*tData[0].totalPlatinum)).toFixed(2)


            var totalEl = document.getElementsByClassName('total-dollars')[0];
            totalEl.innerHTML='$'+total;


            // Total Percentage
            var percent = (lData[0].oneDayPercentChange+lData[1].oneDayPercentChange+lData[2].oneDayPercentChange)/3;

            var percentEl = document.getElementsByClassName('total-change')[0];
            percentEl.innerHTML = percent.toFixed(2)+'%';

            // Toggle Color if negative or positive
            if(percent<0){
                percentEl.classList.remove("pos-change");
                percentEl.classList.add("neg-change");
            } else {
                percentEl.classList.add("pos-change");
                percentEl.classList.remove("neg-change");
            }

        });
    });
    updateTime();
}
