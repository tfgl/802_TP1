const URL="http://127.0.0.1:3000"
mapboxgl.accessToken = 'pk.eyJ1IjoiYW9ldSIsImEiOiJjbDA2czl2b3AwMGxzM2xxcHBtcm5vMm94In0.ImFR4kwS9cJ8tnz5jKBd4Q'; 
let parcour = {travelTime: 0, distance: 0};

function changeDoc() {
  document.getElementsByTagName("body")[0].innerHTML = `
    <div id="map"></div>
    <div id="info-box" class="info-box">
    <button type="button" id="reset">reset</button>
    <div id="info"></div>
  `;
}

const directionsEvent = (map, car) => {
  return async (event) => {
    const steps = event.route[0].legs[0].steps;
    parcour.distance   = event.route[0].distance / 1000;
    parcour.travelTime = event.route[0].duration / 3600;

    let data = await post(URL + "/rest/itineraire", {steps, car})

    let h = Math.floor( parcour.travelTime )
    let min = Math.floor((parcour.travelTime % 1) * 60)

    let html = `<p>travel time: ${h}h${min}</p>
<p>total distance: ${parcour.distance}km</p><br/><hr><br/>`;

    console.log(data)
    data.stations.forEach( station => html = `${html}<p>${station.n_station}</p>`);

    document.getElementById("info").innerHTML = html;

  }
}

function initMap(car) {
  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [3, 46],
    zoom: 6
  });

  let directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    alternatives: false,
    geometries: 'geojson',
    controls: { instructions: false },
    flyTo: false
  });

  map.addControl(directions, 'top-right');

  directions.on('route', directionsEvent(map, car))

  return map;
}

function resetButton(map) {
  document.getElementById("reset").addEventListener('click', () => {
    console.log("reset");
    let info = document.getElementById("info");
    info.innerHTML = ""
  })
}

async function main() {
  await load()

  let tiles = document.getElementsByClassName('tile');
  Object.values(tiles).forEach( tile => {
    tile.addEventListener('click', () => {
      let car = tile.children[0].innerText;

      // change view to map
      changeDoc()

      // create the map
      const map = initMap(car)

      // reset map button
      resetButton(map)

    });
  });
}

main()


/*

        if(stops.length >= 2) {
          if( map.getSource('route') ) {
            map.removeLayer('route');
            map.removeSource('route');
          }
          map.addSource('route', {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': points
              }
            }
          });
          map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#888',
              'line-width': 8
            }
          });

          const options = {
            method: 'POST',
            body: JSON.stringify({stops, car}),
            headers: {
              'Content-Type': 'application/json'
            }
          };

          fetch(URL + "/rest/trajet", options).then( data => {
            let dataDoc = document.getElementById("data");
            dataDoc.innerHTML = "";
            data.text().then( dataText => {
              datajson = JSON.parse(dataText);
              console.log(datajson.travelTime)
              let time = document.createElement("p")
              let h = Math.floor(datajson.travelTime)
              let min = Math.floor((datajson.travelTime % 1) * 60)
              time.innerText = `travel time: ${h}h${min}`
              dataDoc.appendChild(time)
              let dst = document.createElement("p")
              dst.innerText = `total distance: ${datajson.dstTotal}km`
              dataDoc.appendChild(dst);
            })
          })
        }
        console.log(stops);
*/

const request = method => {
  if( method == 'POST' ) {
    return async function (url, data) {
      const options = {
        method,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const rawData = await fetch(url, options);
      const textData = await rawData.text();
      return JSON.parse(textData);
    }
  } else if( method == 'GET' ){
    return async function (url) {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const rawData = await fetch(url, options);
      const textData = await rawData.text();
      return JSON.parse(textData);
    }
  }
}

async function get(url) {
  return await request('GET')(url);
}

async function post(url, data) {
  return await request('POST')(url, data);
}
