var myChart = function(currentMetal, data, totalData, start, end){

    // Create Chart Data
    var series = []

    //console.log(totalData);

    if(!data || !totalData) {
        return null;
    }

    // Select the array history to display
    var selectHistory = '';

    switch(currentMetal){
        case 'Gold':

        selectHistory = 'totalGoldArray';
        break;
        case 'Silver':

        selectHistory = 'totalSilverArray';
        break;
        case 'Platinum':

        selectHistory = 'totalPlatinumArray';
        break;
    }

    // Optimize the data and fill in gaps of days if missing with previous day.
    var cData = getAxis(start, end, data[selectHistory], totalData);
    currentScale = 0+':'+(cData.max+((cData.max+cData.min)/4)+10)+':'+ ((cData.max<200)?10:200);
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
            "values":currentScale,
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
            "text": currentMetal+" Total",
            // "values": myValue1,
            "values":cData.data1,
            "line-color": "red"
        },{
            "text": "1ozt "+currentMetal,
            "values":cData.data2,
            "line-color": "lightgreen"
        }]
    };

    return myChartData;
}
