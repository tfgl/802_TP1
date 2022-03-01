async function load() {
  const URL="http://127.0.0.1:3001/soap"
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  let carArray = document.getElementById("array");

  // appel a l'api soap
  const rawData = await fetch(URL, options);
  const textData = await rawData.text();
  const cars = JSON.parse(textData).response.result;

  cars.forEach( car => {
    const tile = document.createElement("div");

    tile.setAttribute("class", "tile")
    tile.innerHTML = `
      <h2>${car.name}</h2>
      <img src="images/hyunda.jpg" width="250" height="250"></img>
      <ul>
        <li class="autonomie" >autonomie: ${car.autonomy}</li>
        <li class="reloadTime">temps de rechargement: ${car.fast}</li>
      </ul>
    `;

    carArray.appendChild(tile);
  })
}

