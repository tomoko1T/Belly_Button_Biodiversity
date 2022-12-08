function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
///13-4-3- the code that creates a dropdown menu of ID numbers dynamically.

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init(); 

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample); 
}

/// Note: newSample refers to the value of the selected menu option. 
/// In index.html, onchange=optionChanged(this.value)passes the selected menu option's value to the optionChanged()function. 
/// This function gives this information the argument name newSample.  In other words,this.value (in HTML) and newSample are equivalent.

/// When a change takes place to the dropdown menu, two things will need to occur: buildMetadata() &  buildCharts()

// Demographics Panel /// declare the first functions: buildMetadata().
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
  });
}

// 1. Create the buildCharts function. ///The volunteer's data is visualized in a separate div.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    console.log(samples)
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var sampleArray = samples.filter(sampleObj => sampleObj.id == sample);
    console.log(sampleArray)
    //  5. Create a variable that holds the first sample in the array.
    var sampleresult = sampleArray[0];
    console.log(sampleresult)

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.   
    var otuids = sampleresult.otu_ids;
    var otulabels = sampleresult.otu_labels;
    var samplevalues = sampleresult.sample_values;
  
    /// To display the top 10 bacterial species (OTUs) when an individual’s ID is selected
    /// The horizontal bar chart will display the sample_values as the values, the otu_ids as the labels,
    /// and the otu_labels as the hover text for the bars on the chart.

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    var yticks = [{
      x: samplevalues.slice(0,10).reverse(),
      y: otuids.slice(0,10).map(otu_id => `OTU${otu_id}`).reverse(),
      text: otulabels.slice(0,10).reverse(),
      type: "bar",
      orientation: "h",
      marker: {
        color:'tomato',
      }
    }];
   
    /// .map(object => `OTU${object}`).reverse() --> converting discrate stiring
     
    // 8. Create the trace for the bar chart. 
    var barData = yticks;
        
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found"     
    };
    
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
  

  // Bar and Bubble charts
    // 1. Create the trace object for the bubble chart 
    var bubbleData = [{
       x: otuids,
       y: samplevalues,
       text: otulabels,
       mode: 'markers',
       marker: {
         size: samplevalues,
         color: otuids,
         colorscale: 'YlOrRd'          
       }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: {title: "OTU ID"},  
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);   

  //Create the trace for the gauge chart.
    ///1. create a variable that converts the washing frequency to a floating point number.  
    /// Need to pull metadata again here because this block is outside of function buildMetadata(sample) 
     var metadata = data.metadata;    
     var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
     var result = resultArray[0];
     console.log(result.wfreq)
     var washFreq = parseInt(result.wfreq);
     
     var gaugeData = [
          { 
            domain: { x:[0,1], y:[0,1]},
            value: washFreq,
           // For the title object, assign the title as a string using HTML syntax to the text property.
            title: { text: "Belly Button Washing Frequency Scrubs per Week"},
            type: "indicator",
            mode: "gauge+number",   
            gauge: {
              bar: {color: 'maroon'},
              bgcolor: "white",
              axis: { range: [null, 10] },
              steps: [
                { range: [0, 2], color: "salmon" },
                { range: [2, 4], color: "darksalmon" },
                { range: [4, 6], color: "lightsalmon" },
                { range: [6, 8], color: "lightcoral" },
                { range: [8, 10], color: "mistyrose" }
      ]}  
  }];
   //   https://plotly.com/javascript/gauge-charts/
   //   https://matplotlib.org/3.1.0/gallery/color/named_colors.html

  // 5. Create the layout for the gauge chart.
    var gaugeLayout = { width: 600, height: 500, margin: { t: 0, b: 0 }};
  // 6. Use Plotly to plot the gauge data and layout.
  Plotly.newPlot("gauge", gaugeData, gaugeLayout);

});
}