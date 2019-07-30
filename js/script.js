import { byeIE } from "./byeie"; // loučíme se s IE
import { maxtemps } from "./data";
import { stations } from "./locs";
import proj4 from "proj4";
import regression from "regression";

let xmlConv = require('xml-js');

byeIE();

proj4.defs("EPSG:5514","+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs");

function findNearby([y, x]) {
  const userLoc = proj4("EPSG:5514", [x, y]); //výpočty vzdáleností jedině v Křováku ;)
  let dists = [];
  Object.values(stations).forEach(s => {
    const stationLoc = proj4("EPSG:5514", [s[2], s[1]]);
    // Pythagorova věta
    const xDist = Math.abs(userLoc[0] - stationLoc[0]);
    const yDist = Math.abs(userLoc[1] - stationLoc[1]);
    dists.push(Math.round(Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)))); 
  });
  return [Object.keys(stations)[dists.indexOf(Math.min(...dists))], Math.min(...dists)]; // id nejbližší stanice
}

function drawChart([statID, dist], age) {
  let toReg = [];
  Object.values(maxtemps[statID]).forEach((v, i) => toReg.push([i, v]));
  let trendLine = regression.linear(toReg).points; // lineární trendline

  if (age > Object.values(maxtemps[statID]).length) {
    age = Object.values(maxtemps[statID]).length;
  }

  const preData = Object.values(maxtemps[statID]).slice(0, Object.values(maxtemps[statID]).length - age);
  const postData = new Array(Object.values(maxtemps[statID]).length - age).fill(null);
  postData.push(...Object.values(maxtemps[statID]).slice(age*-1));
  
  const arrSum = arr => arr.reduce((a,b) => a + b, 0)

  Highcharts.chart('graf', {
    credits: {
      href: 'http://portal.chmi.cz/historicka-data/pocasi/denni-data',
      text: 'data ČHMÚ'
    },
    title: {
        text: arrSum(postData) + ' tropických dní dny na stanici ' + stations[statID][0] + ' od roku ' + (2019 - age)
    },
    subtitle: {
        text: 'od vaší lokality ' + document.getElementById("inp-geocode").value + ' je to '
        + Math.round(dist / 1000)
        + ' km <br><a style="font-style: italic;" target="_blank" href="https://www.irozhlas.cz/zpravy-domov/data-statni-spravy-otevrena-data-chmu_1809140600_hm">Proč tu není bližší stanice?</a></i>'
    },
    xAxis: {
        categories: Object.keys(maxtemps[statID]),
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Počet tropických dní (přes 30°C)'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:12px">rok {point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0,
            events: {
              legendItemClick: () => false
          }
        },
        allowPointSelect: false
    },
    legend: {
      enabled: true
    },
    series: [{
      type: 'line',
      name: 'trend',
      color: '#fcae91',
      data: [
        trendLine[0], 
        trendLine.slice(-1)[0] 
      ],
      marker: {
          enabled: false
      },
      states: {
          hover: {
              lineWidth: 0
          }
      },
      enableMouseTracking: false,
      events: {
        legendItemClick: function(e) {
          this.update({
            color: '#fcae91'
          });
          e.preventDefault();
        }
      }
    }, {
      type: 'column',
      name: 'tropické dny před narozením',
      color: '#bdbdbd',
      data: preData,
      events: {
        legendItemClick: function(e) {
          this.update({
            color: '#bdbdbd'
          });
          e.preventDefault();
        }
      }
      }, {
        type: 'column',
        name: 'tropické dny od narození',
        color: '#de2d26',
        data: postData,
        events: {
          legendItemClick: function(e) {
            this.update({
              color: '#de2d26'
            });
            e.preventDefault();
          }
        }
    }]
  });
}

$("#inp-geocode").on("focus input", () => $("#inp-geocode").css("border-color", "black"));

// geocoder
const form = document.getElementById("frm-geocode");
form.onsubmit = function submitForm(event) {
  event.preventDefault();
  const text = document.getElementById("inp-geocode").value;
  const age = parseInt(document.getElementById("inp-age").value) || 100;
  if (text === "") {
    $("#inp-geocode").css("border-color", "red");
    return;
  } else {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", `https://api.mapy.cz/geocode?query=${text}`, false);
    xmlHttp.send(null);
    let d = xmlConv.xml2js(xmlHttp.responseText, {ignoreComment: true, alwaysChildren: true});
    if (typeof d.elements[0].elements[0].elements[0] === "undefined") {
      $("#inp-geocode").css("border-color", "red");
      return;
    }
    const x = parseFloat(d.elements[0].elements[0].elements[0].attributes.x);
    const y = parseFloat(d.elements[0].elements[0].elements[0].attributes.y);
    if (x < 12 || x > 19 || y < 48 || y > 52) { // omezení geosearche na Česko, plus mínus
      $("#inp-geocode").css("border-color", "red");
      return;
    }
    let closestID = findNearby([y, x]);
    drawChart(closestID, age);
  }
};
