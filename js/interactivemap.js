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
    // request tiles_lite
    var tiles_lite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    	attribution: '<a href="https://stamen.com">Stamen Design</a> - <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    	ext: 'png',
        opacity: 0.5
    });
    // set the bounds for the initial map view
    map.fitBounds([
        [90, -180],
        [-90, 180]
    ]);
    // set initial zoom for basemap
    map.setZoom(map.getZoom() - .2);
    // set minZoom for layerGroups
    map._layersMinZoom=3;

    // call drawMap function to draw layerGroups on map
    drawMap();

    function drawMap() {

        // establish layerGroups variables for map layer control
        var cablesGroup = L.layerGroup();
        var landingPointsGroup = L.layerGroup();
        var bitnodesGroup = L.layerGroup();
        var bitnodeDensityGroup = L.layerGroup();
        var landingPointsDensityGroup = L.layerGroup();

        // bring in cables data and add to layer group
        var cables = $.getJSON("data/cables.json", function(data) {
            var cablesLayer = L.geoJSON(data, {
                style: function(feature) { //style the layer
                    return {
                        color: '#163bd6',
                        weight: 3,
                        opacity: 0.5
                    };
                },
                onEachFeature: function(feature, layer) {
                    // when hovering over cable
                    layer.on('mouseover', function() {
                        layer.setStyle({
                            color: '#ff8a00'
                        }).bringToFront();
                    });

                    // when not hovering over cable
                    layer.on('mouseout', function() {
                        layer.setStyle({
                            color: '#163bd6'
                        });
                    });

                    // tooltip setup
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
            cablesGroup.addLayer(cablesLayer); // add layer with tooltip to layerGroup
        });

        // bring in landingPoints data and add to layer group
        var landingPoints = $.getJSON("data/landingPoints.json", function(data) {

            var geojsonMarkerOptions = {
                radius: 5,
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
                    // when hovering over landing point
                    layer.on('mouseover', function() {
                        layer.setStyle({
                            fillColor: 'black'
                        }).bringToFront();
                    });

                    // when not hovering over landing point
                    layer.on('mouseout', function() {
                        layer.setStyle({
                            fillColor: '#ff5959'
                        });
                    });

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

        // bring in bitnodes data and add to layer group
        var bitnodes = $.getJSON("data/bitnodes.json", function(data) {

            var geojsonMarkerOptions = {
                radius: 5,
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
                    // when hovering over bitnode
                    layer.on('mouseover', function() {
                        layer.setStyle({
                            fillColor: 'black'
                        }).bringToFront();
                    });

                    // when not hovering over bitnode
                    layer.on('mouseout', function() {
                        layer.setStyle({
                            fillColor: '#dad147'
                        });
                    });

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

        // bring in bitnodes data for heatmap
        var bitnodes_density = $.getJSON("data/bitnodes.json", function(data) {

            var locations = data.features.map(function(nodes) {
                var location = nodes.geometry.coordinates.reverse();
                location.push(0.5);
                return location;
            });

            var heat = L.heatLayer(locations, { // setup heatmap with options
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

        // bring in landingPoints data for heatmap
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

        // setup basemaps section of layer controls
        var baseMaps = {
            "Stamen": tiles,
            "Stamen Lite": tiles_lite
        };

        // setup overlaymaps section of layer controls
        var overlayMaps = {
            "Submarine Cables": cablesGroup,
            "Landing Points": landingPointsGroup,
            "Bitnodes": bitnodesGroup,
            "Bitnodes Density": bitnodeDensityGroup,
            "Landing Points Density": landingPointsDensityGroup
        };

        // add layer controls to map
        L.control.layers(baseMaps, overlayMaps).addTo(map);

        // add scale bar to map
        L.control.scale({
            maxWidth: 100
        }).addTo(map);
    }

})();
