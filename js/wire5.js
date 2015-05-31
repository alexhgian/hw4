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
            var tmpObj = JSON.parse(req1.responseText);
            console.log('Success');
            populateDropdown(tmpObj);

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

//populating the metal type dropdown
function populateDropdown (tmpObj) {
  var dropdown = document.getElementById("item");
  dropdown.length = 0;

  for (var i = 0; i < tmpObj.results.length; i++) {
    if(tmpObj.results[i].metal === document.getElementById('metal').value){
      dropdown[dropdown.length] = new Option(tmpObj.results[i].name ,tmpObj.results[i].name);
      
    } 
  }
  

  console.log(document.getElementById('metal').value);
  console.log(document.getElementById('item').value);


  document.getElementById('metal').onchange =  function metalType(){
    dropdown.length = 0;

    for (var i = 0; i < tmpObj.results.length; i++) {
      if(tmpObj.results[i].metal === document.getElementById('metal').value){
        dropdown[dropdown.length] = new Option(tmpObj.results[i].name ,tmpObj.results[i].name);  
      } 
      if (tmpObj.results[i].metal === document.getElementById('metal').value && 
          tmpObj.results[i].name === document.getElementById('item').value){
          document.getElementById('percent').innerHTML = 
          (parseFloat(tmpObj.results[i].weight)/price).toFixed(3);
          document.getElementById('weight').innerHTML = tmpObj.results[i].weight;
          var goldo = tmpObj.results[i].weight *
          (parseFloat(tmpObj.results[i].weight)/price);
          document.getElementById('goldo').innerHTML  = (goldo).toFixed(3);
          document.getElementById('total').innerHTML = 
          (parseFloat(document.getElementById('qty').value)*price*goldo).toFixed(3);



      }
    }
    console.log("document"+document.getElementById('metal').value);
    console.log("document"+document.getElementById('item').value);

  };
};
