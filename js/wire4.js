// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';

// Initialize our CacheIT Library containing our reusable code.
var Cache = CacheIt(appId,apiKey);

var TROY_PER_OZ = 1.09714286;
var coinId = 'ngj0Gq7piW';
var currentMetal;
var marketPrice;


window.onload = function() {
    // Get Object ID of coin so it can be located and displayed
    coinId = cookie.get('coinId');
    console.log(coinId);

    // All with class back button will have the proper metal hash to return properly
    var bb = document.getElementsByClassName('back-button')
    for( var i = 0; i<bb.length; i++){
        bb[i].href="wire3.html"+window.location.hash;
	}
    
    var parseData;
    var promise = Cache.getClass(coinId, 'coin',{
        sessionToken: sessionToken
    },function(data, err){
        parseData=data;
    });

    promise.then(function(err, pData){
        Cache.getMarketPrice(function(mData, err){
            if(err){
                console.log("Oh no an error!");
                return err;
            }

            // Parse the string into a JSON obj
            var tmpObj = pData;

            console.log(tmpObj.metal);
            switch(tmpObj.metal) {
                case 'gold':
                    marketPrice = mData[0].bid;
                    break;
                case 'silver':
                    marketPrice = mData[1].bid;
                    break;
                case 'platinum':
                    marketPrice = mData[2].bid;
                    break;
            }

            var metal = document.getElementById('metal');
            metal.innerHTML = Cache.upperFirst(tmpObj.metal);

            var type = document.getElementById('type');
            type.innerHTML = tmpObj.item;

            var date = document.getElementById('date');
            date.innerHTML = (new Date(tmpObj.createdAt)).toDateString();

            var quantity = document.getElementById('qty');
            quantity.innerHTML = tmpObj.quantity;

            var premium = document.getElementById('premium');
            premium.innerHTML = tmpObj.premium;

            var marketprice = document.getElementById('marketprice');
            marketprice.innerHTML = marketPrice;

            var percent = document.getElementById('percent');
            percent.innerHTML = Cache.upperFirst(tmpObj.metal) + ' %';

            var percentdata = document.getElementById('percentdata');
            percentdata.innerHTML = tmpObj.percent;

            var weightdata = document.getElementById('weightdata');
            weightdata.innerHTML = tmpObj.weight;

            var perunit = document.getElementById('perunit');
            perunit.innerHTML = 'Total Weight (' + tmpObj.metal + ')';

            var perunitdata = document.getElementById('perunitdata');

            perunitdata.innerHTML = (tmpObj.weight * tmpObj.percent).toFixed(5);

            var total = document.getElementById('total');
            total.innerHTML = (marketPrice * tmpObj.weight * tmpObj.percent * tmpObj.quantity).toFixed(2);

            var img = document.getElementById('coin-img');
            img.src = tmpObj.image.url;
        });
    });
};
