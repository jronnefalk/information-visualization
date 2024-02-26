// Define default datasets and additional datasets
const defaultDatasets = [
  {
    name: "All episodes",
    url: "data/starwars-full-interactions-allCharacters.json",
  },
  {
    name: "Episode 1",
    url: "data/starwars-episode-1-interactions-allCharacters.json",
  },
  {
    name: "Episode 2",
    url: "data/starwars-episode-2-interactions-allCharacters.json",
  },
  {
    name: "Episode 3",
    url: "data/starwars-episode-3-interactions-allCharacters.json",
  },
  {
    name: "Episode 4",
    url: "data/starwars-episode-4-interactions-allCharacters.json",
  },
  {
    name: "Episode 5",
    url: "data/starwars-episode-5-interactions-allCharacters.json",
  },
  {
    name: "Episode 6",
    url: "data/starwars-episode-6-interactions-allCharacters.json",
  },
  {
    name: "Episode 7",
    url: "data/starwars-episode-7-interactions-allCharacters.json",
  },
];

// Global variable to track the selected node
let selectedNode = null;

// Function to create options for dataset dropdown
function createDatasetOptions(selectElement, datasets) {
  selectElement
    .selectAll("option")
    .data(datasets)
    .enter()
    .append("option")
    .text((d) => d.name)
    .attr("value", (d) => d.url);
}

// Load default datasets
// Initialize SVGs for zoom functionality directly
const svg1 = d3.select("#svg1"),
  g1 = svg1.append("g");

const svg2 = d3.select("#svg2"),
  g2 = svg2.append("g");

createDatasetOptions(d3.select("#datasetDropdown1"), defaultDatasets);
createDatasetOptions(d3.select("#datasetDropdown2"), defaultDatasets);

// Update the info panel for graph1
function updateInfoPanelGraph1(name, value) {
  document.getElementById("info-name1").textContent = name || "";
  document.getElementById("info-value1").textContent = value || "";
}

// Update the info panel for graph2
function updateInfoPanelGraph2(name, value) {
  document.getElementById("info-name2").textContent = name || "";
  document.getElementById("info-value2").textContent = value || "";
}

function updateLinkInfoPanelGraph1(source = "", target = "", value = "") {
  document.getElementById("link-source1").textContent = source || "";
  document.getElementById("link-target1").textContent = target || "";
  document.getElementById("link-value1").textContent = value || "";
}

function updateLinkInfoPanelGraph2(source = "", target = "", value = "") {
  document.getElementById("link-source2").textContent = source || "";
  document.getElementById("link-target2").textContent = target || "";
  document.getElementById("link-value2").textContent = value || "";
}

function highlightLinkInBothDiagrams(sourceName, targetName, highlight = true) {
  [svg1, svg2].forEach((svg) => {
    svg
      .selectAll(".links line")
      .filter(
        (d) => d.source.name === sourceName && d.target.name === targetName
      )
      .each(function (d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("stroke", highlight ? "#000" : "#999") // Toggle color
          .attr("stroke-width", highlight ? 3 : Math.sqrt(d.value)); // Toggle width based on 'd.value'
      });
  });
}

// Adjust highlightNode function to manage stroke color and width correctly
function highlightNode(svg, nodeName, selected) {
  svg.selectAll(".nodes circle").each(function (d) {
    if (selected && d.name === nodeName) {
      d3.select(this)
        .style("stroke", "black") // Apply black border for selected node
        .style("stroke-width", "2px"); // Border width
    } else {
      d3.select(this)
        .style("stroke", null) // Remove border for non-selected nodes
        .style("stroke-width", null);
    }
  });
}

// Function to resize nodes on hover and keep selected node highlighted
function resizeNodeInBothDiagrams(nodeName, newSizeFactor) {
  [svg1, svg2].forEach((svg) => {
    svg
      .selectAll(".nodes circle")
      .filter((d) => d.name === nodeName)
      .transition()
      .duration(150)
      .attr("r", (d) => Math.sqrt(d.value) * newSizeFactor);
  });
}

// Define zoom behaviors for each graph
const zoom1 = d3
  .zoom()
  .scaleExtent([0.5, 10]) // Set the scale extent for zooming
  .on("zoom", function (event) {
    g1.attr("transform", event.transform); // Apply zoom & pan
  });

const zoom2 = d3
  .zoom()
  .scaleExtent([0.5, 10])
  .on("zoom", function (event) {
    g2.attr("transform", event.transform);
  });

// Apply the zoom behavior to the SVG elements
svg1.call(zoom1);
svg2.call(zoom2);

// Click outside to clear selections and info panels
d3.select("body").on(
  "click",
  function () {
    updateInfoPanelGraph1("", "", ""); // Clear info panel 1
    updateInfoPanelGraph2("", "", ""); // Clear info panel 2
    highlightNode(svg1, null, false);
    highlightNode(svg2, null, false);
    selectedNode = null; // Clear selected node variable
  },
  true
);

// Initialize the info panels right after creating the SVG elements
var simulation1;
var simulation2;

// Function to create node-link diagram with hover and drag functionalities
function createNodeLinkDiagram(svg, g, datasetUrl, threshold, chargeStrength) {
  var nodes;
  var links;
  d3.json(datasetUrl).then(function (data) {
    // Extract nodes and links from the data
    nodes = data.nodes;
    links = data.links;

    if (svg === svg1) {
      simulation1 = d3
        .forceSimulation(nodes)
        .force("link", d3.forceLink().links(links).distance(5))
        .force("charge", d3.forceManyBody().strength(-100))
        .force(
          "center",
          d3.forceCenter(+svg.attr("width") / 2, +svg.attr("height") / 2)
        );
    } else {
      simulation2 = d3
        .forceSimulation(nodes)
        .force("link", d3.forceLink().links(links).distance(5))
        .force("charge", d3.forceManyBody().strength(-100))
        .force(
          "center",
          d3.forceCenter(+svg.attr("width") / 2, +svg.attr("height") / 2)
        );
    }

    // Drag event handlers
    function dragstarted(event, d) {
      if (!event.active) {
        if (svg === svg1) {
          simulation1.alphaTarget(0.3).restart();
        } else if (svg === svg2) {
          simulation2.alphaTarget(0.3).restart();
        }
      }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) {
        if (svg === svg1) {
          simulation1.alphaTarget(0);
        } else if (svg === svg2) {
          simulation2.alphaTarget(0);
        }
      }
      d.fx = null;
      d.fy = null;
    }

    // Create the links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.value))
      .on("mouseover", function (event, d) {
        highlightLinkInBothDiagrams(d.source.name, d.target.name, true);

        // Update the info panel for the current graph.
        const updateCurrentInfoPanel =
          svg === svg1 ? updateLinkInfoPanelGraph1 : updateLinkInfoPanelGraph2;
        updateCurrentInfoPanel(d.source.name, d.target.name, d.value);

        // Determine the other SVG and corresponding update function.
        const otherSvg = svg === svg1 ? svg2 : svg1;
        const updateOtherInfoPanel =
          svg === svg1 ? updateLinkInfoPanelGraph2 : updateLinkInfoPanelGraph1;

        // Check if the link exists in the other graph.
        const linkExistsInOtherGraph = otherSvg
          .selectAll(".links line")
          .data()
          .some(
            (link) =>
              link.source.name === d.source.name &&
              link.target.name === d.target.name
          );

        if (linkExistsInOtherGraph) {
          // If the link exists in both graphs, update the other graph's info panel with the link details.
          updateOtherInfoPanel(d.source.name, d.target.name, d.value);
        } else {
          // If the link does not exist in the other graph, show "Link does not exist here".
          updateOtherInfoPanel("Link does not exist here", "", "");
        }
      })
      .on("mouseout", function (event, d) {
        highlightLinkInBothDiagrams(d.source.name, d.target.name, false);
        updateLinkInfoPanelGraph1();
        updateLinkInfoPanelGraph2();
      });

    // Create the nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => Math.sqrt(d.value) * 2)
      .attr("fill", (d) => d.colour)
      .style("stroke-width", "0px") // Initialize without border
      .call(
        d3
          .drag() // Enable drag functionality
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("mouseover", function (event, d) {
        // Enlarge nodes in both graphs, but do not change selection or info panel
        resizeNodeInBothDiagrams(d.name, 3); // Enlarge node
      })
      .on("mouseout", function (event, d) {
        resizeNodeInBothDiagrams(d.name, 2); // Shrink node
      });
    updateThreshold(svg, threshold);
    updateChargeStrength(
      svg === svg1 ? simulation1 : simulation2,
      chargeStrength
    );
    // Inside createNodeLinkDiagram function for each svg
    node.on("click", function (event, d) {
      event.stopPropagation(); // Prevent body click event
      selectedNode = d; // Update the selected node globally

      // Update info panels based on the selected node
      const currentGraphIsSvg1 = this.parentNode.parentNode === svg1.node();
      if (currentGraphIsSvg1) {
        updateInfoPanelGraph1(d.name, d.value); // Update for svg1 without color
        const nodeExistsInSvg2 = svg2
          .selectAll(".nodes circle")
          .data()
          .find((node) => node.name === d.name);
        if (nodeExistsInSvg2) {
          highlightNode(svg2, d.name, true); // Highlight in svg2 if exists
          updateInfoPanelGraph2(d.name, d.value); // Also update info panel for svg2 without color
        } else {
          updateInfoPanelGraph2("Node does not exist here", ""); // Update info panel indicating non-existence without color
        }
      } else {
        updateInfoPanelGraph2(d.name, d.value); // Update for svg2 without color
        const nodeExistsInSvg1 = svg1
          .selectAll(".nodes circle")
          .data()
          .find((node) => node.name === d.name);
        if (nodeExistsInSvg1) {
          highlightNode(svg1, d.name, true); // Highlight in svg1 if exists
          updateInfoPanelGraph1(d.name, d.value); // Also update info panel for svg1 without color
        } else {
          updateInfoPanelGraph1("Node does not exist here", ""); // Update info panel indicating non-existence without color
        }
      }

      // Always highlight the node in the current graph
      highlightNode(
        this.parentNode.parentNode === svg1.node() ? svg1 : svg2,
        d.name,
        true
      );
    });

    // Force simulation tick update
    if (svg === svg1) {
      simulation1.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      });
    } else if (svg === svg2) {
      simulation2.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      });
    }
  });
}

d3.select("#strengthSlider1").on("input", function () {
  const chargeStrength = +this.value;
  strengthValue1.innerText = chargeStrength;

  updateChargeStrength(simulation1, chargeStrength);
});

d3.select("#strengthSlider2").on("input", function () {
  const chargeStrength = +this.value;
  strengthValue2.innerText = chargeStrength;

  updateChargeStrength(simulation2, chargeStrength);
});
function updateChargeStrength(simulation, chargeStrength) {
  simulation.force("link").distance(chargeStrength);
  simulation.alpha(0.3).restart();
}

// Function to update node-link diagram based on selected dataset and threshold
function updateNodeLinkDiagram(
  svg,
  g,
  datasetDropdown,
  threshold,
  chargeStrength
) {
  const selectedDataset = datasetDropdown.property("value");
  g.selectAll("*").remove(); // Clear existing diagram elements from 'g'

  createNodeLinkDiagram(svg, g, selectedDataset, threshold, chargeStrength);
}

// Initial creation of node-link diagrams with default datasets and thresholds
updateNodeLinkDiagram(svg1, g1, d3.select("#datasetDropdown1"), 0, 0);
updateNodeLinkDiagram(svg2, g2, d3.select("#datasetDropdown2"), 0, 0);

// Event listener for dataset dropdowns
d3.select("#datasetDropdown1").on("change", function () {
  updateNodeLinkDiagram(
    svg1,
    g1,
    d3.select("#datasetDropdown1"),
    d3.select("#nodeSizeSlider1").property("value"),
    d3.select("#strengthSlider1").property("value")
  );
});

d3.select("#datasetDropdown2").on("change", function () {
  updateNodeLinkDiagram(
    svg2,
    g2,
    d3.select("#datasetDropdown2"),
    d3.select("#nodeSizeSlider2").property("value"),
    d3.select("#strengthSlider2").property("value")
  );
});

// Function to update node-link diagram based on threshold slider value
function updateThreshold(svg, threshold) {
  const nodes = svg.selectAll(".nodes circle");
  const links = svg.selectAll(".links line");
  const labels = svg.selectAll(".labels text");

  // Filter nodes based on threshold
  nodes.attr("display", function (d) {
    return d.value > threshold ? "block" : "none";
  });

  // Filter labels based on threshold
  labels.attr("display", function (d) {
    return d.value > threshold ? "block" : "none";
  });

  // Filter links based on threshold
  links.attr("display", function (d) {
    return d.source.value > threshold && d.target.value > threshold
      ? "block"
      : "none";
  });
}

// Event listener for threshold sliders
d3.select("#nodeSizeSlider1").on("input", function () {
  const filterValue = +this.value;
  nodeSizeValue1.innerText = filterValue;
  updateThreshold(svg1, filterValue);
});

d3.select("#nodeSizeSlider2").on("input", function () {
  const filterValue = +this.value;
  nodeSizeValue2.innerText = filterValue;
  updateThreshold(svg2, filterValue);
});

// Connect zoom sliders to zoom behaviors
d3.select("#zoomSlider1").on("input", function () {
  const zoomLevel = parseFloat(d3.select(this).property("value"));
  svg1.transition().duration(500).call(zoom1.scaleTo, zoomLevel);
});

d3.select("#zoomSlider2").on("input", function () {
  const zoomLevel = parseFloat(d3.select(this).property("value"));
  svg2.transition().duration(500).call(zoom2.scaleTo, zoomLevel);
});
