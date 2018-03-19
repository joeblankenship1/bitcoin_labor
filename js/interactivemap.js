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

    drawMap();

    function drawMap() {

        var cables = $.getJSON("data/cables.json", function(data) {
            L.geoJSON(data, {
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
            })//.addTo(map);
        });

        var landingPoints = $.getJSON("data/landingPoints.json", function(data) {
            var geojsonMarkerOptions = {
                radius: 3,
                fillColor: "#ff5959",
                color: "#163bd6",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            };

            var dataLayer = L.geoJSON(data, {
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
            })//.addTo(map);
        });

        var bitnodes_data = $.getJSON("data/bitnodes.json", function(data) {
            var geojsonMarkerOptions = {
                radius: 3,
                fillColor: "#dad147",
                color: "#ff5959",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            };

            var dataLayer = L.geoJSON(data, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions)
                },
                onEachFeature: function(feature, layer) {

                    var props = layer.feature.properties;

                    var tooltipInfo = "<b>ASN: </b>" + props["ASN"] +
    								"<br><b>City: </b>" + props["City"] +
    								"<br><b>Country: </b>" + props["Country_code"] +
                                    "<br><b>Connected Since: </b>" + props["Connected_since"];

                    layer.bindTooltip('', {
                        sticky: true,
                        tooltipAnchor: [200, 200]
                    })
                    .setTooltipContent(tooltipInfo);
                }
            })//.addTo(map);
        });

        /*
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
            map.addLayer(heat);
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
            map.addLayer(heat);
        });
        */

        map.fitBounds([
            [90, -180],
            [-90, 180]
        ]);

        map.setZoom(map.getZoom() - .2);

        createCheckboxUI();

    }

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
            // update the map year
            //updateMap(currentLayer)
        });

    }

    function updateMap(currentLayer) {

        if (currentLayer == cables) {

        } else if (currentLayer == landingPoints) {

        } else if (currentLayer == bitnodes_data) {

        } else if (currentLayer == bitnodes_density) {

        } else if (currentLayer == landingPoint_density) {

        }
    }

})();
