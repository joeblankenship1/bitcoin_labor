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

    map.fitBounds([
        [90, -180],
        [-90, 180]
    ]);

    map.setZoom(map.getZoom() - .2);

    //createCheckboxUI();
    drawMap();

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

    function drawMap() { // currentLayer, currentState

        //console.log([currentLayer, currentState]);

        var cables = $.getJSON("data/cables.json", function(data) {
            var cablesLayer = L.geoJSON(data, {
                style: function(feature) {
                    return {
                        color: '#163bd6',
                        weight: 1.5,
                        opacity: 1
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
            map.addLayer(cablesLayer);
        });

        var landingPoints = $.getJSON("data/landingPoints.json", function(data, currentLayer, currentState) {

            var geojsonMarkerOptions = {
                radius: 3,
                fillColor: "#ff5959",
                color: "#163bd6",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
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
            map.addLayer(landingPointsLayer);
        });

        var bitnodes = $.getJSON("data/bitnodes.json", function(data, currentLayer, currentState) {

            var geojsonMarkerOptions = {
                radius: 3,
                fillColor: "#dad147",
                color: "#ff5959",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
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
            map.addLayer(bitnodesLayer);
        });

        var bitnodes_density = $.getJSON("data/bitnodes.json", function(data) {

            var locations = data.features.map(function(nodes) {
                var location = nodes.geometry.coordinates.reverse();
                location.push(0.5);
                return location;
            });

            var heat = L.heatLayer(locations, {
                radius: 25,
                gradient: {
                    1: '#dad147'
                },
                blur: 0
            });
            //map.addLayer(heat);
        });

        var landingPoint_density = $.getJSON("data/landingPoints.json", function(data) {
            var locations = data.features.map(function(points) {
                var location = points.geometry.coordinates.reverse();
                location.push(0.5);
                return location;
            });

            var heat = L.heatLayer(locations, {
                radius: 25,
                gradient: {
                    1: '#ff5959'
                },
                blur: 0
            });
            //map.addLayer(heat);
        });

    }

    /*function updateMap() {

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
