import { byeIE } from "./byeie"; // loučíme se s IE
import { maxtemps } from "./data";
import { stations } from "./locs";
import proj4 from "proj4"

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

function drawChart([statID, dist]) {
  Highcharts.chart('graf', {
    chart: {
        type: 'column'
    },
    credits: {
      href: 'http://portal.chmi.cz/historicka-data/pocasi/denni-data',
      text: 'data ČHMÚ',
    },
    title: {
        text: 'Tropické dny na stanici ' + stations[statID][0]
    },
    subtitle: {
        text: 'od vaší lokality ' + document.getElementById("inp-geocode").value + ' je to '
        + Math.round(dist / 1000)
        + ' km <br><i><a target="_blank" href="https://www.irozhlas.cz/zpravy-domov/data-statni-spravy-otevrena-data-chmu_1809140600_hm">Proč tu není bližší stanice?</a></i>'
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
        headerFormat: '<span style="font-size:10px">rok {point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    legend: {
      enabled: false,
    },
    series: [{
        name: 'tropické dny',
        data: Object.values(maxtemps[statID])
    }]
  });
}

$("#inp-geocode").on("focus input", () => $("#inp-geocode").css("border-color", "black"));

// geocoder
const form = document.getElementById("frm-geocode");
form.onsubmit = function submitForm(event) {
  event.preventDefault();
  const text = document.getElementById("inp-geocode").value;
  if (text === "") {
    map_left.flyTo({
      center: [15.3350758, 49.7417517],
      zoom: 7,
    });
  } else {
    $.get(`https://api.mapy.cz/geocode?query=${text}`, (data) => {
      if (typeof $(data).find("item").attr("x") === "undefined") {
        $("#inp-geocode").css("border-color", "red");
        return;
      }
      const x = parseFloat($(data).find("item").attr("x"));
      const y = parseFloat($(data).find("item").attr("y"));
      if (x < 12 || x > 19 || y < 48 || y > 52) { // omezení geosearche na Česko, plus mínus
        $("#inp-geocode").css("border-color", "red");
        return;
      }
      let closestID = findNearby([y, x]);
      drawChart(closestID);
    }, "xml");
  }
};
