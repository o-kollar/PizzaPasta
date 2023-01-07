let fromLatitude;
let fromLongitude;
let toLatitude;
let toLongitude;
let map;

const suggestedLocation = document.getElementById('suggestedLocation');
const accessToken = 'jR4PvdBCd8gBm7fxteQk7nhWntWn9XRbdPTVn7Sbcq4kV41ZoqgKpyKnPDHUmDwd';

window.onload = function loadmap() {
    map = new maplibregl.Map({
        container: 'map',
         style: `https://api.jawg.io/styles/jawg-sunny.json?access-token=${accessToken}`,
        zoom: 6,
        center: [17.11904355960693, 48.16150637919123],
    });
    getLocation();
};

document.getElementById('useLocation').addEventListener('click', () => {
    getLocation();
});

document.getElementById('locationInput').addEventListener('input', () => {
    searchAddresses(document.getElementById('locationInput').value);
});

function drawMap(lat, lng, zoom) {
    map.easeTo({
        duration: 2500,
        center: [lng, lat - 0.002],
        zoom: 15,
        bearing: 0,
    });
    new maplibregl.Marker({ color: '#FF5733' }).setLngLat([lng, lat]).addTo(map);
}

// This plugin is used for right to left languages
maplibregl.setRTLTextPlugin('https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js');

function searchAddresses(filter) {
    suggestedLocation.innerHTML = '';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://clientapi.dopravnakarta.sk/api/v2/GetLocationsByAddressFilter');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-API-Key', '00112233445566778899');
    xhr.setRequestHeader('X-App-Version', '1');
    xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        const addresses = response.AddressesLocations;
        updateSuggestedLocations(addresses);
    };
    xhr.send(
        JSON.stringify({
            filter: filter,
            maxCount: 4,
        })
    );
}

function updateSuggestedLocations(addresses) {
    addresses.forEach((address) => {
        let location = '';
        let region = '';
        for (const component of address.AddressComponents) {
            if (component.Types.includes('locality')) {
                location = component.LongName;
            } else if (component.Types.includes('administrative_area_level_1')) {
                region = component.LongName;
            }
        }
        const parts = address.LocationName.split(', ').slice(0, 2);
        const newLocationName = parts.join(', ');
        const li = document.createElement('li');
        li.classList.add('py-3', 'sm:py-4', 'dropdown-item', 'z-30');

        const div1 = document.createElement('div');
        div1.classList.add('flex', 'items-center', 'space-x-4');
        li.appendChild(div1);

        const div2 = document.createElement('div');
        div2.classList.add('flex-1', 'min-w-0');
        div1.appendChild(div2);

        const p1 = document.createElement('p');
        p1.id = 'locationName';
        p1.classList.add('text-sm', 'font-medium', 'text-gray-900', 'truncate', 'dark:text-white');
        p1.innerHTML = newLocationName;
        div2.appendChild(p1);

        const p2 = document.createElement('p');
        p2.classList.add('text-sm', 'text-gray-500', 'truncate', 'dark:text-gray-400');
        p2.innerHTML = `${location}, ${region}`;
        div2.appendChild(p2);

        const div3 = document.createElement('div');
        div3.classList.add('inline-flex', 'items-center', 'text-base', 'font-semibold', 'text-gray-900', 'dark:text-white');
        div1.appendChild(div3);

        const span = document.createElement('span');
        span.classList.add('material-symbols-outlined');
        span.innerHTML = 'location_on';
        div3.appendChild(span);

        suggestedLocation.appendChild(li);
        li.addEventListener('click', () => {
            document.getElementById('locationInput').value = address.LocationName;
            toLatitude = address.Latitude;
            toLongitude = address.Longitude;
            while (suggestedLocation.firstChild) {
                suggestedLocation.removeChild(suggestedLocation.firstChild);
            }
            drawMap(toLatitude, toLongitude);
            getTimeTable();
        });
    });
}
function getLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            // get latitude and longitude
            fromLatitude = position.coords.latitude;
            fromLongitude = position.coords.longitude;
            // set text of p element to latitude and longitude
            drawMap(fromLatitude, fromLongitude);
        });
    }
}

function getRoute(coordinates) {
    let request = new XMLHttpRequest();
    let path;

    request.open('POST', 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson');

    request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', '5b3ce3597851110001cf62483ebea98c0bae4f6c908c95577406b143');

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            path = JSON.parse(this.responseText);

            map.addSource('route', {
                type: 'geojson',
                data: path,
            });
            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#8ae3eb',
                    'line-width': 8,
                },
            });
        }
    };

    const body = `{"coordinates":[${coordinates}]}`;

    request.send(body);
}

function getTimeTable() {
    const currentTime = new Date();
    const formattedTime = currentTime.toISOString();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://clientapi.dopravnakarta.sk/api/v2/GetConnectionsFromLocationToLocation', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.setRequestHeader('X-API-Key', '00112233445566778899');
    xhr.setRequestHeader('X-App-Version', '1');
    xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        const connections = response.Connections;
        displayTimeTable(connections);
    };

    const formData = {
        originLatitude: fromLatitude,
        originLongitude: fromLongitude,
        destinationLatitude: toLatitude,
        destinationLongitude: toLongitude,
        departures: true,
        dateTime: formattedTime,
        maxWalkingMeters: 1000,
        maxTransfers: 4,
        maxCount: 10,
        stopTypes: 7,
        cityID: 0,
        sorting: 0,
    };

    const params = new URLSearchParams();
    for (const key in formData) {
        params.set(key, formData[key]);
    }

    xhr.send(params);
}
function Table(connections) {
    let stops = [`[${fromLongitude}, ${fromLatitude}]`];
    connections.forEach((connection) => {
        console.log('Connection:', connection);
        const minutes = connection.TotalMinutesTraveled;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        const outerDiv = document.createElement('div');
        outerDiv.className = 'max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700';

        const link = document.createElement('a');
        link.href = '#';

        const heading = document.createElement('h6');
        heading.className = 'mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white';
        if(hours === 0){heading.textContent = `${remainingMinutes}m`;}
        else {heading.textContent = `${hours}h ${remainingMinutes}m`;}
        link.appendChild(heading);

        const ul = document.createElement('ul');
        ul.className =
            'w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white';

        connection.ConnectionSegments.forEach((segment) => {
            const fromStop = segment.FromStop.StopName;
            const timestamp = segment.FromDepartureTime;

            // Split the timestamp into its individual parts
            const dateStr = timestamp.split('T')[0];
            const timeStr = timestamp.split('T')[1];
            const offsetStr = timeStr.substring(timeStr.length - 6);

            // Convert the time zone offset to the number of hours it represents
            const offsetHours = parseInt(offsetStr.substring(1, 3));

            // Add the time zone offset to the time
            const date = new Date(`${dateStr}T${timeStr.substring(0, timeStr.length - 6)}Z`);
            date.setHours(date.getHours() + offsetHours);

            // Use the toLocaleTimeString method to display the time in 24-hour format
            const options = {
                hour: 'numeric',
                minute: 'numeric',
                hour12: false,
            };
            const formattedTime = date.toLocaleTimeString('en-US', options);
            console.log(formattedTime); // Outputs "22:59"
            const stopName = segment.ToStop.StopName;
            const arrivalTime = segment.ToArrivalTime;
            console.log('segment', segment);
            const li = document.createElement('li');
            if (segment.TimeTableTrip !== null) {
                li.textContent = `${segment.TimeTableTrip.TimeTableLine.Line}, ${formattedTime}`;
            } else {
                li.textContent = `${formattedTime}`;
            }
            ul.appendChild(li);

            const li2 = document.createElement('li');
            li2.textContent = `${segment.ToStop.StopName}, `;
            ul.appendChild(li2);

            link.appendChild(ul);
            outerDiv.appendChild(link);

            // Append the outerDiv to the desired parent element
            const parent = document.getElementById('drawer-bottom-example');
            parent.appendChild(outerDiv);

            if (segment.ToStop.AvgLatitude !== 0 && segment.ToStop.AvgLongitude !== 0) {
                stops.push(`[${segment.ToStop.AvgLongitude}, ${segment.ToStop.AvgLatitude}]`);
            }
        });
    });
    stops.push(`[${toLongitude}, ${toLatitude}]`);

    getRoute(stops);
}


function displayTimeTable(connections) {
    let stops = [`[${fromLongitude}, ${fromLatitude}]`];
    connections.forEach((connection) => {
      console.log('Connection:', connection);
      const minutes = connection.TotalMinutesTraveled;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
  
      // Create the outer div element
      const outerDiv = document.createElement('div');
      outerDiv.className = 'flex flex-col items-center bg-white border rounded-lg shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700';
  
      // Create the inner div element
      const innerDiv = document.createElement('div');
      innerDiv.className = 'flex flex-col justify-between p-4 leading-normal';
  
      // Create the heading element
      const heading = document.createElement('h5');
      heading.className = 'mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white';
      if (hours === 0) {
        heading.textContent = `${remainingMinutes}m`;
      } else {
        heading.textContent = `${hours}h ${remainingMinutes}m`;
      }
  
      // Create the ordered list element
      const ol = document.createElement('ol');
      ol.className = 'relative border-l border-gray-200 dark:border-gray-700';
  
      connection.ConnectionSegments.forEach((segment) => {
        if (segment.ToStop.AvgLatitude !== 0 && segment.ToStop.AvgLongitude !== 0) {
            stops.push(`[${segment.ToStop.AvgLongitude}, ${segment.ToStop.AvgLatitude}]`);
        }
        const fromStop = segment.FromStop.StopName;
        const timestamp = segment.FromDepartureTime;
  
        // Split the timestamp into its individual parts
        const dateStr = timestamp.split('T')[0];
        const timeStr = timestamp.split('T')[1];
        const offsetStr = timeStr.substring(timeStr.length - 6);
  
        // Convert the time zone offset to the number of hours it represents
        const offsetHours = parseInt(offsetStr.substring(1, 3));
  
        // Add the time zone offset to the time
        const date = new Date(`${dateStr}T${timeStr.substring(0, timeStr.length - 6)}Z`);
        date.setHours(date.getHours() + offsetHours);
  
        // Use the toLocaleTimeString method to display the time in 24-hour format
        const options = {
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        };
        const formattedTime = date.toLocaleTimeString('en-US', options);
  
        // Create the list item element
        const li = document.createElement('li');
        li.className = 'mb-10 ml-4';
  
        // Create the div element
        const div = document.createElement('div');
        div.className = 'absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700';
      // Create the span element
      const span = document.createElement('span');
      span.className = 'bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-red-400 border border-red-400';
      if (segment.TimeTableTrip !== null) {
        span.textContent = `${segment.TimeTableTrip.TimeTableLine.Line}`;
    }else{span.textContent = `ABC`;}
    const icon = document.createElement('span');
icon.className = 'material-symbols-outlined';
icon.textContent = 'tram';

span.appendChild(icon);
      

      // Create the time element
      const time = document.createElement('time');
      time.className = 'mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500';
      time.textContent = formattedTime;

      // Create the heading element
      const h3 = document.createElement('h3');
      h3.className = 'text-lg font-semibold text-gray-900 dark:text-white';
      h3.textContent = segment.ToStop.StopName;

      // Append all the elements to the list item
      li.appendChild(div);
      li.appendChild(span);
      li.appendChild(time);
      li.appendChild(h3);

      // Append the list item to the ordered list
      ol.appendChild(li);
    });

    // Append the heading and ordered list to the inner div element
    innerDiv.appendChild(heading);
    innerDiv.appendChild(ol);

    // Append the inner div element to the outer div element
    outerDiv.appendChild(innerDiv);

    // Append the outer div element to the body
    const parent = document.getElementById('drawer-bottom-example');
            parent.appendChild(outerDiv);
            
  });
  getRoute(stops);
}
  
