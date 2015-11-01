function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        disableDefaultUI: true,
        zoomControl: true,
        center: {lat: 49, lng: 31} //Ukraine
    });
    var originIcon = 'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=A&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1';
    var destIcon='https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-b.png&text=B&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1';
    var originMarker = new google.maps.Marker({ icon: originIcon, draggable:true});
    var destMarker = new google.maps.Marker({ icon: destIcon, draggable:true});
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        preserveViewport: true
        //panel: document.getElementById('right-panel') //to display route details in right panel
    });

    var geocoder = new google.maps.Geocoder();


    //
    var infowindow = new google.maps.InfoWindow();//TODO: do something so it will work
    //

    var geodesicPoly = new google.maps.Polyline({
        strokeColor: '#444444',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        geodesic: true,
        map: map
    });


    originMarker.addListener('dragend', function(){
        updateRoute(infowindow, directionsDisplay, directionsService, map, geocoder, originMarker, originMarker.getPosition(), destMarker.getPosition(), geodesicPoly );
    });
    destMarker.addListener('dragend', function(){
        updateRoute(infowindow, directionsDisplay, directionsService, map, geocoder, destMarker, originMarker.getPosition(), destMarker.getPosition(), geodesicPoly );
    });


    google.maps.event.addListener(map, 'click', function(event) {
        if(originMarker.position == null) {
            originMarker.setOptions({
                position: event.latLng,
                map: map
            });
            geocodeAddress(infowindow, geocoder, originMarker);
        }
        else {
            if(destMarker!=null)
                destMarker.setMap(null);
            directionsDisplay.setMap(map);
            destMarker.setOptions({
                position: event.latLng,
                map: map
            });
            displayRoute(originMarker.getPosition(), destMarker.getPosition(), directionsService, directionsDisplay);
            geocodeAddress(infowindow, geocoder, destMarker);
            drawPoly(originMarker.getPosition(), destMarker.getPosition(), geodesicPoly, map );
        }

    });

    $(".glyphicon-map-marker").on('click', function(e){
        var el = $(this);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                if(el.hasClass('origin')){
                    originMarker.setOptions({
                        position: pos,
                        map: map
                    });
                    updateRoute(infowindow, directionsDisplay, directionsService, map, geocoder, originMarker, originMarker.getPosition(), destMarker.getPosition(), geodesicPoly );
                }else{
                    destMarker.setOptions({
                        position: pos,
                        map: map
                    });
                    updateRoute(infowindow, directionsDisplay, directionsService, map, geocoder, destMarker, originMarker.getPosition(), destMarker.getPosition(), geodesicPoly );
                }
                map.setCenter(pos);
                console.log(el.next());
            }, function() {
                console.log('got it! ho ho ho, I find you!!!')
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });


}


function clearRoute(display){
    display.setDirections(new Object());
}

function drawPoly(origin, dest, geodesicPoly, map) {
    var path = [origin,dest];
    geodesicPoly.setPath(path);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(origin, dest);
    $('#flightDistance').text((distance/1000).toFixed(2).toString()+" км");
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(dest);
    bounds.extend(origin);
    map.fitBounds(bounds);
}

function geocodeAddress(infowindow, geocoder, marker) {
    infowindow.close();
    geocoder.geocode({location: marker.getPosition()}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            infowindow.setContent('<div><strong>' + results[0].formatted_address + '</strong></div>');
            infowindow.open(map, marker);
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function displayRoute(origin, destination, service, display) {
    service.route({
        origin: origin,
        destination: destination,
        //waypoints: [{location: 'Cocklebiddy, WA'}, {location: 'Broken Hill, NSW'}], //for adding waypoints
        travelMode: google.maps.TravelMode.DRIVING
        //avoidTolls: true
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            computeTotalDistance(response);
            display.setDirections(response);
        } else {
            document.getElementById('total').innerHTML = '';
            console.log('Could not display directions due to: ' + status);
            display.setMap(null);
        }
    });
}

function computeTotalDistance(result) {
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }
    total = (total / 1000).toFixed(2);
    document.getElementById('total').innerHTML = total + ' км';
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function updateRoute(infowindow, display, service, map, geocoder, marker, originPosition, destPosition, poly ){
    display.setMap(map);
    geocodeAddress(infowindow, geocoder, marker);
    displayRoute(originPosition, destPosition, service, display);
    drawPoly(originPosition, destPosition, poly, map );
}
