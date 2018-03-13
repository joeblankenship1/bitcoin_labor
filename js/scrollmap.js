(function() {

    // request the JSON country and bitnode files
    var countryJson = d3.json("data/countries.json")

    //use promise to call files, then call drawMap function
    Promise.all([countryJson]).then(drawMap, error);

    // function fired if there is an error
    function error(error) {
        console.log(error)
    }

    // accepts the data as a parameter countrysData
    function drawMap(data, width, height) {

        // data is array of our two datasets
        var countryData = data[0]

        // define width and height of our SVG
        var width = 960,
            height = 600

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
    }

    // using d3 for convenience
    var container = d3.select('#scroll');
    var graphic = container.select('.scroll__graphic');
    var scrollmap = graphic.select('.scrollmap');
    var text = container.select('.scroll__text');
    var step = text.selectAll('.step');
    // initialize the scrollama
    var scroller = scrollama();
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
    function handleStepEnter(response) {
        // response = { element, direction, index }
        // add color to current step only
        step.classed('is-active', function (d, i) {
            return i === response.index;
        })
        // update graphic based on step
        scrollmap.select('p').text(response.index + 1)
    }
    function handleContainerEnter(response) {
        // response = { direction }
        // sticky the graphic (old school)
        graphic.classed('is-fixed', true);
        graphic.classed('is-bottom', false);
    }
    function handleContainerExit(response) {
        // response = { direction }
        // un-sticky the graphic, and pin to top/bottom of container
        graphic.classed('is-fixed', false);
        graphic.classed('is-bottom', response.direction === 'down');
    }
    function init() {
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
        })
            .onStepEnter(handleStepEnter)
            .onContainerEnter(handleContainerEnter)
            .onContainerExit(handleContainerExit);
        // setup resize event
        window.addEventListener('resize', handleResize);
    }
    // kick things off
    init();
})();
