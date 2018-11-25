/**
 * Wait for Google Maps
 * @type {number}
 */
let stateCheck = setInterval(() => {
    if (window.google) {
        clearInterval(stateCheck);
        mapGo();
    }
}, 100);


/**
 * Maps is ready!
 */
var mapGo = () => {
    var input = document.querySelector('.acf-google-map .search');

    selectFirstOnEnter(input);

    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', function() {

        var place = autocomplete.getPlace();

        if (!place.geometry || !place) {//no place found
            return;
        }

        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();

        if (place.address_components) {

            var addressNumber = place.address_components[0] && place.address_components[0].short_name || '';
            var addressStreet = place.address_components[1] && place.address_components[1].short_name || '';
            var city = place.address_components[3] && place.address_components[3].short_name || '';
            var state = place.address_components[5] && place.address_components[5].short_name || '';
            var country = place.address_components[6] && place.address_components[6].short_name || '';
            var postal = place.address_components[7] && place.address_components[7].short_name || '';
            var location = {
                address: addressNumber + ' ' + addressStreet,
                city,
                state,
                country,
                code: postal,
                lat: latitude,
                lng: longitude
            };
            addressData(location);
            openAddressSection();


        }

    });
};

/**
 * Select First Item in Autocomplete
 * @param input
 */
function selectFirstOnEnter (input) {// store the original event binding function
    var _addEventListener = (input.addEventListener)
        ? input.addEventListener
        : input.attachEvent;

    if (input.addEventListener) {
        input.addEventListener = addEventListenerWrapper(_addEventListener, input);
    } else if (input.attachEvent) {
        input.attachEvent = addEventListenerWrapper(_addEventListener, input);
    }
}


function addEventListenerWrapper (_addEventListener, input) {

    return function(type, listener) {
        // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected, and then trigger the original listener.
        if (type == 'keydown') {
            var orig_listener = listener;
            listener = function(event) {
                var suggestion_selected = $('.pac-item-selected').length > 0;
                if (event.which == 13 && !suggestion_selected) {
                    var simulated_downarrow = $.Event('keydown', {
                        keyCode: 40,
                        which: 40
                    });
                    orig_listener.apply(input, [simulated_downarrow]);
                }
                orig_listener.apply(input, [event]);
            };
        }
        _addEventListener.apply(input, [type, listener]); // add the modified listener
    };
}

/**
 * Set location data to address
 * @param location
 */
function addressData (location) {
    document.querySelector('#acf-field_5be34ec803381').value = location.address; // Address
    document.querySelector('#acf-field_5be34f4c03383').value = location.city; // City
    document.querySelector('#acf-field_5be34f5a03384').value = location.state; // State
    document.querySelector('#acf-field_5be34f6c03385').value = location.country; // Country
    document.querySelector('#acf-field_5be34f7603386').value = location.code; // Postal
    document.querySelector('#acf-field_5be34f9d03387-field_5be34ff903388').value = location.lat; // Lat
    document.querySelector('#acf-field_5be34f9d03387-field_5be3500303389').value = location.lng; // Lng
}

/**
 * Open Address and close map
 */
function openAddressSection () {
    //Hide Location Map
    var locationData = document.querySelector('.acf-field-5be99e0603777');
    locationData.classList.remove('-open');
    locationData.querySelector('.acf-accordion-icon')
        .classList
        .remove('dashicons-arrow-down');
    locationData.querySelector('.acf-accordion-icon')
        .classList
        .add('dashicons-arrow-right');
    locationData.querySelector('.acf-accordion-content').style.display = 'none';

    //Display Address Section
    var address = document.querySelector('.acf-field-5be34b0603380');
    address.classList.add('-open');
    address.querySelector('.acf-accordion-icon')
        .classList
        .add('dashicons-arrow-down');
    address.querySelector('.acf-accordion-icon')
        .classList
        .remove('dashicons-arrow-right');
    address.querySelector('.acf-accordion-content').style.display = 'block';
}
