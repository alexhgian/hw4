var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";

var price = 1250.60;

//"+" triggers the hidden button for previewing image.
function triggerFunction() {
    document.getElementById('file_upload').click();
}

//formatting the date
function dateToString(date) {
  var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December' ];

    var month = date.getMonth() ;
    var day = date.getDate();
    var dateOfString = (('' + month).length < 2 ? '' : '') +  monthNames[month] + ' ';
    dateOfString += (('' + day).length < 2 ? '0' : '') + day + ' ';
    dateOfString += date.getFullYear();
    return dateOfString;
}

//this function lets to preview the image
var loadFile = function(event) {
  var reader = new FileReader();
  reader.onload = function(){
    var output = document.getElementById('output');
    output.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
};



// displays current date 
window.onload = function () {

  var currentdate = new Date();
  var datetime= '';
  datetime += dateToString(currentdate );
  document.getElementById('datepicker').value = datetime;
  getparseData();

//uplaod to server parse
  document.getElementById("save")
    .addEventListener("click", function() {
        var input = document.getElementById('file_upload');
        var file = input.files[0];
        var serverUrl = 'https://api.parse.com/1/files/' + file.name;
        var req = new XMLHttpRequest();

        req.onreadystatechange = function(oEvent) {
            if (req.readyState === 4) {
                if (req.status === 201) { // Handle Success and Failure
                  // Parse the string into a JSON obj
                  console.log('Success: '+req.responseText);
                  successUpload(req.responseText);
                 
                } else {

                    console.log("Error: ", req.statusText); // Error Message
                }
            }
        };

        req.open("POST", serverUrl, true);
        req.setRequestHeader("X-Parse-Application-Id", appId);
        req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
        req.setRequestHeader("Content-Type", file.type);
        req.send(file);
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

  var bodyData = {
      item : item,
      metal: metal,
      quantity: qty,
      premium: premium,
      percent: percent,
      weight: weight,
      image : {
              'name': JSON.parse(data).name,
              '__type': 'File'
      }      
  }

  var req = new XMLHttpRequest();
  req.onreadystatechange = function(oEvent) {
      if (req.readyState === 4) {
          if (req.status === 201) { // Handle Success and Failure
              console.log('Success');
              document.location.href=("wire3.html");
          } else {

              console.log("Error: ", req.statusText); // Error Message
          }
      }
  };
  req.open("POST", " https://api.parse.com/1/classes/coin", true);
  req.setRequestHeader("X-Parse-Application-Id", appId);
  req.setRequestHeader("X-Parse-REST-API-Key", apiKey);
  req.setRequestHeader("Content-Type", 'application/json');
  req.send(JSON.stringify(bodyData));
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

    // Initial Info
    goldObj.forEach(function(val, key) {
        var opt = document.createElement('option');
        opt.value = val.name;
        opt.text = val.name;
        typeEl.appendChild(opt);

    });

    var currentObj = goldObj;
          function updateValues() {
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
                break;
            case 'Silver':
                currentObj = silverObj;
                break;
            case 'Platinum':
                currentObj = platinumObj;
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