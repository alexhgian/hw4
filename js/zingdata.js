var myValue1 = [];
for(var i = 0; i<64;i++){
    myValue1.push([i, Math.floor((Math.random() * 200) + 150)]);
}
var myValue2 = [];
for(var i = 0; i<64;i++){
    myValue2.push([i, Math.floor((Math.random() * 500) + 400)]);
}
var xAxis = [];
myValue2.forEach(function(val, key){
    xAxis.push(key);
});

var chartData=
{
    "background-color":"none",
    "type":"line",
    "plotarea":{
        "margin-top":10,
        "margin-right":50,
        "margin-bottom":50
    },
    "scroll-x":{
        "handle":{
            "height":20,
            "background-color":"white",
            "border-left":"1px solid #a6a6a6",
            "border-right":"1px solid #a6a6a6",
            "border-top":"1px solid #a6a6a6",
            "border-bottom":"1px solid #a6a6a6",
            "border-radius":"5px"
        },
        "bar":{
            "background-color":"#a6a6a6",
            "alpha":0.5,
            "border-radius":"5px"
        }
    },
    "scaleX":{
        "values": xAxis,
        "line-width":0,
        "max-items":10,
        "tick":{
            "visible":false
        },
        "zooming":false,
        "guide":{
            "visible":false
        },
        "items-overlap":true
    },
    "scaleY":{
        "values":"0:1000:100",
        "line-width":0,
        "tick":{
            "visible":false
        },
        "guide":{
            "visible":true,
            "line-color":"#333",
            "line-width":"1px",
            "line-style":"solid"
        }
    },
    "crosshair-x":{
        "scale-label":{
            "border-color":"#00B5B5",
            "border-width":"2px",
            "background-color":"rgb(255, 255, 255)",
            "font-color":"#000",
            "text":"%v",
            "alpha":1,
            "width":70
        }
    },
    "plot":{
        "line-width":3,
        "line-color":"#00B5B5",
        "background-color":"#00B5B5",
        "shadow":"false",
        "zooming":true,
        "marker":{
            "visible":false
        },
        "tooltip":{
            "visible":false
        },
        "active-area":true
    },
    "series":[
        {
            "values":myValue1,
            "color":"red"
        },
        {
            "values":myValue2
        }
    ]
};
