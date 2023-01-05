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
            const div = document.createElement('div');
            div.classList.add( 'text-sm');
            div.innerHTML = `
                <div class="flex justify-start cursor-pointer text-gray-700 hover:text-blue-400 hover:bg-blue-100 rounded-md px-2 py-2 my-2">
                    <span class="bg-gray-400 rounded-full"></span>
                    <div class="flex-grow font-medium px-2">${address.LocationName}</div>
                </div>
            `;
            suggestedLocation.appendChild(div);
            div.addEventListener('click', () => {
                document.getElementById('locationInput').value = address.LocationName;
                fromLatitude = address.Latitude;
                fromLongitude = address.Longitude;
                suggestedLocation.innerHTML="";


                drawMap(fromLatitude, fromLongitude);
            });
        });
    }
    else if (direction === 'to') {
        addresses.forEach((address) => {
            const div = document.createElement('div');
            div.classList.add('py-3', 'text-sm');
            div.innerHTML = `
                <div class="flex justify-start cursor-pointer text-gray-700 hover:text-blue-400 hover:bg-blue-100 rounded-md px-2 py-2 my-2">
                    <span class="bg-gray-400 h-2 w-2 m-2 rounded-full"></span>
                    <div class="flex-grow font-medium px-2">${address.LocationName}</div>
                </div>
            `;
            suggestedDestination.appendChild(div);
            div.addEventListener('click', () => {
                document.getElementById('destinationInput').value = address.LocationName;
            });
        });
    }
}
