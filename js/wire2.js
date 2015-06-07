
// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = cookie.get('cacheit_sessionToken');

// Initialize our CacheIT Library containing our reusable code.
var Cache = CacheIt(appId,apiKey);

Cache.isLoggedIn(sessionToken, function(data, err){
    if(err){
        window.location.href = "login.html";
        return err;
    }
});

// Get the totals and percentage
function getTotalData(cb){
    var req = new XMLHttpRequest();

    // Request Handler
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj = JSON.parse(req.responseText);
                //console.log(tmpObj.results);
                cb(tmpObj.results, false);
            } else {
                //console.log("Error: ", req.statusText); // Error Message
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
    var pMarket = Cache.getMarketPrice(function(lData){
        //console.log(lData);
        var gAsk = document.getElementById('gold-ask');
        var gBid = document.getElementById('gold-bid');

        gAsk.innerHTML = (lData[0].ask).toFixed(2);
        gBid.innerHTML = (lData[0].bid).toFixed(2);
        Cache.toggleClass('gold-change','pos-change','neg-change', lData[0].oneDayChange);

        var sAsk = document.getElementById('silver-ask');
        var sBid = document.getElementById('silver-bid');


        sAsk.innerHTML = (lData[1].ask).toFixed(2);
        sBid.innerHTML = (lData[1].bid).toFixed(2);
        Cache.toggleClass('silver-change','pos-change','neg-change', lData[1].oneDayChange);

        var pAsk = document.getElementById('platinum-ask');
        var pBid = document.getElementById('platinum-bid');

        pAsk.innerHTML = (lData[2].ask).toFixed(2);
        pBid.innerHTML = (lData[2].bid).toFixed(2);
        Cache.toggleClass('platinum-change','pos-change','neg-change', lData[2].oneDayChange);

        document.getElementById('market-list-loader').style.visibility = "hidden";
    });

    /****************************
    * Get Total                 *
    ****************************/
    pMarket.then(function(err, lData){
        if(err){ console.error(err); return err;}

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

            /****************************************
            * Get Metal Prices using promises       *
            ****************************************/
            // Get the current date and the date 30 days into the past
            var curTime = new Date();
            var prevTime = new Date();
            prevTime.setDate(curTime.getDate()-30);
            var currentDate = Cache.formatTime(curTime);
            var previousDate = Cache.formatTime(prevTime);

            // Reduce Load Time by through parallel requests using promises
            var p1 = Cache.getMetalPrice('gold',previousDate,currentDate);
            var p2 = Cache.getMetalPrice('silver',previousDate,currentDate);
            var p3 = Cache.getMetalPrice('platinum',previousDate,currentDate);

            promise.join([p1,p2,p3]).then(function(results){
                // Handle Error
                if(results[0][0] || results[0][0] || results[0][0] ){
                    zingchart.render({
                        id:'chartDiv',
                        height:455,
                        width:"100%",
                        data: Cache.chartDown// Load the error message for the chart if metal price is down.
                    });
                    return null;
                }

                zingchart.render({
                    id:'chartDiv',
                    height:455,
                    width:"100%",
                    data: myChart2(tData[0], results[0][1], results[1][1], results[2][1],previousDate,currentDate)
                });
            });
        });

    });
    updateTime();
}


// Opening Closing time calculations
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
    } else if (nyTime.getUTCDay() == 6) { // Saturday
        nyTimeOpen.setDate(nyTimeOpen.getDate() + 2);
        nyTimeOpen.setUTCHours(7);
        marketOpenEl.innerHTML = "Market is close";
        timeString = 'opening in ' + getHourDiff(nyTime, nyTimeOpen) + 'h ' + ('0' + (60 - nyTime.getUTCMinutes())).slice(-2) + 'm';
    } else { //Monday - Friday
        if (nyTime.getUTCHours() >= 8 && nyTime.getUTCHours() <= 17) {
            marketOpenEl.innerHTML = "Market is open";
            nyTimeOpen.setUTCHours(17);
            timeString = 'closing in ' + getHourDiff(nyTime, nyTimeOpen) + 'h ' + ('0' + nyTime.getUTCMinutes()).slice(-2) + 'm';
        } else {
            marketOpenEl.innerHTML = "Market is close";
            nyTimeOpen.setUTCHours(8);
            timeString = 'opening in ' + getHourDiff(nyTime, nyTimeOpen) + 'h ' + ('0' + (60 - nyTime.getUTCMinutes())).slice(-2) + 'm';
        }
    }
    var timeEl = document.getElementsByClassName('market-time')[0];
    timeEl.innerHTML = timeString;
}


function getOffset(offset) {
    return new Date(new Date().getTime() + offset * 3600 * 1000);
}

function getHourDiff(date1, date2) {
    return Math.abs(date1 - date2) / 36e5;
}
