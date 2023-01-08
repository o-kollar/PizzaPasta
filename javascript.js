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
            getRoute()
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

function getRoute() {
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

    const body = `{"coordinates":[[${fromLongitude}, ${fromLatitude}],[${toLongitude},${toLatitude}]]}`;

    request.send(body);
}

