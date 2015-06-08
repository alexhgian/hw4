///Author: Alex Gian
// Date:
// Mini helper library that we wrote with Parse calls and utilities.

function CacheIt(id, key){
    // Init the parse keys.
    var appId = id || "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
    var apiKey = key ||"xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";

    // Custom Timer Library Variables
    var prevTime;
    var checked = false;
    var hasStarted = false;
    var timer;
    var callbackThreshold = 400;

    // Timer checker, invokes a given callback after a threshold
    function checkTimer(callback) {
        var cb = callback || function() {};
        if (prevTime) {
            var currentTime = new Date();
            var diff = currentTime.getTime() - prevTime.getTime();
            // Do something after 400 threshold is reached
            if (diff > callbackThreshold && checked === false) {
                cb();
                checked = true; // Reset the flag until set
                prevTime.setTime(currentTime);
            }
        }
        timer = setTimeout(function() {
            checkTimer(cb);
        }, callbackThreshold);
    }

    //Get the csv
    function getCSV(url, cb) {

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

    return {
        formatTime : function(dateTime){
            return dateTime.getUTCFullYear() + '-' +
            ('0' + (dateTime.getUTCMonth() + 1)).slice(-2) + '-' +
            ('0' + dateTime.getUTCDate()).slice(-2);
        },
        toggleClass : function(id, c1, c2, value, postfix){
            var pf = postfix || '';
            var toggleNode = document.getElementById(id);
            if(value>0){
                toggleNode.className = c1;
                toggleNode.innerHTML='+'+value+pf;
            } else if (value<0) {
                toggleNode.className = c2;
                toggleNode.innerHTML=value+pf;
            } else {
                toggleNode.className = c1;
                toggleNode.innerHTML=value+pf;
            }
        },
        getClass: function(i, className, option, callback){
            var cb = callback || function() {};
            var p = new promise.Promise();// Create a Promise
            var req = new XMLHttpRequest();
            var id = (i)? '/'+i : '';
            var query = (option.query) ? '?where='+JSON.stringify(option.query) : '';
            console.log('Id: ' + id);
            console.log('Query: ' + query);

            req.onreadystatechange = function(oEvent) {
                if (req.readyState === 4) {
                    if (req.status === 200) { // Handle Success and Failure
                        var tmpObj = JSON.parse(req.responseText);
                        cb(tmpObj, false);
                        p.done(null, tmpObj);// Resolve that Promise!
                    } else {
                        cb(req.statusText, true);
                        p.done(true, req.statusText);// Resolve that Promise!
                    }
                }
            };
            req.open("GET", 'https://api.parse.com/1/classes/'+className+id+query, true);
            req.setRequestHeader("X-Parse-Application-Id", appId);
            req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
            req.setRequestHeader("X-Parse-Session-Token", option.sessionToken);
            req.send();
            return p;// Return the Promise
        },
        delete: function(id, oid, metal, weight, sessionToken, callback){
            cb = callback || function(){};
            var p = new promise.Promise();// Create a Promise
            var req = new XMLHttpRequest();
            req.onreadystatechange = function(oEvent) {
                if (req.readyState === 4) {
                    if (req.status === 200) { // Handle Success and Failure
                        var tmpObj = JSON.parse(req.responseText);
                        cb(tmpObj, false);
                        p.done(null, tmpObj);// Resolve that Promise!
                    } else {
                        cb(req.statusText, true);
                    }
                }
            };
            var overviewBody = {};
            switch(metal.toLowerCase()){
                case 'gold':
                overviewBody={"totalGold":{"__op":"Increment","amount":-weight}};
                break;
                case 'silver':
                overviewBody={"totalSilver":{"__op":"Increment","amount":-weight}};
                break;
                case 'platinum':
                overviewBody={"totalPlatinum":{"__op":"Increment","amount":-weight}};
                break;
            }
            var batchData = {
                'requests':[{
                    'method': 'DELETE',
                    'path': '/1/classes/coin/'+id,
                    'body': overviewBody
                },{
                    'method': 'PUT',
                    'path': '/1/classes/Overview/'+oid,
                    'body': overviewBody
                }]
            };

            req.open("POST", 'https://api.parse.com/1/batch', true);
            req.setRequestHeader("X-Parse-Application-Id", appId);
            req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
            req.setRequestHeader("X-Parse-Session-Token", sessionToken);
            req.setRequestHeader("Content-Type", 'application/json');
            req.send(JSON.stringify(batchData));
            return p;// Return the Promise
        },
        // Gets the Ask, Bid price and calculates change from a live data feed (monex.com)
        // through my proxy server cse134b.herokuapp.com
        // parameters: cb - a callback that returns an obj and err
        getMarketPrice: function(cb){
            var p = new promise.Promise();// Create a Promise
            var req = new XMLHttpRequest();
            // Request Handler
            req.onreadystatechange = function(oEvent) {
                if (req.readyState === 4) {
                    if (req.status === 200) { // Handle Success and Failure
                        // Parse the string into a JSON obj
                        var tmpObj = JSON.parse(req.responseText);
                        cb(tmpObj, false);
                        p.done(null, tmpObj);
                        // console.log(tmpObj);
                    } else {
                        //console.log("Error: ", req.statusText); // Error Message
                        cb(req.statusText, true);
                        p.done(true, req.statusText);
                    }
                }
            };
            // Open the request with the Url Encoded String for login
            req.open("GET", "http://cse134b.herokuapp.com/jm", true);
            req.send(); // Finally send the request
            return p;// Return the Promise
        },
        //Get the metal prices from a start to end date
        getMetalPrice : function(metal, start, end, callback)
        {
            cb = callback || function(){};// NOOP
            var p = new promise.Promise();// Create a Promise
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

            var req = new XMLHttpRequest();
            // Request Handler
            req.onreadystatechange = function(oEvent) {
                if (req.readyState === 4) {
                    if (req.status === 200) { // Handle Success and Failure
                        cb(csvArray(req.responseText), false);
                        p.done(null, csvArray(req.responseText));
                    } else {
                        console.log("Error: ", req.statusText); // Error Message
                        cb(req.statusText, true);
                        p.done(true, req.statusText);
                    }
                }
            };
            // Open the request with the Url Encoded String for login
            req.open("GET", json_url, true);
            // Set Request Header
            req.setRequestHeader("Accept", 'text');
            req.send(); // Finally send the request
            return p;// Return the Promise

        },
        TROY_PER_GRAM : 0.0321507466,

        //Timer Library reset, start, and stop
        resetTimer: function() {
            checked = false;
            prevTime = prevTime || new Date();
            var currentTime = new Date();
            var diff = currentTime.getTime() - prevTime.getTime();
            prevTime.setTime(currentTime);
        },
        initTimer: function(cb) {
            if (!hasStarted) {
                console.log("Timer Started!");
                checkTimer(cb)
            }
            hasStarted = true;
        },
        stopTimer: function() {
            if (timer) {
                console.log("Timer Stoped!");
                clearTimeout(timer);
                hasStarted = false;
            }
        },
        // Uppercase First Letter Util
        upperFirst : function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        isLoggedIn : function(sessionToken, callback){
            var cb = callback || function(){};
            var p = new promise.Promise();// Create a Promise
            var req = new XMLHttpRequest();
            // Request Handler
            req.onreadystatechange = function(oEvent) {
                if (req.readyState === 4) {
                    if (req.status === 200) { // Handle Success and Failure
                        // Parse the string into a JSON obj
                        var tmpObj = JSON.parse(req.responseText);
                        cb(tmpObj, false);
                        p.done(null, tmpObj);
                        // console.log(tmpObj);
                    } else {
                        //console.log("Error: ", req.statusText); // Error Message
                        cb(req.statusText, true);
                        p.done(true, req.statusText);
                    }
                }
            };

            req.open("GET", "https://api.parse.com/1/users/me", true);
            // Open the request with the Url Encoded String for login
            req.setRequestHeader("X-Parse-Application-Id", appId);
            req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
            req.setRequestHeader("X-Parse-Session-Token", sessionToken);
            req.send(); // Finally send the request
            return p;// Return the Promise
        },
        chartDown : {
            "graphset":[
                {
                    "type":"bar",
                    "labels":[
                        {
                            "text":"Sorry, the market server is down! Try again later.",
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
        }
    }


    function getAxis(start, end, d1, d2) {
        var axis = [];
        var startTime = new Date(start);
        var endTime = new Date(end);


        var limit = 100;
        var counter = 0;


        var rd1 = d1.reverse();
        var rd2 = d2.reverse();
        var data1 = [];
        var data2 = [];

        var results = {
            data1: [],
            data2: [],
            xAxis: []
        }

        var d1Prev=0;
        var d2prev=0;

        // Delete excess dates
        for(var i=rd1.length-1; i>0; i--){
            if(new Date(rd1[i][0]).getTime() < new Date(start).getTime()) {
                rd1.pop();
            } else {
                break;
            }
        };

        while (true) {
            var tmpFormat = startTime.getUTCFullYear() + '-' +
            ('0' + (startTime.getUTCMonth() + 1)).slice(-2) + '-' +
            ('0' + startTime.getUTCDate()).slice(-2);

            if(rd1.length>0){
                var tmpD1 = new Date(rd1[rd1.length - 1][0]);
                if (startTime.getTime() == tmpD1.getTime()) {
                    d1Prev=rd1.pop()[1];
                }
            }
            data1.push(d1Prev);

            if(rd2.length>0){
                var tmpD2 = new Date(rd2[rd2.length - 1][0]);
                if (startTime.getTime() == tmpD2.getTime()) {
                    d2prev=rd2.pop()[1];
                }
            }
            data2.push(d2prev);

            axis.push(tmpFormat);
            startTime.setDate(startTime.getDate() + 1);
            if (startTime.getTime() > endTime.getTime()) {
                //console.log("Break");
                break;
            }

            counter++;
            if (counter > limit) {
                break;
            }
        }
        var min=Number.MAX_VALUE;
        var max=0;
        data1.forEach(function(val, key){
            data1[key] = val*data2[key];

        });

        var min1 = Math.min.apply(null, data1);
        var min2 = Math.min.apply(null, data2);
        var max1 = Math.max.apply(null, data1);
        var max2 = Math.max.apply(null, data2);

        min = Math.min(min1,min2);
        max = Math.max(max1,max2);

        return {
            'data1': data1,
            'data2': data2,
            'xAxis': axis,
            'min' : min,
            'max' : max
        };
    }
