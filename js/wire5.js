var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";
var sessionToken = 'r:tKoZwbnY0hyxNI7KEd9iRNQZf';
var price = 1250.60;
var priceObject = {};

// Initialize our CacheIT Library containing our reusable code.
var Cache = CacheIt(appId,apiKey);
Cache.isLoggedIn(cookie.get('cacheit_sessionToken'), function(data, err){
    if(err){
        window.location.href = "login.html";
        return err;
    }
});
//"+" triggers the hidden button for previewing image.
function triggerFunction() {
    document.getElementById('file_upload').click();
}

//this function lets to preview the image
var loadFile = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('output');
        output.src = reader.result;
        var imgReq = document.getElementsByClassName('coin_image-required')[0];
        imgReq.style.visibility = "hidden";
    };
    reader.readAsDataURL(event.target.files[0]);
};



// displays current date
window.onload = function () {
    var pricePromise = Cache.getMarketPrice(function(mData, err){
        if(err){
            console.log("Oh no an error!");
            return err;
        }
        priceObject=mData;

    });



    // All with class back button will have the proper metal hash to return properly
    var bb = document.getElementsByClassName('back-button')
    for( var i = 0; i<bb.length; i++){
        bb[i].href="wire3.html"+window.location.hash;
    }


    var imgReq = document.getElementsByClassName('coin_image-required')[0];
    imgReq.style.visibility = "hidden";

    var currentdate = new Date();
    document.getElementById('datepicker').value = currentdate.toDateString();




    pricePromise.then(function(){
        getparseData();
        //uplaod to server parse
        document.getElementById("save")
        .addEventListener("click", function() {
            var input = document.getElementById('file_upload');
            var file = input.files[0];
            if(!file){
                var imgReq = document.getElementsByClassName('coin_image-required')[0];
                imgReq.style.visibility = "visible";
            }
            var serverUrl = 'https://api.parse.com/1/files/' + file.name;
            var req = new XMLHttpRequest();

            req.onreadystatechange = function(oEvent) {
                if (req.readyState === 4) {
                    if (req.status === 201) { // Handle Success and Failure
                        // Parse the string into a JSON obj
                        console.log('1Success: '+req.responseText);
                        successUpload(req.responseText);
                    } else {

                        console.log("Error: ", req.statusText); // Error Message
                    }
                }
            };

            req.open("POST", serverUrl, true);
            req.setRequestHeader("X-Parse-Application-Id", appId);
            req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
            req.setRequestHeader("X-Parse-Session-Token", sessionToken);
            req.setRequestHeader("Content-Type", file.type);
            req.send(file);
        });
    });

};


//associating image with the class
function successUpload(data) {
    var qty = parseFloat(document.getElementById('qty').value);
    var item =  document.getElementById('item').value;
    var metal = document.getElementById('metal').value;
    var premium = parseFloat(document.getElementById('premium').value);
    var percent = parseFloat(document.getElementById('percent').innerHTML);
    var weight = parseFloat(document.getElementById('weight').innerHTML);
    var date = document.getElementById('datepicker').value;

    var deleteObj;
    var overviewBody = {};
    otherWeight = 0;

    var action = getParameterByName('action');
    console.log('URL Action: '+action);
    console.log('URL HASH: '+window.location.hash);
    if(action=='edit'){
        // Get Object ID of coin so it can be located and displayed
        var editId = cookie.get('coinId');
        otherWeight = cookie.get('weight');
        deleteObj={
            'method': 'DELETE',
            'path': '/1/classes/coin/'+editId
        };
    }
    var calcWeight = (weight*qty*percent)-otherWeight;
    switch(metal.toLowerCase()){
        case 'gold':
        overviewBody={"totalGold":{"__op":"Increment","amount":calcWeight}};
        break;
        case 'silver':
        overviewBody={"totalSilver":{"__op":"Increment","amount":calcWeight}};
        break;
        case 'platinum':
        overviewBody={"totalPlatinum":{"__op":"Increment","amount":calcWeight}};
        break;
    }

    var batchData = {
        'requests':[{
            'method': 'POST',
            'path': '/1/classes/coin',
            'body': {
                date : date,
                item : item,
                metal: metal.toLowerCase(),
                quantity: qty,
                premium: premium,
                percent: percent,
                weight: weight,
                image : {
                    'name': JSON.parse(data).name,
                    '__type': 'File'
                }
            }
        },{
            'method': 'PUT',
            'path': '/1/classes/Overview/sV6tdOBQCe',
            'body': overviewBody
        }]
    };
    if(deleteObj){
        batchData.requests.push(deleteObj);
    }
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(oEvent) {
        if (req.readyState === 4) {
            if (req.status === 200) { // Handle Success and Failure
                console.log('Success');
                document.location.href="wire3.html"+window.location.hash;
            } else {

                console.log("Error: ", req.statusText); // Error Message
            }
        }
    };
    req.open("POST", " https://api.parse.com/1/batch", true);
    req.setRequestHeader("X-Parse-Application-Id", appId);
    req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
    req.setRequestHeader("Content-Type", 'application/json');
    req.send(JSON.stringify(batchData));
};

//getting parse data from info class
function getparseData () {



    var req1 = new XMLHttpRequest();
    req1.onreadystatechange = function(oEvent) {
        if (req1.readyState === 4) {
            if (req1.status === 200) { // Handle Success and Failure
                // Parse the string into a JSON obj
                var tmpObj1 = JSON.parse(req1.responseText);
                console.log('Success');
                tmpObj = tmpObj1.results;
                populateDropdown(tmpObj1.results);

            } else {
                console.log("Error: ", req1.statusText); // Error Message
            }
        }
    };
    req1.open("GET", "https://api.parse.com/1/classes/Info", true);
    req1.setRequestHeader("X-Parse-Application-Id", appId);
    req1.setRequestHeader("X-Parse-REST-API-Key", apiKey);
    req1.setRequestHeader("Content-Type", 'application/json');
    req1.send();
};


function populateDropdown(tmpObj) {

    var goldObj = _.where(tmpObj, {
        metal: "Gold"
    });
    var silverObj = _.where(tmpObj, {
        metal: "Silver"
    });
    var platinumObj = _.where(tmpObj, {
        metal: "Platinum"
    });

    var metalEl = document.getElementById('metal');
    var typeEl = document.getElementById('item');
    var percent = document.getElementById('percent');
    var qty = document.getElementById('qty');
    var premium = document.getElementById('premium');
    //var price = document.getElementById('price');
    var weight = document.getElementById('weight');
    var goldo = document.getElementById('goldo');
    var goldTotal = document.getElementById('totala');
    var total = document.getElementById('total');
    var totalPremium = document.getElementById('totalPremium');


    price = priceObject[0].bid;
    var currentObj = goldObj;
    switch(window.location.hash)
    {
        case '#gold':
        currentObj = goldObj;
        price = priceObject[0].bid;
        metalEl.options[0].selected = true;
        break;
        case '#silver':
        price = priceObject[1].bid;
        metalEl.options[1].selected = true;
        console.log('setting silver');
        currentObj = silverObj;
        break;
        case '#platinum':
        price = priceObject[2].bid;
        metalEl.options[2].selected = true;
        currentObj = platinumObj;
        break;
    }

    // Initial Info
    currentObj.forEach(function(val, key) {
        var opt = document.createElement('option');
        opt.value = val.name;
        opt.text = val.name;
        typeEl.appendChild(opt);

    });

    setPrice(price);
    updateValues();

    function updateValues() {
        console.log("updateValue: price="+ price);
        var coinInfoEl  = getCoinInfo(typeEl.value, currentObj);
        var fineness = parseFloat(coinInfoEl.weight)*parseFloat(coinInfoEl.percent);
        percent.innerHTML = coinInfoEl.percent;
        weight.innerHTML = coinInfoEl.weight;
        goldo.innerHTML =  (fineness).toFixed(3);
        goldTotal.innerHTML = (parseFloat(qty.value) * fineness).toFixed(3);
        total.innerHTML = (price * parseFloat(qty.value) * fineness).toFixed(3);
        totalPremium.innerHTML = ((price * parseFloat(qty.value) * fineness) + parseFloat(premium.value)).toFixed(3);
    }
    qty.onkeyup = updateValues;
    premium.onkeyup = updateValues;
    // Listiners
    metalEl.onchange = function() {
        switch (this.value) {
            case 'Gold':
            currentObj = goldObj;
            price = priceObject[0].bid;
            break;
            case 'Silver':
            currentObj = silverObj;
            price = priceObject[1].bid;
            break;
            case 'Platinum':
            currentObj = platinumObj;
            price = priceObject[2].bid;
            break;
        }
        while (typeEl.firstChild) {
            typeEl.removeChild(typeEl.firstChild);
        }
        currentObj.forEach(function(val, key) {
            var opt = document.createElement('option');
            opt.value = val.name;
            opt.text = val.name;
            typeEl.appendChild(opt);
        });


        coinInfoEl = getCoinInfo(typeEl.value, currentObj);
        fineness = parseFloat(coinInfoEl.weight)*parseFloat(coinInfoEl.percent);
        percent.innerHTML = coinInfoEl.percent;
        weight.innerHTML = coinInfoEl.weight;
        goldo.innerHTML =  (fineness).toFixed(3);
        goldTotal.innerHTML = (parseFloat(qty.value) * fineness).toFixed(3);
        total.innerHTML = (price * parseFloat(qty.value) * fineness).toFixed(3);
        totalPremium.innerHTML = ((price * parseFloat(qty.value) * fineness) + parseFloat(premium.value)).toFixed(3) ;

        qty.onkeyup = updateValues;
        premium.onkeyup = updateValues;
    };

    typeEl.onchange = function() {
        var selectedCoin = this.options[this.selectedIndex].value;
        coinInfoEl = getCoinInfo(selectedCoin, currentObj);
        fineness = parseFloat(coinInfoEl.weight)*parseFloat(coinInfoEl.percent);
        percent.innerHTML = coinInfoEl.percent;
        weight.innerHTML = coinInfoEl.weight;
        goldo.innerHTML =  (fineness).toFixed(3);
        goldTotal.innerHTML = (parseFloat(qty.value) * fineness).toFixed(3);
        total.innerHTML = (price * parseFloat(qty.value) * fineness).toFixed(3);
        totalPremium.innerHTML = ((price * parseFloat(qty.value) * fineness)  + parseFloat(premium.value)).toFixed(3);
        qty.onkeyup = updateValues;
        premium.onkeyup = updateValues;
    };
};

function getCoinInfo(name, metalObject) {
    return _.findWhere(metalObject, {
        name: name
    });
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function setPrice(p){
    document.getElementById('price').innerHTML=p;
}
