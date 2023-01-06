let fromLatitude;
let fromLongitude;
let toLatitude;
let toLongitude;

const suggestedLocation = document.getElementById('suggestedLocation');
const suggestedDestination = document.getElementById('suggestedDestination');
window.onload = function(){getLocation()};

document.getElementById('useLocation').addEventListener('click', () => {
    getLocation();
});

document.getElementById('locationInput').addEventListener('input', () => {
    searchAddresses(document.getElementById('locationInput').value);
});
function drawMap(lat, lng) {
    const src = `https://www.freemap.sk/#map=13/${lat}/${lng}&layers=O&point=${lat}/${lng}%1EC%23ff6251&embed=noMapSwitch,noLocateMe`;
    document.getElementById('map-iframe').src = src;
}

function searchAddresses( filter) {
    suggestedLocation.innerHTML='';
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
            console.log(address);
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
            li.classList.add('py-3', 'sm:py-4', 'dropdown-item');

            const div1 = document.createElement('div');
            div1.classList.add('flex', 'items-center', 'space-x-4');
            li.appendChild(div1);

            const div2 = document.createElement('div');
            div2.classList.add('flex-1', 'min-w-0');
            div1.appendChild(div2);

            const p1 = document.createElement('p');
            p1.id = 'locationName';
            p1.classList.add('text-sm', 'font-medium', 'text-gray-900', 'truncate', 'dark:text-white');
            p1.innerHTML = newLocationName
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
