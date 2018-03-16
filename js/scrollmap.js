(function() {

    // request the JSON country and bitnode files
    var countryJson = d3.json("data/countries.json"),
        bitnodesJson = d3.json("data/bitnodes.json"),
        cablesJson = d3.json("data/cables.json"),
        landingPointsJson = d3.json("data/landingPoints.json")

    //use promise to call files, then call drawMap function
    Promise.all([countryJson, bitnodesJson, cablesJson, landingPointsJson]).then(init, error);

    // function fired if there is an error
    function error(error) {
        console.log(error)
    }

    // using d3 for convenience
    var container = d3.select('#scroll');
    var graphic = container.select('.scroll__graphic');
    var scrollmap = graphic.select('.scrollmap');
    var text = container.select('.scroll__text');
    var step = text.selectAll('.step');
    // initialize the scrollama
    var scroller = scrollama();

    function init(data) {
        // 1. force a resize on load to ensure proper dimensions are sent to scrollama
        handleResize();
        // 2. setup the scroller passing options
        // this will also initialize trigger observations
        // 3. bind scrollama event handlers (this can be chained like below)
        scroller.setup({
            container: '#scroll',
            graphic: '.scroll__graphic',
            text: '.scroll__text',
            step: '.scroll__text .step',
            offset: 0.85, // set the trigger to be 85% down screen
			//debug: true, // display the trigger offset for testing
        })
            .onStepEnter(handleStepEnter)
            .onContainerEnter(handleContainerEnter)
            .onContainerExit(handleContainerExit);
        // setup resize event
        window.addEventListener('resize', handleResize);

        drawMap(data);
    }

    // accepts the data as a parameter countrysData
    function drawMap(data) {

        // data is array of our two datasets
        var countryData = data[0]

        // define width and height of our SVG
        var width = scrollmap.node().offsetWidth
        var height = scrollmap.node().offsetHeight

        // select the map element
        var svg = d3.select(".scrollmap")
            .append("svg") // append a new SVG element
            .attr("width", width) // give the SVS element a width attribute and value
            .attr("height", height) // same for the height

        // get the GeoJSON representation of the TopoJSON data
        var geojson = topojson.feature(countryData, {
            type: "GeometryCollection",
            geometries: countryData.objects.ne_110m_admin_0_countries.geometries
        })

        // define a projection using the US Albers USA
        // fit the extent of the GeoJSON data to specified width and height
        var projection = d3.geoNaturalEarth1()
            .fitSize([width, height], geojson)

        // define a path generator, which will use the specified projection
        var path = d3.geoPath()
            .projection(projection)

        // create and append a new SVG g element to the SVG
        var countries = svg.append("g")
            .selectAll("path") // select all the paths (that don't exist yet)
            .data(geojson.features) // use the GeoJSON data
            .enter() // enter the selection
            .append("path") // append new path elements for each data feature
            .attr("d", path) // give each path a d attribute value
            .attr("class", "scrollmap") // give each path a class of country

        //
        addBitnodes(data, svg, geojson, projection, path, width, height);
        //
        addLandingPoints(data, svg, geojson, projection, path, width, height);
        //
        addCables(data, svg, projection, path, width, height);

    }

    function addBitnodes(data, svg, geojson, projection, path, width, height) {

        bitnodesData = data[1];

        var bitnodes = svg.append("g")
            .selectAll("circle")
            .data(bitnodesData.features)
            .enter() // enter the selection
            .append("circle")
            .attr("cx", function(d) { // define the x position
                d.position = projection([d.properties.LON, d.properties.LAT]);
                return d.position[0];
            })
            .attr("cy", function(d) {
                return d.position[1];
            })
            .attr("r", 3)
            .attr("class", "bitnode")
    }

    function addLandingPoints(data, svg, geojson, projection, path, width, height) {

        landingPointsData = data[3];

        var landingPoints = svg.append("g")
            .selectAll("circle")
            .data(landingPointsData.features)
            .enter() // enter the selection
            .append("circle")
            .attr("cx", function(d) { // define the x position
                d.position = projection([d.properties.LON, d.properties.LAT]);
                return d.position[0];
            })
            .attr("cy", function(d) {
                return d.position[1];
            })
            .attr("r", 3)
            .attr("class", "landing_point")
    }

    function addCables(data, svg, projection, path, width, height) {

        cablesData = data[2];

        var cables = svg.append("g")
            .selectAll("path")
            .data(cablesData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "cables")
    }

    function updateMap(num) {

        const t = d3.transition()
                    .duration(400)
                    .ease(d3.easeLinear);

        const bitnodes = d3.selectAll(".bitnode");
        const landingPoints = d3.selectAll(".landing_point");
        const cables = d3.selectAll(".cables");

        const switchLayer = {
            zero: () => {
                bitnodes.transition(t).style("opacity", 0)
                landingPoints.transition(t).style("opacity", 0)
                cables.transition(t).style("opacity", 0)
            },
            one: () => {
                bitnodes.transition(t).style("opacity", 1)
                landingPoints.transition(t).style("opacity", 0)
                cables.transition(t).style("opacity", 0)
            },
            two: () => {
                bitnodes.transition(t).style("opacity", 1)
                landingPoints.transition(t).style("opacity", 1)
                cables.transition(t).style("opacity", 0)
            },
            three: () => {
                bitnodes.transition(t).style("opacity", 0)
                landingPoints.transition(t).style("opacity", 1)
                cables.transition(t).style("opacity", 1)
            }
        }

        switch (num) {
            case 0: switchLayer.zero()
            break
            case 1: switchLayer.one()
            break
            case 2: switchLayer.two()
            break
            case 3: switchLayer.three()
            break
        }

    }

    // generic window resize listener event
    function handleResize() {
        // 1. update height of step elements
        var stepHeight = Math.floor(window.innerHeight * 0.75);
        step.style('height', stepHeight + 'px');

        // 2. update width/height of graphic element
        var bodyWidth = d3.select('body').node().offsetWidth;
        graphic
            .style('width', bodyWidth + 'px')
            .style('height', window.innerHeight + 'px');
        var scrollmapMargin = 32;
        var textWidth = text.node().offsetWidth;
        var scrollmapWidth = graphic.node().offsetWidth - textWidth - scrollmapMargin;
        scrollmap
            .style('width', scrollmapWidth + 'px')
            .style('height', Math.floor(window.innerHeight) + 'px');

        // 3. tell scrollama to update new element dimensions
        scroller.resize();
    }

    // scrollama event handlers
    function handleStepEnter(response, data) {
        // response = { element, direction, index }

        // add color to current step only
        step.classed('is-active', function (d, i) {
            return i === response.index;
        })

        updateMap(response.index)
    }

    function handleContainerEnter(response) {
        // response = { direction }
        // sticky the graphic (old school)
        graphic.classed('is-fixed', true);
        graphic.classed('is-bottom', false);
    }

    function handleContainerExit(response) {        // response = { direction }
        // un-sticky the graphic, and pin to top/bottom of container
        graphic.classed('is-fixed', false);
        graphic.classed('is-bottom', response.direction === 'down');
    }

})();
