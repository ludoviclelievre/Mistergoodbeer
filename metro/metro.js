var map = L.map('map').setView([48.857807, 2.345], 12);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibHVkb3ZpY2xlbGlldnJlIiwiYSI6ImNpbjYwbzkzdDAwd3V2cG0xbzY3ODJ1bnQifQ.qKZtDlqWUbspDkjFVZc8Cw', {
    maxZoom: 14,
    minZoom: 10,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(map);

// what price we want to display
var priceToDispay= "mean_bar_reg";
// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'mapBox info');
    this.update();
    return this._div;
};

info.update = function (props) {
    if (props) {
        const priceName = priceToDispay == "cheap" ? "minimum" : "moyen";
        var innerHtml = '<div class="infoTitle">'
        if (props.name) {
            var link = "image_num_ligne/M_"+props.num_line+".png";
            innerHtml += '<b>' + props.name + '</b><i><img src='+link+' class="images_petit"  alt="ligne" /></i>';
            innerHtml += '</div>';
            innerHtml += '<span class="txt">Prix ' + priceName + ' sur la ligne:'+props[priceToDispay+'_bar_'+HappyToDispay].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
        } else {
            var imagesHtml = "";
            for (var i = 0; i < props.lignes.length; i++) {
                const ligne = props.lignes[i];
                const image_link = "image_num_ligne/M_" + ligne + ".png";
                imagesHtml += '<i><img src=' + image_link + ' class="images_petit"  alt="ligne" /></i>';
            }
            innerHtml += '<b>' + props.nom + '</b>';
            innerHtml += imagesHtml;
            innerHtml += '</div>';
            innerHtml += '<span class="txt">Prix ' + priceName + ' de la pinte: </span><span class="num">'+props[priceToDispay+'_bar_'+HappyToDispay+'_str'];
        }
        this._div.innerHTML = innerHtml;
    } else {
        this._div.innerHTML = "<h4 style=\"text-align: center;\">Passez votre souris au dessus<br/>d'une ligne ou d'une station de métro</h4>";
    }
};

info.addTo(map);

// get color depending on price
function getColor(d) {
    return d.length>1? "#ffffff" : 
        d[0]==1 ? "#FECE00":
        d[0]==2 ? "#0065AE" :
        d[0]=="3B" ? "#99D4DE":
        d[0]==3 ? "#9F971A":
        d[0]==4 ?"#BE418D":
        d[0]==5 ? "#F19043":
        d[0]==6 ? "#84C28E":
        d[0]==7 ?"#F2A4B7":
        d[0]=="7B" ? "#84C28E":
        d[0]==8?"#CDACCF":
        d[0]==9? "#D5C900":
        d[0]==10?"#E4B327":
        d[0]==11?"#8C5E24" :
        d[0]==12?"#007E49":
        d[0]==13?"#99D4DE":
        d[0]==14?"#622280":
        '#FC4E2A';
}

// get radius depending on price
function getRadius(d) {
    return d > 40  ? 20 :
           d > 8  ? 40 :
           d > 6  ? 80 :
           d > 4  ? 120 :
           d > 3   ? 160 :
           d > 0   ? 200 :
                      20;
}

function style(feature) {
    return {
        color: feature.properties.color,
        weight: 3,
        opacity: 0.7
    };
}

// Adding interaction
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: layer.feature.properties.color,//'#666',
        opacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojsonLine;

function resetHighlight(e) {
    geojsonLine.resetStyle(e.target);
    info.update();
}

// Adding interaction Station
function highlightPoint(e) {
    var layer = e.target;

    layer.setStyle({
        fillColor: getColor(layer.feature.properties.lignes),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojsonStation;

function resetHighlightPoint(e) {
    geojsonStation.resetStyle(e.target);
    info.update();
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

function onEachFeatureStation(feature, layer) {
    layer.on({
        mouseover: highlightPoint,
        mouseout: resetHighlightPoint,
        click: zoomToFeature
    });
}  

geojsonLine = L.geoJson(line_ratp, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

function style_point(feature) {
    return {
        fillColor: getColor(feature.properties.lignes),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
        };
}


var firstIter = false;
if (!firstIter){
    getPrice();
}

function getPrice(){
    var radiosP = document.getElementsByName('controlPrice');
    for (var i = 0; i < radiosP.length; i++) {
        if (radiosP[i].checked) {
            priceToDispay = (radiosP[i].value);
            break;
        }
    }
    var radiosH = document.getElementsByName('controlHappy');
    for (var i = 0; i < radiosH.length; i++) {
        if (radiosH[i].checked) {
            HappyToDispay = (radiosH[i].value);
            break;
        }
    }
   if (firstIter){
        map.removeLayer( geojsonStation );
    }else{
        firstIter=true;
        console.log(firstIter)
    }
     geojsonStation = L.geoJson(stations_ratp, {
        style: style_point,
        onEachFeature: onEachFeatureStation,
        pointToLayer: function (feature, latlng) {
            return L.circle(latlng, getRadius(feature.properties[priceToDispay+'_bar_'+HappyToDispay]));
        }
    });
    geojsonStation.addTo(map);

}

const prixMoyenLigne = {

};
