//TODO: add text search(places) and text search console (https://developers.google.com/places/supported_types) (https://developers.google.com/maps/documentation/javascript/places) (https://developers.google.com/maps/documentation/javascript/places#TextSearchRequests) (https://developers.google.com/maps/documentation/directions/intro) (https://developers.google.com/maps/documentation/javascript/geocoding) (https://developers.google.com/maps/documentation/javascript/directions) (https://developers.google.com/maps/documentation/javascript/places)
//TODO: add autocomplete (https://developers.google.com/maps/documentation/javascript/places-autocomplete) (https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform), (https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete), (https://developers.google.com/maps/documentation/javascript/places-autocomplete), (https://developers.google.com/places/web-service/autocomplete?hl=ru)
//just cool stuff http://www.w3schools.com/googleapi/tryit.asp?filename=tryhtml_map_overlays_animate
//some overall tutorials http://www.w3schools.com/googleapi/google_maps_overlays.asp and http://www.w3schools.com/googleapi/ and http://habrahabr.ru/post/110460/
//useful navigation menus https://developers.google.com/places/web-service/ https://developers.google.com/places/javascript/


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

    var geodesicPoly = new google.maps.Polyline({
        strokeColor: '#444444',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        geodesic: true,
        map: map
    });


    originMarker.addListener('dragend', function(){
        updateRoute(directionsDisplay, directionsService, map, geocoder, originMarker.getPosition(), originMarker.getPosition(), destMarker.getPosition(), "#origin", geodesicPoly );
    });
    destMarker.addListener('dragend', function(){
        updateRoute(directionsDisplay, directionsService, map, geocoder, destMarker.getPosition(), originMarker.getPosition(), destMarker.getPosition(), "#dest", geodesicPoly );
    });

    var inputOrigin = (document.getElementById('origin'));
    var inputDest = (document.getElementById('dest'));
    //var inputDest = (
    //    $('#dest'));

    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputOrigin);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputDest);


    var originAutocomplete = new google.maps.places.Autocomplete(inputOrigin);
    originAutocomplete.bindTo('bounds', map);

    var destAutocomplete = new google.maps.places.Autocomplete(inputDest);
    destAutocomplete.bindTo('bounds', map);

    //var destAutocomplete = new google.maps.places.Autocomplete(inputDest);
    //destAutocomplete.bindTo('bounds', map);
    //var infowindow = new google.maps.InfoWindow();



    originAutocomplete.addListener('place_changed', function(){markPlace(originAutocomplete, originMarker, map, "#origin");});
    destAutocomplete.addListener('place_changed', function(){markPlace(destAutocomplete, destMarker, map, "#dest");});

    function markPlace(autocomplete, marker, selector) {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }

        // If the place has a geometry, then present it on a map.
        //if (place.geometry.viewport) {
        //    map.fitBounds(place.geometry.viewport);
        //} else {
            //map.setCenter(place.geometry.location);
            //map.setZoom(17);  // Why 17? Because it looks good.
        //}
        marker.setOptions({
            position: place.geometry.location,
            map: map
        });

        updateRoute(directionsDisplay, directionsService, map, geocoder, marker.getPosition(), originMarker.getPosition(), destMarker.getPosition(), selector, geodesicPoly );
        fitBounds(map, originMarker.getPosition(), destMarker.getPosition());

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
    }

////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



    //directionsDisplay.addListener('directions_changed', function() {
    //    geocodeAddress(geocoder, directionsDisplay.getDirections().geocoded_waypoints[0].place_id, "#origin", true);
    //    geocodeAddress(geocoder, directionsDisplay.getDirections().geocoded_waypoints[1].place_id, "#dest", true);
    //    computeTotalDistance(directionsDisplay.getDirections());
    //    drawPoly(directionsDisplay.getDirections().request.origin, directionsDisplay.getDirections().request.destination, geodesicPoly );
    //});


    google.maps.event.addListener(map, 'click', function(event) {
        if(originMarker.position == null) {
            originMarker.setOptions({
                position: event.latLng,
                map: map
            });
            geocodeAddress(geocoder, event.latLng, "#origin");
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
            geocodeAddress(geocoder, destMarker.getPosition(), "#dest");
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
                    updateRoute(directionsDisplay, directionsService, map, geocoder, pos, originMarker.getPosition(), destMarker.getPosition(), el.next(), geodesicPoly );
                }else{
                    destMarker.setOptions({
                        position: pos,
                        map: map
                    });
                    updateRoute(directionsDisplay, directionsService, map, geocoder, pos, originMarker.getPosition(), destMarker.getPosition(), el.next(), geodesicPoly );
                }
                map.setCenter(pos);
                console.log(el.next()); //TODO: fix this shit
                //geocodeAddress(geocoder, pos, el.next() );
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
    //var bounds = new google.maps.LatLngBounds({lat: origin.lat(), lng: origin.lng()}, {lat: dest.lat(), lng: dest.lng()});
    fitBounds(map, origin, dest);
}

function fitBounds(map, origin, dest){
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(dest);
    bounds.extend(origin);
    map.fitBounds(bounds);
}

function geocodeAddress(geocoder, coordinates, selector) {
    geocoder.geocode({location: coordinates}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            $(selector).val(results[0].formatted_address);
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

function updateRoute(display, service, map, geocoder, selectedMarkerPosition, originPosition, destPosition, selector, poly ){
    display.setMap(map);
    geocodeAddress(geocoder, selectedMarkerPosition, selector);
    displayRoute(originPosition, destPosition, service, display);
    drawPoly(originPosition, destPosition, poly, map );
}

/*var marker1, marker2;
 var poly, geodesicPoly;

 function initMap() {
 var map = new google.maps.Map(document.getElementById('map'), {
 zoom: 4,
 center: {lat: 34, lng: -40.605}
 });

 map.controls[google.maps.ControlPosition.TOP_CENTER].push(
 document.getElementById('info'));

 marker1 = new google.maps.Marker({
 map: map,
 draggable: true,
 position: {lat: 40.714, lng: -74.006}
 });

 marker2 = new google.maps.Marker({
 map: map,
 draggable: true,
 position: {lat: 48.857, lng: 2.352}
 });

 var bounds = new google.maps.LatLngBounds(
 marker1.getPosition(), marker2.getPosition());
 map.fitBounds(bounds);

 google.maps.event.addListener(marker1, 'position_changed', drawPoly);
 google.maps.event.addListener(marker2, 'position_changed', drawPoly);

 poly = new google.maps.Polyline({
 strokeColor: '#FF0000',
 strokeOpacity: 1.0,
 strokeWeight: 3,
 map: map,
 });

 geodesicPoly = new google.maps.Polyline({
 strokeColor: '#CC0099',
 strokeOpacity: 1.0,
 strokeWeight: 3,
 geodesic: true,
 map: map
 });

 drawPoly();
 }

 function drawPoly() {
 var path = [marker1.getPosition(), marker2.getPosition()];
 poly.setPath(path);
 geodesicPoly.setPath(path);
 var heading = google.maps.geometry.spherical.computeHeading(path[0], path[1]);
 document.getElementById('heading').value = heading;
 document.getElementById('origin').value = path[0].toString();
 document.getElementById('destination').value = path[1].toString();
 }*/

















