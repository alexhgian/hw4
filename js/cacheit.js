///Author: Alex Gian
// Date:
// Mini helper library that we wrote with Parse calls and utilities.

function CacheIt(appId, apiKey){
    // Init the parse keys.
    var appId = appId || "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
    var apiKey = apiKey ||"xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";

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

    //Get the metal prices from a start to end date
    function getMetalPrice(metal, start, end, cb)
    {
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
        getCSV(json_url, cb);
        return p;// Return the Promise

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
        getClass: function(i, className, option, cb){
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
            return p;// Return the Promise
        },
        chartDown : {
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
            },
            getMetalPrice : getMetalPrice,
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
            }
        }
    }

    // Copyright (c) 2012 Florian H., https://github.com/js-coder https://github.com/js-coder/cookie.js
    !function(e,t){var n=function(){return n.get.apply(n,arguments)},r=n.utils={isArray:Array.isArray||function(e){return Object.prototype.toString.call(e)==="[object Array]"},isPlainObject:function(e){return!!e&&Object.prototype.toString.call(e)==="[object Object]"},toArray:function(e){return Array.prototype.slice.call(e)},getKeys:Object.keys||function(e){var t=[],n="";for(n in e)e.hasOwnProperty(n)&&t.push(n);return t},escape:function(e){return String(e).replace(/[,;"\\=\s%]/g,function(e){return encodeURIComponent(e)})},retrieve:function(e,t){return e==null?t:e}};n.defaults={},n.expiresMultiplier=86400,n.set=function(n,i,s){if(r.isPlainObject(n))for(var o in n)n.hasOwnProperty(o)&&this.set(o,n[o],i);else{s=r.isPlainObject(s)?s:{expires:s};var u=s.expires!==t?s.expires:this.defaults.expires||"",a=typeof u;a==="string"&&u!==""?u=new Date(u):a==="number"&&(u=new Date(+(new Date)+1e3*this.expiresMultiplier*u)),u!==""&&"toGMTString"in u&&(u=";expires="+u.toGMTString());var f=s.path||this.defaults.path;f=f?";path="+f:"";var l=s.domain||this.defaults.domain;l=l?";domain="+l:"";var c=s.secure||this.defaults.secure?";secure":"";e.cookie=r.escape(n)+"="+r.escape(i)+u+f+l+c}return this},n.remove=function(e){e=r.isArray(e)?e:r.toArray(arguments);for(var t=0,n=e.length;t<n;t++)this.set(e[t],"",-1);return this},n.empty=function(){return this.remove(r.getKeys(this.all()))},n.get=function(e,n){n=n||t;var i=this.all();if(r.isArray(e)){var s={};for(var o=0,u=e.length;o<u;o++){var a=e[o];s[a]=r.retrieve(i[a],n)}return s}return r.retrieve(i[e],n)},n.all=function(){if(e.cookie==="")return{};var t=e.cookie.split("; "),n={};for(var r=0,i=t.length;r<i;r++){var s=t[r].split("=");n[decodeURIComponent(s[0])]=decodeURIComponent(s[1])}return n},n.enabled=function(){if(navigator.cookieEnabled)return!0;var e=n.set("_","_").get("_")==="_";return n.remove("_"),e},typeof define=="function"&&define.amd?define(function(){return n}):typeof exports!="undefined"?exports.cookie=n:window.cookie=n}(document);
    /* Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr> Licensed under the New BSD License. https://github.com/stackp/promisejs */
    (function(a){function b(){this._callbacks=[];}b.prototype.then=function(a,c){var d;if(this._isdone)d=a.apply(c,this.result);else{d=new b();this._callbacks.push(function(){var b=a.apply(c,arguments);if(b&&typeof b.then==='function')b.then(d.done,d);});}return d;};b.prototype.done=function(){this.result=arguments;this._isdone=true;for(var a=0;a<this._callbacks.length;a++)this._callbacks[a].apply(null,arguments);this._callbacks=[];};function c(a){var c=new b();var d=[];if(!a||!a.length){c.done(d);return c;}var e=0;var f=a.length;function g(a){return function(){e+=1;d[a]=Array.prototype.slice.call(arguments);if(e===f)c.done(d);};}for(var h=0;h<f;h++)a[h].then(g(h));return c;}function d(a,c){var e=new b();if(a.length===0)e.done.apply(e,c);else a[0].apply(null,c).then(function(){a.splice(0,1);d(a,arguments).then(function(){e.done.apply(e,arguments);});});return e;}function e(a){var b="";if(typeof a==="string")b=a;else{var c=encodeURIComponent;for(var d in a)if(a.hasOwnProperty(d))b+='&'+c(d)+'='+c(a[d]);}return b;}function f(){var a;if(window.XMLHttpRequest)a=new XMLHttpRequest();else if(window.ActiveXObject)try{a=new ActiveXObject("Msxml2.XMLHTTP");}catch(b){a=new ActiveXObject("Microsoft.XMLHTTP");}return a;}function g(a,c,d,g){var h=new b();var j,k;d=d||{};g=g||{};try{j=f();}catch(l){h.done(i.ENOXHR,"");return h;}k=e(d);if(a==='GET'&&k){c+='?'+k;k=null;}j.open(a,c);j.setRequestHeader('Content-type','application/x-www-form-urlencoded');for(var m in g)if(g.hasOwnProperty(m))j.setRequestHeader(m,g[m]);function n(){j.abort();h.done(i.ETIMEOUT,"",j);}var o=i.ajaxTimeout;if(o)var p=setTimeout(n,o);j.onreadystatechange=function(){if(o)clearTimeout(p);if(j.readyState===4){var a=(!j.status||(j.status<200||j.status>=300)&&j.status!==304);h.done(a,j.responseText,j);}};j.send(k);return h;}function h(a){return function(b,c,d){return g(a,b,c,d);};}var i={Promise:b,join:c,chain:d,ajax:g,get:h('GET'),post:h('POST'),put:h('PUT'),del:h('DELETE'),ENOXHR:1,ETIMEOUT:2,ajaxTimeout:0};if(typeof define==='function'&&define.amd)define(function(){return i;});else a.promise=i;})(this);
