
$(document).ready(function(){});



var headers = {
         "X-Parse-Application-Id": "iFY8hb8r6Ue1Qh98NBCP1tWshhexxQS1tOsRTk0W",
         "X-Parse-REST-API-Key": "xPKaGBUFnH5vhMN8W77wuuGFoeesi4zbl0H2bLL1"
      };



function triggerFunction() {
    $('#file_upload').trigger("click");
}





var loadFile = function(event) {
  var reader = new FileReader();
  reader.onload = function(){
    var output = document.getElementById('output');
    output.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
  var file = event.target.files[0];
   $(function() {

   // This function is called when the user clicks on Upload to Parse. It will create the REST API request to upload this image to Parse.
   $('#uploadbutton').click(function() {
      var serverUrl = 'https://api.parse.com/1/files/' + file.name;

      $.ajax({
         type: "POST",
         "headers": headers,
         url: serverUrl,
         data: file,
         processData: false,
         contentType: false,
         success: successUpload,
         error: function(data) {
            var obj = jQuery.parseJSON(data);
            console.error("Error: ");
         }
      });
   });


   function successUpload(data) {
      $('#uploadedLink').append(data.url);
      $.ajax({
         'type': "POST",
         'headers': headers,
         'url': "https://api.parse.com/1/classes/Uploads",
         "contentType": "application/json",
         "dataType": "json",
         'success': function(data) {
            console.log("Success Add.");
         },
         'error': function(data) {
            console.log("Error Add.");
         },
         "data": JSON.stringify({
            "file": {
               "name": data.name,
               "__type": "File"
            }
         })
      });
   };



  });

};

