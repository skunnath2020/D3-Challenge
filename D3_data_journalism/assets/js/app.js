//setup SVG area
//=======================
var svgWidth = 960;
var svgHeight = 500;
var margin = {
    top : 20,
    right: 40 , 
    bottom:60,
    left: 50

};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// step 2: setup SVG wrapper
var svg = d3.select("body")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
var charGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}), ${margin.right})`)

//step3: data binding
d3.csv("/data/data.csv").then(function(data){
    data.forEach(function(data){
        var state=data.abbr;
        var poverty=data.povertyMoe;
        
    })

    //step 4 : create the scale from the chart
    var xLinearScale = d3.scalelinear()
            .domain(d3.extend(data, d => d.abbr)) 
            .range([0, width]);
    var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.povertyMoe)])
            .range([height, 0]);
})

    //step -5 Create the axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    //step 6 append the axes to the chartGroup
    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    chartGroup.append("g").call(leftAxis);

//create a scatter plot between two of the data variables such as `Healthcare vs. Poverty` or `Smokers vs. Age`.


