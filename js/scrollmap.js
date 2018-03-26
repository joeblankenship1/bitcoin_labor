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
                offset: 0.95, // set the trigger to be 95% down screen
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

        // add bitnodes data to SVG countries
        addBitnodes(data, svg, geojson, projection, path, width, height);
        // add landing points to SVG countries
        addLandingPoints(data, svg, geojson, projection, path, width, height);
        // add submarine cables to SVG countries
        addCables(data, svg, projection, path, width, height);

    }

    // loads bitnodes to SVG element
    function addBitnodes(data, svg, geojson, projection, path, width, height) {

        // define bitnodes data from Promise index
        bitnodesData = data[1];

        // add bitnodes to SVG element
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
            .attr("r", 2) // define size of circle
            .attr("class", "bitnode") // css styling
    }

    // loads landing points to SVG element
    function addLandingPoints(data, svg, geojson, projection, path, width, height) {

        // define bitnodes data from Promise index
        landingPointsData = data[3];

        // add landing points to SVG element
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
            .attr("r", 2) // define size of circle
            .attr("class", "landing_point") // css styling
    }

    // loads submarine cables to SVG element
    function addCables(data, svg, projection, path, width, height) {

        // define cables data from Promise index
        cablesData = data[2];

        // add cables to SVG element
        var cables = svg.append("g")
            .selectAll("path")
            .data(cablesData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "cables") // css styling
    }

    // Setup the scrollmap states for each layer per scrollama step
    function updateMap(num) {

        // set linear fade in/out for each layer
        const t = d3.transition()
            .duration(400)
            .ease(d3.easeLinear);

        // define which css styling you need to modify - will render per step
        const bitnodes = d3.selectAll(".bitnode");
        const landingPoints = d3.selectAll(".landing_point");
        const cables = d3.selectAll(".cables");

        // define action for each styling per scrollama step
        const switchLayer = {
            zero: () => {
                bitnodes.transition(t).style("opacity", 0)
                landingPoints.transition(t).style("opacity", 0)
                cables.transition(t).style("opacity", 0)
            },
            one: () => {
                bitnodes.transition(t).style("opacity", 0.3)
                landingPoints.transition(t).style("opacity", 0)
                cables.transition(t).style("opacity", 0)
            },
            two: () => {
                bitnodes.transition(t).style("opacity", 0.3)
                landingPoints.transition(t).style("opacity", 0.3)
                cables.transition(t).style("opacity", 0)
            },
            three: () => {
                bitnodes.transition(t).style("opacity", 0)
                landingPoints.transition(t).style("opacity", 0.3)
                cables.transition(t).style("opacity", 0.3)
            }
        }

        // use switchLayer actions above to tell scrollama
        // how each step should render the layers
        switch (num) {
            case 0:
                switchLayer.zero()
                break
            case 1:
                switchLayer.one()
                break
            case 2:
                switchLayer.two()
                break
            case 3:
                switchLayer.three()
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
        step.classed('is-active', function(d, i) {
            return i === response.index;
        })

        // call to updateMap to render layers per step
        updateMap(response.index)
    }

    // css handling of step elements upon enter
    function handleContainerEnter(response) {
        // response = { direction }
        // sticky the graphic (old school)
        graphic.classed('is-fixed', true);
        graphic.classed('is-bottom', false);
    }

    // css handling of step elements upon exit
    function handleContainerExit(response) {
        // response = { direction }
        // un-sticky the graphic, and pin to top/bottom of container
        graphic.classed('is-fixed', false);
        graphic.classed('is-bottom', response.direction === 'down');
    }

})();
