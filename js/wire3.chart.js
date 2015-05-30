var myChart = function(data, totalData, start, end){

    // Create Chart Data
    var series = []

    console.log(totalData);

    if(!data || !totalData) {
        return null;
    }


    var cData = getAxis(start, end, data.totalGoldArray, totalData);
    console.log(cData);

    var myChartData = {
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
            "label":{
                "text":"Time"
            },
            "values": cData.xAxis,
            "line-width":0,
            "max-items":4,
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
            "label":{
                "text":"Price"
            },
            "values":"1000:3000:50",
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
        "legend":{
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
            "active-area":false
        },
        "series":[{
            "text": "Gold Total",
            // "values": myValue1,
            "values":cData.data1,
            "line-color": "red"
        },{
            "text": "1ozt Gold",
            "values":cData.data2,
            "line-color": "lightgreen"
        }]
    };

    return myChartData;
}
function getAxis(start, end, d1, d2) {
    var axis = [];
    var startTime = new Date(start);
    var endTime = new Date(end);

    var limit = 100;
    var counter = 0;

    var rd1 = d1.reverse();
    var rd2 = d2.reverse();
    var data1 = [];
    var data2 = [];

    var results = {
        data1: [],
        data2: [],
        xAxis: []
    }

    var d1Prev=0;
    var d2prev=0;
    while (true) {
        // Format time yyyy-mm-dd
        var tmpFormat = startTime.getUTCFullYear() + '-' +
        ('0' + (startTime.getUTCMonth() + 1)).slice(-2) + '-' +
        ('0' + startTime.getUTCDate()).slice(-2);

        if(rd1.length>0){
            var tmpD1 = new Date(rd1[rd1.length - 1][0]);
            if (startTime.getTime() == tmpD1.getTime()) {
                d1Prev=rd1.pop()[1];
            }
        }
        data1.push(d1Prev);

        if(rd2.length>0){
            var tmpD2 = new Date(rd2[rd2.length - 1][0]);
            if (startTime.getTime() == tmpD2.getTime()) {
                d2prev=rd2.pop()[1];
            }
        }
        data2.push(d2prev);

        axis.push(tmpFormat);
        startTime.setDate(startTime.getDate() + 1);
        if (startTime.getTime() > endTime.getTime()) {
            console.log("Break");
            break;
        }

        counter++;
        if (counter > limit) {
            break;
        }
    }
    console.log(data1)
    return {
        'data1': data1,
        'data2': data2,
        'xAxis': axis
    };
}
