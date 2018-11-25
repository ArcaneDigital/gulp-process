'use strict';

NodeList.prototype.forEach = NodeList.prototype.forEach || Array.prototype.forEach;

let map;
let markers = [];
let bounds;

const intervalInt = setInterval(function() {
    if (typeof window.google === 'undefined') {
        return;
    }
    if (typeof window.google.maps === 'undefined') {
        return;
    }
    searchMap();
    clearInterval(intervalInt);
}, 100);

function searchMap() {
    const mapCanvas = document.getElementById('map');
    if (mapCanvas) {
        searchMapLoader(mapCanvas, mapCenterLat, mapCenterLng);
        boundsInit();
    }
}

// Loading google map, setting markers - Results page
function searchMapLoader(mapCanvas, centerLat, centerLng) {
    map = new google.maps.Map(mapCanvas, {
        center: {lat: centerLat, lng: centerLng},
        zoom: 13,
        mapTypeControl: false,
        gestureHandling: 'cooperative'
    });

    if (document.querySelector('#locationResultTemplate')) {
        GlobalMapLocations.locations.forEach(location => {
            setGeneralMarkers(location);
        });
    }

    map.setOptions({styles: mapCustomStyles()});
}

function setGeneralMarkers(data) {
    let marker = new google.maps.Marker({
        position: {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude)
        },
        map: map,
        title: data.location_name,
        icon: generalIcon
    });
    markers.push(marker);
}

function boundsInit() {
    if (markers.length < 1) {
        return;
    }
    bounds = new google.maps.LatLngBounds();
    markers.forEach(marker => {
        bounds.extend(marker.position);
    });
    zoomInit();

    map.fitBounds(bounds);
}

function zoomInit() {
    google.maps.event.addListener(map, 'zoom_changed', function () {
        let zoomChangeBoundsListener =
            google.maps.event.addListener(map, 'bounds_changed', function () {
                if (this.getZoom() > 13 && this.initialZoom == true) {
                    this.setZoom(13);
                    this.initialZoom = false;
                }
                google.maps.event.removeListener(zoomChangeBoundsListener);
            });
    });
    map.initialZoom = true;
}

function mapCustomStyles() {
    const styles = [
        {
            'featureType': 'administrative',
            'elementType': 'labels.text.fill',
            'stylers': [
                {
                    'color': '#444444'
                }
            ]
        },
        {
            'featureType': 'landscape',
            'elementType': 'all',
            'stylers': [
                {
                    'color': '#f2f2f2'
                }
            ]
        },
        {
            'featureType': 'poi',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi.business',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'visibility': 'on'
                }
            ]
        },
        {
            'featureType': 'road',
            'elementType': 'all',
            'stylers': [
                {
                    'saturation': -100
                },
                {
                    'lightness': 45
                }
            ]
        },
        {
            'featureType': 'road.highway',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'simplified'
                }
            ]
        },
        {
            'featureType': 'road.arterial',
            'elementType': 'labels.icon',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'transit',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'water',
            'elementType': 'all',
            'stylers': [
                {
                    'color': '#b4d4e1'
                },
                {
                    'visibility': 'on'
                }
            ]
        }
    ];
    return styles;
}
