var map = L.map('mapDensity').setView([48.857807, 2.365], 12);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibHVkb3ZpY2xlbGlldnJlIiwiYSI6ImNpbjYwbzkzdDAwd3V2cG0xbzY3ODJ1bnQifQ.qKZtDlqWUbspDkjFVZc8Cw', {
    maxZoom: 14,
    minZoom: 11,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(map);
map.scrollWheelZoom.disable();

// control that shows state info on hover
var heatmapInfo = L.control();

heatmapInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info mapBox');
    this.update();
    return this._div;
};

heatmapInfo.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.name + '</b><br/><span class= "txt">Nombre de bars répertoriés : </span><span class= "num">' + props.density : "</span><h4>Passez votre souris au dessus d'un quartier</h4>"
        );
};

heatmapInfo.addTo(map);


// get color depending on price
function getColor(d) {
    return d > 40  ? '#BD0026' :
           d > 20  ? '#E31A1C' :
           d > 10  ? '#FC4E2A' :
           d > 5  ? '#FD8D3C' :
           d > 0   ? '#FED976' :
                      '#D8D8D8';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.9
    };
}

// Adding interaction
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.9
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    heatmapInfo.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    heatmapInfo.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(districts_precis, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

// Add legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info mapBox legend'),
        grades = [2, 4, 4.5, 5, 5.5, 6, 7],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};