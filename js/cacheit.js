// Author: Alex Gian
//
// Parse
//
// Mini helper library that we wrote with Parse calls and utilities.
function CacheIt(appId, apiKey){
    // Init the parse keys.
    var appId = appId || "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
    var apiKey = apiKey ||"xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";

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

    return {
        formatTime : function(dateTime){
            return dateTime.getUTCFullYear() + '-' +
            ('0' + (dateTime.getUTCMonth() + 1)).slice(-2) + '-' +
            ('0' + dateTime.getUTCDate()).slice(-2);
        },
        toggleClass : function(id, c1, c2, value, postfix){
            var pf = postfix || '';
            var toggleNode = document.getElementById(id);
            if(value>=0){
                toggleNode.className = c1;
                toggleNode.innerHTML='+'+value+pf;
            } else {
                toggleNode.className = c2;
                toggleNode.innerHTML=value+pf;
            }
        },
        getMetalPrice : getMetalPrice
    }
}

/*
*  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
*  Licensed under the New BSD License.
*  https://github.com/stackp/promisejs
*/
(function(a){function b(){this._callbacks=[];}b.prototype.then=function(a,c){var d;if(this._isdone)d=a.apply(c,this.result);else{d=new b();this._callbacks.push(function(){var b=a.apply(c,arguments);if(b&&typeof b.then==='function')b.then(d.done,d);});}return d;};b.prototype.done=function(){this.result=arguments;this._isdone=true;for(var a=0;a<this._callbacks.length;a++)this._callbacks[a].apply(null,arguments);this._callbacks=[];};function c(a){var c=new b();var d=[];if(!a||!a.length){c.done(d);return c;}var e=0;var f=a.length;function g(a){return function(){e+=1;d[a]=Array.prototype.slice.call(arguments);if(e===f)c.done(d);};}for(var h=0;h<f;h++)a[h].then(g(h));return c;}function d(a,c){var e=new b();if(a.length===0)e.done.apply(e,c);else a[0].apply(null,c).then(function(){a.splice(0,1);d(a,arguments).then(function(){e.done.apply(e,arguments);});});return e;}function e(a){var b="";if(typeof a==="string")b=a;else{var c=encodeURIComponent;for(var d in a)if(a.hasOwnProperty(d))b+='&'+c(d)+'='+c(a[d]);}return b;}function f(){var a;if(window.XMLHttpRequest)a=new XMLHttpRequest();else if(window.ActiveXObject)try{a=new ActiveXObject("Msxml2.XMLHTTP");}catch(b){a=new ActiveXObject("Microsoft.XMLHTTP");}return a;}function g(a,c,d,g){var h=new b();var j,k;d=d||{};g=g||{};try{j=f();}catch(l){h.done(i.ENOXHR,"");return h;}k=e(d);if(a==='GET'&&k){c+='?'+k;k=null;}j.open(a,c);j.setRequestHeader('Content-type','application/x-www-form-urlencoded');for(var m in g)if(g.hasOwnProperty(m))j.setRequestHeader(m,g[m]);function n(){j.abort();h.done(i.ETIMEOUT,"",j);}var o=i.ajaxTimeout;if(o)var p=setTimeout(n,o);j.onreadystatechange=function(){if(o)clearTimeout(p);if(j.readyState===4){var a=(!j.status||(j.status<200||j.status>=300)&&j.status!==304);h.done(a,j.responseText,j);}};j.send(k);return h;}function h(a){return function(b,c,d){return g(a,b,c,d);};}var i={Promise:b,join:c,chain:d,ajax:g,get:h('GET'),post:h('POST'),put:h('PUT'),del:h('DELETE'),ENOXHR:1,ETIMEOUT:2,ajaxTimeout:0};if(typeof define==='function'&&define.amd)define(function(){return i;});else a.promise=i;})(this);
