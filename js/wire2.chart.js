var myChart2 = function(parseData, gData, sData, pData, start, end){

    // Create Chart Data
    var series = []


    if(!gData || !sData || !pData || !parseData) {
        console.error('Some Data was null!');
        return null;
    }


    var gpData = getAxis(start, end, parseData.totalGoldArray, gData);
    var spData = getAxis(start, end, parseData.totalSilverArray, sData);
    var ppData = getAxis(start, end, parseData.totalPlatinumArray, pData);

    var min = Math.min(gpData.min,spData.min,ppData.min);
    var max = Math.max(gpData.max,spData.max,ppData.max);
    //console.log('Max is : ' + max)
    currentScale = 0+':'+(max+((max+min)/10)+100)+':'+ ((max<200)?10:200);
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
            "values": gpData.xAxis,
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
            "text": "Gold Total",
            // "values": myValue1,
            "values":gpData.data1,
            "line-color": "red"
        },
        {
            "text": "Silver Total",
            // "values": myValue1,
            "values":spData.data1,
            "line-color": "orange"
        },
        {
            "text": "Platinum Total",
            // "values": myValue1,
            "values":ppData.data1,
            "line-color": "yellow"
        },{
            "text": "1ozt Gold",
            "values":gpData.data2,
            "line-color": "lightgreen"
        },{
            "text": "1ozt Silver",
            "values":spData.data2,
            "line-color": "blue"
        },{
            "text": "1ozt Platinum",
            "values":ppData.data2,
            "line-color": "purple"
        }]
    };

    return myChartData;
}
