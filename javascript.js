let fromLatitude;
let fromLongitude;
const suggestedLocation = document.getElementById('suggestedLocation');
const suggestedDestination = document.getElementById('suggestedDestination');

document.getElementById('useLocation').addEventListener('click', () => {
    // check if the browser supports geolocation
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            // get latitude and longitude
            fromLatitude = position.coords.latitude;
            fromLongitude = position.coords.longitude;
            // set text of p element to latitude and longitude
            drawMap(fromLatitude, fromLongitude);
            document.getElementById('locationInput').value = 'Moja poloha';
        });
    }
});

document.getElementById('locationInput').addEventListener('input', () => {
    searchAddresses('from', document.getElementById('locationInput').value);
});
document.getElementById('destinationInput').addEventListener('input', () => {
    searchAddresses('to', document.getElementById('destinationInput').value);
});
function drawMap(lat, lng) {
    const src = `https://www.freemap.sk/#map=13/${lat}/${lng}&layers=O&point=${lat}/${lng}%1EC%23ff6251&embed=noMapSwitch,noLocateMe`;
    document.getElementById('map-iframe').src = src;
}

function searchAddresses(direction, filter) {
    if (direction === 'from') {
        suggestedLocation.innerHTML = '';
    } else if (direction === 'to') {
        suggestedDestination.innerHTML = '';
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://clientapi.dopravnakarta.sk/api/v2/GetLocationsByAddressFilter');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-API-Key', '00112233445566778899');
    xhr.setRequestHeader('X-App-Version', '1');
    xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        const addresses = response.AddressesLocations;
        updateSuggestedLocations(direction, addresses);
    };
    xhr.send(
        JSON.stringify({
            filter: filter,
            maxCount: 64,
            latitude: 3.1,
            longitude: 4.1,
            stopTypes: 64,
            cityID: 0,
        })
    );
}


function updateSuggestedLocations(direction, addresses) {
    if (direction === 'from') {
        addresses.forEach((address) => {
            const li = document.createElement('li');
            li.innerHTML = address.LocationName;
            li.classList.add('list-group-item-action');
            li.setAttribute('data-bs-toggle', 'offcanvas');
            li.setAttribute('data-bs-target', '#offcanvasBottom');
            li.setAttribute('aria-controls', 'offcanvasBottom');
            li.setAttribute('data-bs-scroll', 'true');
            suggestedLocation.appendChild(li);
            li.addEventListener('click', () => {
                document.getElementById('locationInput').value = address.LocationName;
                fromLatitude = address.Latitude;
                fromLongitude = address.Longitude;

                drawMap(fromLatitude, fromLongitude);
            });
        });
    }
    else if (direction === 'to') {
        addresses.forEach((address) => {
            const li = document.createElement('li');
            li.innerHTML = address.LocationName;
            li.innerHTML = address.LocationName;
            li.classList.add('list-group-item-action');
            suggestedDestination.appendChild(li);
            li.addEventListener('click', () => {
                document.getElementById('destinationInput').value = address.LocationName;
                });});
            
}};