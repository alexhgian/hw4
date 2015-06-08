// API ID and API Key for parse
var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = '';
var overviewId = '';

// Initialize our CacheIT Library containing our reusable code.
var Cache = CacheIt(appId,apiKey);
Cache.isLoggedIn(cookie.get('cacheit_sessionToken'), function(data, err){
    if(err){
        window.location.href = "login.html";
        return err;
    }
    sessionToken=cookie.get('cacheit_sessionToken');
    overviewId=cookie.get('cacheit_overviewId');
    userId=cookie.get('cacheit_userId');

    console.log('overviewId: ');
    console.log(overviewId);
});

// Get the totals and percentage
function getTotalData(id, cb){
    Cache.getClass(id, 'Overview',{
        sessionToken: sessionToken
    },cb);
}

function findMetalInfo(metal, data){
    var currentPrice = 0;
    var totalString = '';
    var currentMetalAsInt = 0;
    switch(currentMetal.toLowerCase()){
        case 'gold':
        currentMetalAsInt = 0;
        currentPrice = data[0].bid;
        totalString = 'totalGold';
        break;
        case 'silver':
        currentMetalAsInt = 1;
        currentPrice = data[1].bid;
        totalString = 'totalSilver';
        break;
        case 'platinum':
        currentMetalAsInt = 2;
        currentPrice = data[2].bid;
        totalString = 'totalPlatinum';
        break;
    }

    return {
        bid: currentPrice,
        position: currentMetalAsInt,
        totalString: totalString
    }
}


// getTableData wrapper for getClass method in our custom library
// Gets the Ask, Bid price and calculates change from a live data feed (monex.com)
// through our proxy server cse134b.herokuapp.com
function getTableData(q, cb) {
    var tmpQuery = {
        metal: q.metal,
        item: q.item
    };
    if(!q.item || (q.item).length <=0){
        delete tmpQuery['item'];
    }

    Cache.getClass(null, 'coin',{
        query: tmpQuery,
        sessionToken: sessionToken
    },cb);
}

// Append Coin data to a row
// this is only used here so we don't need it in our cacheit.js library
function appendRow(id, data) {

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var imageNode = document.createElement("img");

    // View Item Handler
    var itemClickedHandler = function(){
        cookie.set('coinId', this.parentNode.id);
        window.location.href="wire4.html"+window.location.hash;
    };

    tr.id = data.objectId; // Add objectId to row for lookup
    tr.setAttribute('updatedat', data.updatedAt); // Add timestamp to row for lookup

    // Add handler to event listner
    td.addEventListener('click', itemClickedHandler);

    // Handle possible empty image
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
    tr.setAttribute('metal',data.metal) ;
    tr.setAttribute('weight',data.weight*data.quantity*data.percent) ;

    var tmpArr = [data.item, data.quantity, data.weight, data.percent, data.value];
    tmpArr.forEach(function(val, key) {
        var textNode = document.createTextNode(val);
        var td = document.createElement("td");
        td.addEventListener('click', itemClickedHandler);
        td.appendChild(textNode);
        tr.appendChild(td);
    });
    // Add Edit button to table
    var editButton = document.createElement("button");
    editButton.style.color = "black";
    editButton.className = "fa fa-edit fa-2x ci-button";
    editButton.addEventListener('click', function(){
        var weight = this.parentNode.parentNode.getAttribute('weight');
        cookie.set('coinId', this.parentNode.parentNode.id);
        cookie.set('weight', weight);
        window.location.href='updateitem.html?action=edit'+window.location.hash;
    });

    var tdEdit = document.createElement("td");
    tdEdit.appendChild(editButton);
    tr.appendChild(tdEdit);

    // Add delete button to table
    var deleteButton = document.createElement("button");
    deleteButton.style.color = "black";
    // deleteButton.style.backgroundColor = "rgb(202, 60, 60)";
    deleteButton.className = "fa fa-trash fa-2x ci-button";
    deleteButton.addEventListener('click', function(){
        var metal = this.parentNode.parentNode.getAttribute('metal');
        var weight = this.parentNode.parentNode.getAttribute('weight');
        console.log(metal);

        Cache.delete( this.parentNode.parentNode.id,overviewId,metal,weight, sessionToken)
        .then(function(err, data){
            updateHistory(function(){
                setTimeout(function(){
                    update();
                },500);
            })

        });
    });

    var tdDelete = document.createElement("td");
    tdDelete.appendChild(deleteButton);
    tr.appendChild(tdDelete);

    document.getElementById(id).appendChild(tr);
}

// Create a function and invoke on onload and invoke on an interveral after that
 function update() {
     // Add a hash to tell add item what metal page were on and use that for the return url
     var addItem = document.getElementById('add-item-button');
     addItem.href='wire5.html#'+currentMetal;
     console.log(addItem);
    //Change the total title
    document.getElementById('my_gold_value').innerHTML = "My " + Cache.upperFirst(currentMetal) + " Value";

    // Loading Spiner
    var searchSpin = document.getElementById('search-spinner');

    // Add the listner to the search bar
    // call resetTimer() which will invoke startTimer's callback
    var search = document.getElementById('search');

    search.onkeyup = function() {
        Cache.resetTimer();
        searchSpin.style.visibility = "visible";
    }

    // initalize a timer's callback will be called next time the timer is reset
    // after the user is finished typing
    Cache.initTimer(function(){
        var search = document.getElementById('search');

        Cache.getMarketPrice(function(liveData){

            var current = findMetalInfo(currentMetal, liveData);
            var currentPrice = current.bid;
            var totalString = current.totalString;
            var currentMetalAsInt = current.position;

            // Search for the coins with the match
            getTableData({
                metal: currentMetal,
                item: search.value
            }, function(rowData, err){
                if(err){console.error(err); return err;}
                searchSpin.style.visibility = "hidden";// Loading is finished.

                var myNode = document.getElementById('table-data');
                while (myNode.firstChild) {
                    myNode.removeChild(myNode.firstChild);
                }
                rowData.results.forEach(function(object, key) {
                    // 1oz = 0.911458333 ozt
                    object.value = (object.weight * Cache.TROY_PER_GRAM * object.percent * currentPrice ).toFixed(2);
                    appendRow('table-data', object);
                });
            });
        });
    });



    // Get the live data required to calculate table and overview panel data
    Cache.getMarketPrice(function(liveData){

        var current = findMetalInfo(currentMetal, liveData);
        var currentPrice = current.bid;
        var totalString = current.totalString;
        var currentMetalAsInt = current.position;

        // Top part of the overview panel
        var dpVal = liveData[currentMetalAsInt].oneDayPercentChange;
        var overallVal = liveData[currentMetalAsInt].yearToDatePercentChange;
        Cache.toggleClass('daily-percent','pos-change-main','neg-change',dpVal.toFixed(2),'%');
        Cache.toggleClass('overall-percent','pos-change-main','neg-change',overallVal.toFixed(2),'%');

        // Bottom part of the overview panel
        var askNode = document.getElementById('ask');
        var bidNode = document.getElementById('bid');

        // Set the ask, bid, and change since the previous day
        askNode.innerHTML=liveData[currentMetalAsInt].ask;
        bidNode.innerHTML=liveData[currentMetalAsInt].bid;
        Cache.toggleClass('change','pos-change','neg-change',liveData[currentMetalAsInt].oneDayChange);

        // Set loader div to hidden since were loaded
        document.getElementById('mloader').style.visibility = "hidden";

        // Get Total for Overview Panel
        getTotalData(overviewId, function(data, err){
            if(err) { return console.log(err); }// Handle Error

            var totalPanelElement = document.getElementById('total-value')
            var totalElement = totalPanelElement.getElementsByClassName('total-dollars')[0];
            var metalTotal = data[totalString];
            totalElement.innerHTML = '$'+(metalTotal*currentPrice).toFixed(2);

            // Get the current date and the date 30 days into the past
            var curTime = new Date();
            var prevTime = new Date();
            prevTime.setDate(curTime.getDate()-30);
            var currentDate = Cache.formatTime(curTime);
            var previousDate = Cache.formatTime(prevTime);

            Cache.getMetalPrice(currentMetal,previousDate,currentDate, function(marketData, err){
                if(err){
                    zingchart.render({
                        id:'chartDiv',
                        height:455,
                        width:"100%",
                        data: Cache.chartDown// Load the error message for the chart if metal price is down.
                    });
                    return err;
                }

                // Load Up the zingchart
                zingchart.render({
                    id:'chartDiv',
                    height:455,
                    width:"100%",
                    data: myChart(Cache.upperFirst(currentMetal), data, marketData,previousDate,currentDate)
                });
            });
        });


        // Get coin data for table, require current price to calculate value
        getTableData({metal:currentMetal}, function(rowData) {
            console.log((rowData));
            var myNode = document.getElementById('table-data');
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            rowData.results.forEach(function(object, key) {
                // 1oz = 0.911458333 ozt
                object.value = (object.weight * object.quantity * object.percent * currentPrice ).toFixed(2);
                appendRow('table-data', object);
            });
            // Set loader div to hidden since were loaded
            document.getElementById('tloader').style.visibility = "hidden";
        });
    });
};

window.onload = update;

/**
* Update History
*/
function updateHistory(cb) {
    var oPromise = Cache.getClass(overviewId, 'Overview', {
        'sessionToken': sessionToken
    });

    oPromise.then(function(error, data) {
        console.log(data);
        var newData = updateArrays(data);
        setClass(overviewId, newData, sessionToken, function(data, err) {
    
            cb(data, err)
        });
    });
}

function updateArrays(data) {
    var gold = data.totalGoldArray[data.totalGoldArray.length - 1];
    var silver = data.totalSilverArray[data.totalSilverArray.length - 1];
    var platinum = data.totalPlatinumArray[data.totalPlatinumArray.length - 1];
    var currentDateStr = formatTimeLocal(new Date());
    console.log(data.totalGoldArray);

    if (gold) {
        if (gold[0] == currentDateStr) {
            data.totalGoldArray[data.totalGoldArray.length - 1][1] = data.totalGold;
        } else {
            data.totalGoldArray.push([currentDateStr, data.totalGold]);
        }
    } else {
        data.totalGoldArray.push([currentDateStr, data.totalGold]);
    }

    if (silver) {
        if (silver[0] == currentDateStr) {
            data.totalSilverArray[data.totalSilverArray.length - 1][1] = data.totalSilver;
        } else {
            data.totalSilverArray.push([currentDateStr, data.totalSilver]);
        }
    } else {
        data.totalSilverArray.push([currentDateStr, data.totalSilver]);
    }
    if (platinum) {
        if (platinum[0] == currentDateStr) {
            data.totalPlatinumArray[data.totalPlatinumArray.length - 1][1] = data.totalPlatinum;
        } else {
            data.totalPlatinumArray.push([currentDateStr, data.totalPlatinum]);
        }
    } else {
        data.totalPlatinumArray.push([currentDateStr, data.totalPlatinum]);
    }
    console.log(data);
    return data;
}

function formatTimeLocal(dateTime) {
    return dateTime.getFullYear() + '-' +
        ('0' + (dateTime.getMonth() + 1)).slice(-2) + '-' +
        ('0' + dateTime.getDate()).slice(-2);
}

function setClass(i, myObj, sessionToken, callback) {
    var cb = callback || function() {};
    var p = new promise.Promise(); // Create a Promise
    var req = new XMLHttpRequest();
    var id = (i) ? '/' + i : '';

    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                var tmpObj = JSON.parse(req.responseText);
                cb(tmpObj, false);
                p.done(null, tmpObj); // Resolve that Promise!
            } else {
                cb(req.statusText, true);
                p.done(true, req.statusText); // Resolve that Promise!
            }
        }
    };
    req.open("PUT", 'https://api.parse.com/1/classes/Overview' + id, true);
    req.setRequestHeader("X-Parse-Application-Id", appId);
    req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
    req.setRequestHeader("X-Parse-Session-Token", sessionToken);
    req.send(JSON.stringify(myObj));
    return p; // Return the Promise
}
