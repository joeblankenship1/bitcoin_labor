(function() {

    // map options
    var options = {
        scrollWheelZoom: false,
        zoomSnap: .1,
        dragging: true,
        zoomControl: true,
        center: [20, 0],
        zoom: 3,
    };
    // create the Leaflet map
    var map = L.map('interactivemap', options);
    // request tiles and add to map
    var tiles = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.{ext}', {
        attribution: '<a href="https://stamen.com">Stamen Design</a> - <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        ext: 'png',
        opacity: 0.5
    }).addTo(map);

    var cables = $.getJSON("data/cables.json", function(data) {
        L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: 'yellow',
                    weight: 0.5,
                    opacity: 0.65
                };
            }
        }).addTo(map);
    });

    var landingPoints = $.getJSON("data/landingPoints.json", function(data) {

        var geojsonMarkerOptions = {
            radius: 3,
            fillColor: "#73b553",
            color: "gray",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions)
            }
        }).addTo(map);
    });

    var landingPoint_density = $.getJSON("data/landingPoints.json", function(data) {
        var locations = data.features.map(function(nodes) {
            var location = nodes.geometry.coordinates.reverse();
            location.push(0.5);
            return location;
        });

        var heat = L.heatLayer(locations, {radius: 25, gradient: {1: 'red'}, blur: 0});
        map.addLayer(heat);

    });

    var bitnodes_data = $.getJSON("data/bitnodes.json", function(data) {

        var geojsonMarkerOptions = {
            radius: 2,
            fillColor: "#ffcd37",
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions)
            }
        }).addTo(map);
    });

    var bitnodes_density = $.getJSON("data/bitnodes.json", function(data) {
        var locations = data.features.map(function(nodes) {
            var location = nodes.geometry.coordinates.reverse();
            location.push(0.5);
            return location;
        });

        var heat = L.heatLayer(locations, {radius: 25, gradient: {1: 'blue'}, blur: 0});
        map.addLayer(heat);

    });

    /*
    var baseMaps = {
        "Stamen": tiles
    };

    var overlayMaps = {
        "Bitnodes": bitnodes,
        "Cables": cables,
        "Landing Points": landingPoints,
        "Node Density": bitnodes_density,
        "Landing Points Density": landingPoint_density
    };


    L.control.layers(baseMaps, overlayMaps).addTo(map);
    */
    map.fitBounds([
        [90, -180],
        [-90, 180]
    ]);

    map.setZoom(map.getZoom() - .2);

})();
