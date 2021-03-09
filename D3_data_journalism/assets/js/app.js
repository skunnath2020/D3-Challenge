//setup SVG area
//=======================
var svgWidth = 960;
var svgHeight = 600;
var margin = {
    top : 20,
    right: 40 , 
    bottom:120,
    left: 120

};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// step 2: setup SVG wrapper
var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

//append the SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.right})`)

var chosenXAxis = "age";
var chosenYAxis = "obesity"

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis, cWidth) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, cWidth]);
  
    return xLinearScale;
    }

function yScale(data, chosenYAxis, cHeight) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
            d3.max(data, d => d[chosenYAxis]) * 1.2
          ])
        .range([cHeight, 0]);
    return yLinearScale;
    }


 //Update x-axis upon click on axis label   
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
    }
//Update y-axis upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()  
        .duration(1000)
        .call(leftAxis);
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
//************************************************************* 
// function used for updating circles group with new tooltip
//************************************************************ 
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, labelGroup) {

    var xlabel, ylabel;
    //y-axis conditions
    if (chosenXAxis === "age") {
        xlabel = "Age (Median)";
    }
    else if (chosenXAxis === "poverty") {
        xlabel = "In Poverty (%)";
    }
    else  {
        xlabel = "Household Income (Median)";
        
    };
    //y-axis conditions
    if (chosenYAxis === "obesity") {
        ylabel = "Obesity (%)";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smoking (%)";
    }
    else  {
        ylabel = "Lacks Healthcare (%)";
        
    };
      
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([120, -60])
      .html(function(d) {
        if (chosenXAxis === "age") {
            // All yAxis tooltip labels presented and formated as %.
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
            }      
    });
  
    circlesGroup.call(toolTip);
        //onmouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
            .on("mouseout", function(data) {
            toolTip.hide(data);
    });
    labelGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
  }
 //***************************************************
 //step3: data binding
 //**************************************************
 d3.csv("/data/data.csv").then(function(data, err){
    if (err) throw err;
    //step 4 format data
    data.forEach(function(data){
      data.age = +data.age;
      data.poverty = +(data.poverty);
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
     });

    //step 4 : create the scale from the chart
    var xLinearScale = xScale(data, chosenXAxis, width);
    var yLinearScale = yScale(data, chosenYAxis, height);

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
     // Set data
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter();
    // append initial circles
    var circle = circlesGroup
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "blue")
        .attr("opacity", ".5")
        .classed("stateInfo", true);
     // Create circle text.
     var cText = circlesGroup
        .append("text")            
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", ".32em") 
        .text(d => d.abbr)
        .classed("stateText", true);

// Create group for two x-axis labels
    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`);

    var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 3)
    .attr("font-size", "16px")
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age (Median):");

    var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 23)
    .attr("font-size", "16px")
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("In Poverty(%):");
    
  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("font-size", "16px")
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median):");

    // Create group for y-axis labels
   
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

        var obesityLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", -2 - (margin.left/3))
        .attr("font-size", "16px")
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%):"); 
        
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", -18 - (margin.left/3))
        .attr("font-size", "16px")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare:"); 
     
    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", -33 - (margin.left/3))
        .attr("font-size", "16px")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokers(%):");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, cText);
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
     // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            // replaces chosenXAxis with value
            chosenXAxis = value;
            console.log("x axis: ", chosenXAxis)
            // updates x scale for new data
            xLinearScale = xScale(data, chosenXAxis, width);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
        // updates circles with new x values
        circle = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // update labels on circles
        cLabels = renderLabels(cText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, cLabels);
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
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            ageLabel
               .classed("active", false)
               .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        
    }
  });
    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
     // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;
        console.log("Here :" , chosenYAxis)
        // updates x scale for new data
        yLinearScale = xScale(data, chosenYAxis, height);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        
        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            obesityLabel
                .classed("active", false)
                .classed("inactive", true);
          }
          else if (chosenXAxis === "smokes") {
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", true)
                .classed("inactive", false);
            obesityLabel
                .classed("active", false)
                .classed("inactive", true);
          }
          else {
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            obesityLabel
                .classed("active", true)
                .classed("inactive", false);
          }
        // updates circles with new x values
        circle = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // update labels on circles
        cLabels = renderLabels(cText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, cLabels);
    }
  });
}).catch(function(err){
    console.log(err);
});



