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
var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.right})`)

var chosenXAxis = "age";
var chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
    }

function yScale(data, chosenXAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
            d3.max(data, d => d[chosenYAxis]) * 1.2
          ])
        .range([0, width]);
      
        return yLinearScale;
        }


    
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
      
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
      
    return xAxis;
    }

function renderAxes(newYScale, yAxis) {
    var bottomAxis = d3.axisBottom(newYScale);
          
    yAxis.transition()
        .duration(1000)
        .call(bottomAxis);
          
    return yAxis;
    }

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
      
    return circlesGroup;
}


function renderLabels(labels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    labels.transition()
        .duration(1000)
        .attr("lx", d => newXScale(d[chosenXAxis]))
        .attr("ly", d => newYScale(d[chosenYAxis]));
      
    return labels;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

    var label;
    
    switch (chosenXAxis) {
        
        case age: 
          label = "Age (Median)";
        case Poverty: 
          label = "In Poverty (%)";
        case income: 
          label = "Household Income (Median)";
        
    }
    
    switch (chosenYAxis) {
        case obesity: 
          label = "Obesity (%)";
        case smokes: 
          label = "Smoking (%)";
        case age: 
          label = "Lacks Healthcare (%)";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.abbr}<br>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
    });
  
    return circlesGroup;
  }
//step3: data binding
d3.csv("/data/data.csv").then(function(data){
    //step 4 format data
    data.forEach(function(data){
      data.age = parseFloat(data.age);
      data.poverty = parseFloat(data.poverty);
      data.income = parseFloat(data.income);
      data.obesity = parseFloat(data.obesity);
      data.smokes = parseFloat(data.smokes);
      data.healthcare = parseFloat(data.healthcare);
     });

    //step 4 : create the scale from the chart
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    //step -5 Create the axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //step 6 append x axis to the chartGroup
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.num_hits))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");


// Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 35)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
    
  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 55)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

    // Create group for y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", 0 - (margin.left/3))
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");    
      
    var obesityLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", -20 - (margin.left/3))
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");   

    var smokesLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", -40 - (margin.left/3))
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokers (%)");

    // Create group for y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var obesityLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", -20 - (margin.left/3))
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)"); 

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", 0 - (margin.left/3))
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");    
  
    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", -40 - (margin.left/3))
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokers (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);
    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
     // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        console.log(chosenXAxis)
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // update labels on circles
        cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        
    }
  });
    // y axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
     // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;
        console.log(chosenYAxis)
        // updates x scale for new data
        yLinearScale = xScale(data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // update labels on circles
        cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "smokes") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true)
          }
          else {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true)
          }
    }
});


//create a scatter plot between two of the data variables such as `Healthcare vs. Poverty` or `Smokers vs. Age`.


