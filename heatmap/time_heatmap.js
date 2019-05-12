
//heatmap.js config
var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": .003,
  "maxOpacity": 1,
  // scales the radius based on map zoom
  "scaleRadius": true,
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries
  //   (there will always be a red spot with useLocalExtremas true)
  "useLocalExtrema": false,
  // which field name in your data represents the latitude - default "lat"
  latField: 'latitude',
  // which field name in your data represents the longitude - default "lng"
  lngField: 'longitude',
  // which field name in your data represents the data value - default "value"
  valueField: 'count',
  defaultGradient: { 0.25: "grey", 0.55: "yellow", 0.85: "orange", 1.0: "#F12923"}
};

var heatmapLayer = new HeatmapOverlay(cfg);

var baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

//setup map and add layers
var map = new L.Map('map', {
  center: new L.LatLng(48.857807, 2.34),
  zoom: 13,
  layers: [baseLayer, heatmapLayer]
});

var state = Object();
state.count = 0;

//let Socrata do the sorting:
var mybutton = document.getElementById('buttonContainer');
var buttonType = document.getElementById('buttonType');
var hourBox = document.getElementById("hourBox");
hourBox.style.visibility="hidden";

mybutton.addEventListener('click', function() {

  // we cannot click a new time on the button till animation is finished
  mybutton.disabled = true;
  buttonType.innerHTML = "more_horiz";

  // charge data
  $.getJSON( "list_grid.json", function( rawData ) {

    //initilaize variables for the D3 chart
    var countArray = [],
      qh =0,
      date,
      intervalCounter = 5,
      numberShow = 20,
      index = 0,
      data = {
        max:200,
        min:1,
        data:[]
      };

    var goodData = [];
    for(var i=0;i<rawData.length;i++){
      rawData[i].fresh=true;
      rawData[i].up = true;
      rawData[i].iter = 1;
      rawData[i].count = 0;
      goodData.push(rawData[i]);
    };

    //initializeChart(); 
   //iterate

   var timer = setInterval(function () {

    //iterates 10 times for each day
    if (intervalCounter == 5){
      intervalCounter = 0;
      getAnotherDay();
    } else {
      intervalCounter++;
    }


    //create new array for live points, push it to the map
    var newData = [];
    for(var j= 0; j < data.data.length;j++) {
      var point = data.data[j];
      point.count = point.value - point.value/point.iter;

      // if data of the day, light it up
      if (point.up) {
        point.iter++;
      // if data of the day before, light it down
      } else {
        point.iter--;
      }

      if (point.iter==numberShow) {
        point.up = false;
      }

      if (!point.up && point.iter<1) {
        point.fresh = false;
      }

      if(point.fresh) {
        newData.push(data.data[j]);
      }
    }
    data.data = newData;

    heatmapLayer.setData(data);

    if(data.data.length == 0) {
      mybutton.disabled = false;
      buttonType.innerHTML = "replay";
      hourBox.style.visibility = "hidden";
      clearInterval(timer);
      return;
    }


    //update the chart
    hourBox.style.visibility = "visible";
    hourBox.innerHTML = date;

    }, 50);


    function getAnotherDay() {
      var todayCounter = 0;

      //iterate over goodData, push today's events to data.data
      for (;index<goodData.length;index++) {
        var data_qh = goodData[index].index
        date = rawData[index].date

        if(data_qh == qh && data_qh<45) {
          data.data.push(goodData[index]);
          todayCounter++;
        } else {

          var todayCount = {
            qh:qh,
            count:todayCounter
          };

          qh++;
          break;

        }
      }
    }
  });
});