const URL="http://127.0.0.1:3000"
mapboxgl.accessToken = 'pk.eyJ1IjoiYW9ldSIsImEiOiJjbDA2czl2b3AwMGxzM2xxcHBtcm5vMm94In0.ImFR4kwS9cJ8tnz5jKBd4Q'; 
let stops = [];
let points = [];
let dst = [];
let markers = [];

function changeDoc() {
  document.getElementsByTagName("body")[0].innerHTML = `
    <div id="map"></div>
    <div id="info-box" class="info-box">
    <button type="button" id="reset">reset</button>
    <div id="data"></div>
    <div id="directions"></div>
  `;
}

function initMap() {
  return new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [3, 46], // starting position [lng, lat]
    zoom: 6 // starting zoom
  });
}

function resetButton(map) {
  document.getElementById("reset").addEventListener('click', event => {
    console.log("reset");
    let dataDoc = document.getElementById("data");
    dataDoc.innerHTML = ""
    stops = [];
    points = [];
    dst = [];
    markers.forEach( marker => {marker.remove()});
    if( map.getSource('route') ) {
      map.removeLayer('route');
      map.removeSource('route');
    }
  })
}

// for each card, on click, the car and show the map
Object.values(document.getElementsByClassName('tile')).forEach( el => {
  el.addEventListener('click', event => {
    let car = el.children[0].innerText;

    // change view to map
    changeDoc()

    // create the map
    const map = initMap()

    // reset map button
    resetButton(map)

    // add a stop an click, send stops to api if stops.length >= 2
    map.on('click', async e => {
      let point = [e.lngLat.lng, e.lngLat.lat]
      points.push(point)
      stops.push(e.lngLat);

      const marker = new mapboxgl.Marker()
      .setLngLat(point)
      .addTo(map);
      markers.push(marker);

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
    })
  });
});

