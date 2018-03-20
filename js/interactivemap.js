(function() {

    // map options
    var options = {
        scrollWheelZoom: false,
        zoomSnap: .1,
        dragging: true,
        zoomControl: true,
        center: [20, 0],
        zoom: 3,
        layer: [tiles]
    };
    // create the Leaflet map
    var map = L.map('interactivemap', options);
    // request tiles and add to map
    var tiles = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.{ext}', {
        attribution: '<a href="https://stamen.com">Stamen Design</a> - <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        ext: 'png',
        opacity: 0.5
    }).addTo(map);
    var tiles_lite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    	attribution: '<a href="https://stamen.com">Stamen Design</a> - <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    	ext: 'png',
        opacity: 0.5
    });

    map.fitBounds([
        [90, -180],
        [-90, 180]
    ]);

    map.setZoom(map.getZoom() - .2);
    map._layersMinZoom=3;

    //createCheckboxUI();
    drawMap(tiles);

    function drawMap(tiles) { // currentLayer, currentState

        //console.log([currentLayer, currentState]);

        var cablesGroup = L.layerGroup();
        var landingPointsGroup = L.layerGroup();
        var bitnodesGroup = L.layerGroup();
        var bitnodeDensityGroup = L.layerGroup();
        var landingPointsDensityGroup = L.layerGroup();

        var cables = $.getJSON("data/cables.json", function(data) {
            var cablesLayer = L.geoJSON(data, {
                style: function(feature) {
                    return {
                        color: '#163bd6',
                        weight: 3,
                        opacity: 0.4
                    };
                },
                onEachFeature: function(feature, layer) {

                    var props = layer.feature.properties;

                    var tooltipInfo = "<b>Owners: </b>" + props["owners"] +
    								"<br><b>Name: </b>" + props["name"] +
    								"<br><b>Cable ID: </b>" + props["cable_id"] +
    								"<br><b>RFS: </b>" + props["rfs"];

                    layer.bindTooltip('', {
                        sticky: true,
                        tooltipAnchor: [200, 200]
                    })
                    .setTooltipContent(tooltipInfo);
                }
            });
            cablesGroup.addLayer(cablesLayer);
        });

        var landingPoints = $.getJSON("data/landingPoints.json", function(data) {

            var geojsonMarkerOptions = {
                radius: 4,
                fillColor: "#ff5959",
                color: "#f21010",
                weight: 0.8,
                opacity: 0.7,
                fillOpacity: 0.4
            };

            var landingPointsLayer = L.geoJSON(data, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions)
                },
                onEachFeature: function(feature, layer) {

                    var props = layer.feature.properties;

                    var tooltipInfo = "<b>Owners: </b>" + props["owners"] +
    								"<br><b>Name: </b>" + props["name"] +
    								"<br><b>Cable ID: </b>" + props["cable_id"];

                    layer.bindTooltip('', {
                        sticky: true,
                        tooltipAnchor: [200, 200]
                    })
                    .setTooltipContent(tooltipInfo);
                }
            });
            landingPointsGroup.addLayer(landingPointsLayer);
        });

        var bitnodes = $.getJSON("data/bitnodes.json", function(data) {

            var geojsonMarkerOptions = {
                radius: 4,
                fillColor: "#dad147",
                color: "#bdb103",
                weight: 0.8,
                opacity: 0.7,
                fillOpacity: 0.4
            };

            var bitnodesLayer = L.geoJSON(data, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions)
                },
                onEachFeature: function(feature, layer) {

                    var props = layer.feature.properties;

                    var tooltipInfo = "<b>Organization: </b>" + props["Organization_name"] +
    								"<br><b>City: </b>" + props["City"] +
    								"<br><b>Country: </b>" + props["Country_code"] +
                                    "<br><b>ASN: </b>" + props["ASN"];

                    layer.bindTooltip('', {
                        sticky: true,
                        tooltipAnchor: [200, 200]
                    })
                    .setTooltipContent(tooltipInfo);
                }
            });
            bitnodesGroup.addLayer(bitnodesLayer);
        });

        var bitnodes_density = $.getJSON("data/bitnodes.json", function(data) {

            var locations = data.features.map(function(nodes) {
                var location = nodes.geometry.coordinates.reverse();
                location.push(0.5);
                return location;
            });

            var heat = L.heatLayer(locations, {
                minOpacity: 0.1,
                max: 0.9,
                radius: 50,
                gradient: {
                    0.4: '#daa847',
                    1: '#392809'
                },
                blur: 30
            });
            bitnodeDensityGroup.addLayer(heat);
        });

        var landingPoint_density = $.getJSON("data/landingPoints.json", function(data) {
            var locations = data.features.map(function(points) {
                var location = points.geometry.coordinates.reverse();
                location.push(0.5);
                return location;
            });

            var heat = L.heatLayer(locations, {
                minOpacity: 0.1,
                max: 0.9,
                radius: 50,
                gradient: {
                    0.4: '#ff5959',
                    1: '#5c0000'
                },
                blur: 30
            });
            landingPointsDensityGroup.addLayer(heat);
        });

        var baseMaps = {
            "Stamen": tiles,
            "Stamen Lite": tiles_lite
        };

        var overlayMaps = {
            "Submarine Cables": cablesGroup,
            "Landing Points": landingPointsGroup,
            "Bitnodes": bitnodesGroup,
            "Bitnodes Density": bitnodeDensityGroup,
            "Landing Points Density": landingPointsDensityGroup
        };

        L.control.layers(baseMaps, overlayMaps).addTo(map);

        L.control.scale({
            maxWidth: 100
        }).addTo(map);
    }

    /*
    function createCheckboxUI() {
        // create Leaflet control for slider
        var checkboxControl = L.control({
            position: 'bottomleft'
        });
        // define the ui-control within the DOM
        checkboxControl.onAdd = function(map) {
            // use the defined ui-control element
            var checkbox = L.DomUtil.get("ui-controls");
            // diable click events
            L.DomEvent.disableClickPropagation(checkbox);
            return checkbox;
        };
        // add control to map
        checkboxControl.addTo(map);

        $("input[type='checkbox']").on('input change', function() {
            // event defined as currentYear
            var currentLayer = this.name;
            var currentState = this.checked;
            //drawMap(currentLayer, currentState);
        });

    }


    function updateMap() {

        console.log([currentLayer, currentState]);

        if (currentLayer == 'cables') {
            if (currentState == true) {
                map.addLayer(cablesLayer);
            }
            else if (currentState == false) {
                map.removeLayer(cablesLayer);
            }
        } else if (currentLayer == 'landingPoints') {

        } else if (currentLayer == 'bitnodes_data') {
            if (currentState == true) {
                map.addLayer(bitnodesLayer);
            }
            else if (currentState == false) {
                map.removeLayer(bitnodesLayer);
            }
        }
    }*/

})();
