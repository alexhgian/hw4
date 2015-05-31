// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';
var currentMetal = 'gold';
var TROY_PER_GRAM = 0.0321507466;


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

window.onload = function(){

    /****************************
    * Get Live Data From Quandl *
    ****************************/
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

        /****************************
        * Get Total                 *
        ****************************/
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

            /****************************
            * Get Metal Prices          *
            ****************************/
            getMetalPrice('gold','2015-05-20','2015-05-29', function(gData, err){

                getMetalPrice('silver','2015-05-20','2015-05-29', function(sData, err){

                    getMetalPrice('platinum','2015-05-20','2015-05-29', function(pData, err){
                        console.log('Gold: ');
                        console.log('Silver: ');
                        console.log('Platinum: ');
                        console.log(gData);
                        console.log(sData);
                        console.log(pData);
                        console.log('Parse: ');
                        console.log(tData);
                        // Load Up the zingchart
                        zingchart.render({
                            id:'chartDiv',
                            height:455,
                            width:"100%",
                            data: myChart2(tData[0], gData, sData, pData,"2015-05-20","2015-05-29")
                        });
                    });
                });
            });
        });
    });
    updateTime();
}



function updateTime() {
    var timeString = '';
    // market-time

    var nyTime = getOffset(-4);
    var nyTimeOpen = getOffset(-4);
    //startTime.setDate(startTime.getDate() + 1);

    var marketOpenEl = document.getElementsByClassName('market-open')[0];

    if (nyTime.getUTCDay() == 0) { // Sunday
        nyTimeOpen.setDate(nyTimeOpen.getDate() + 1);
        nyTimeOpen.setUTCHours(7);
        marketOpenEl.innerHTML = "Market is close";
        timeString = 'opening in ' + getHourDiff(nyTime, nyTimeOpen) + 'h ' + ('0' + (60 - nyTime.getUTCMinutes())).slice(-2) + 'm';
    } else if (nyTime.getDay() == 6) { // Saturday
        nyTimeOpen.setDate(nyTimeOpen.getDate() + 2);
        nyTimeOpen.setUTCHours(7);
        marketOpenEl.innerHTML = "Market is close";
        timeString = 'opening in ' + getHourDiff(nyTime, nyTimeOpen.setHours(nyTime.getHours() + 8)) + 'h ' + ('0' + (60 - nyTime.getUTCMinutes())).slice(-2) + 'm';
    } else { //Monday - Friday
        if (nyTime.getUTCHours() >= 8 && nyTime.getUTCHours() <= 17) {
            marketOpenEl.innerHTML = "Market is open";
            timeString = 'closing in ' + (17 - nyTime.getUTCHours()) + 'h ' + ('0' + nyTime.getUTCMinutes()).slice(-2) + 'm';
        } else {
            marketOpenEl.innerHTML = "Market is close";
            timeString = 'opening in ' + (nyTime.getUTCHours() + 8) + 'h ' + ('0' + (60 - nyTime.getUTCMinutes())).slice(-2) + 'm';
        }
    }


    var timeEl = document.getElementsByClassName('market-time')[0];
    // var nyTimeEl = document.getElementsByClassName('newyork-time')[0];
    // var open = document.getElementsByClassName('newyork-open-time')[0];

    // nyTimeEl.innerHTML = 'New York Time: ' + nyTime.toUTCString();
    //open.innerHTML = 'Open Date/Time: ' + nyTimeOpen.toUTCString();
    timeEl.innerHTML = timeString;
}


function getOffset(offset) {
    return new Date(new Date().getTime() + offset * 3600 * 1000);
}

function getHourDiff(date1, date2) {
    return Math.abs(date1 - date2) / 36e5;
}
