var appId = "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W";
var apiKey = "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1";

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
   var file = event.target.files[0];
   console.log("file for loadFile: "+event.target.files[0]);
  
};



// displays current date 
window.onload = function () {

  var currentdate = new Date();
  var datetime= '';
  datetime += dateToString(currentdate );
  document.getElementById('datepicker').value = datetime;





  document.getElementById("save")
    .addEventListener("click", function() {
      console.log("Click");
        var input = document.getElementById('file_upload');
        var file = input.files[0];
        var serverUrl = 'https://api.parse.com/1/files/' + file.name;
        var req = new XMLHttpRequest();

        req.onreadystatechange = function(oEvent) {
            if (req.readyState === 4) {
                if (req.status === 201) { // Handle Success and Failure
                  // Parse the string into a JSON obj
                  console.log('Success: '+req.responseText);
                  console.log(JSON.parse(req.responseText).name);
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

function successUpload(data) {  
  var bodyData = {
      item : 'test',
      images : {
              'name': JSON.parse(data).name,
              '__type': 'File'
      }      
  }

  var req = new XMLHttpRequest();
  req.onreadystatechange = function(oEvent) {
      if (req.readyState === 4) {
          if (req.status === 201) { // Handle Success and Failure
              console.log('Success');
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

