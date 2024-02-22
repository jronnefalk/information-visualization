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
const svg1 = d3.select("#svg1");
const svg2 = d3.select("#svg2");
createDatasetOptions(d3.select("#datasetDropdown1"), defaultDatasets);
createDatasetOptions(d3.select("#datasetDropdown2"), defaultDatasets);

// Update the info panel for graph1
function updateInfoPanelGraph1(name = "", value = "", color = "") {
  document.getElementById("info-name1").textContent =
    name || "Node does not exist here";
  document.getElementById("info-value1").textContent = value || "";
  document.getElementById("info-color1").style.backgroundColor =
    color || "transparent";
  document.getElementById("info-color1").textContent = color ? "" : "N/A";
}

// Update the info panel for graph2
function updateInfoPanelGraph2(name = "", value = "", color = "") {
  document.getElementById("info-name2").textContent =
    name || "Node does not exist here";
  document.getElementById("info-value2").textContent = value || "";
  document.getElementById("info-color2").style.backgroundColor =
    color || "transparent";
  document.getElementById("info-color2").textContent = color ? "" : "N/A";
}

// // Update the shared information panel (nodes)
// function updateSharedInfoPanel(name = "", value = "", color = "") {
//   document.getElementById("info-name").textContent = name;
//   document.getElementById("info-value").textContent = value;
//   document.getElementById("info-color").style.backgroundColor = color;
//   document.getElementById("info-color").textContent = color ? "" : "";
// }

// // Update the shared information panel (links)
// function updateLinkInfoPanel(source = "", target = "", value = "") {
//   document.getElementById("link-source").textContent = source || "";
//   document.getElementById("link-target").textContent = target || "";
//   document.getElementById("link-value").textContent = value || "";
// }

function updateLinkInfoPanelGraph1(source = "", target = "", value = "") {
  document.getElementById("link-source1").textContent =
    source || "Link does not exist here";
  document.getElementById("link-target1").textContent = target || "";
  document.getElementById("link-value1").textContent = value || "";
}

function updateLinkInfoPanelGraph2(source = "", target = "", value = "") {
  document.getElementById("link-source2").textContent =
    source || "Link does not exist here";
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

// // Function to highlight the clicked node in both diagrams
// function highlightNode(svg, nodeName, selected) {
//   svg
//     .selectAll(".nodes circle")
//     .style("stroke", (d) =>
//       selected && d.name === nodeName ? "black" : "none"
//     )
//     .style("stroke-width", (d) =>
//       selected && d.name === nodeName ? "2px" : "0px"
//     );
// }

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

// Click outside to clear selections and info panels
d3.select("body").on(
  "click",
  function () {
    updateInfoPanelGraph1(); // Clear info panel 1
    updateInfoPanelGraph2(); // Clear info panel 2
    highlightNode(svg1, null, false);
    highlightNode(svg2, null, false);
    selectedNode = null; // Clear selected node variable
  },
  true
);

function createInfoPanel(svg) {
  // Create a group for the info panel
  const infoPanel = svg
    .append("g")
    .attr("class", "info-panel")
    .attr("transform", "translate(10,20)"); // Position it in the top left corner

  // Add text elements for Name, Value, and Color
  infoPanel.append("text").attr("id", "info-name").attr("y", 0).text("Name:");
  infoPanel
    .append("text")
    .attr("id", "info-value")
    .attr("y", 20)
    .text("Value:");
  infoPanel
    .append("text")
    .attr("id", "info-color")
    .attr("y", 40)
    .text("Color:");
}

// Initialize the info panels right after creating the SVG elements
createInfoPanel(svg1);
createInfoPanel(svg2);

// Function to create node-link diagram with hover and drag functionalities
function createNodeLinkDiagram(svg, datasetUrl, threshold) {
  d3.json(datasetUrl).then(function (data) {
    // Extract nodes and links from the data
    const nodes = data.nodes.filter((d) => d.value > threshold);
    const links = data.links;

    // Initialize the simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.index)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force(
        "center",
        d3.forceCenter(svg.attr("width") / 2, svg.attr("height") / 2)
      );

    // Create the links
    const link = svg
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
        // Highlight this link in graph1 and update its info panel
        updateLinkInfoPanelGraph1(d.source.name, d.target.name, d.value);

        // Check if the link exists in graph2 and update/higlight accordingly
        const linkExistsInSvg2 = svg2
          .selectAll(".links line")
          .data()
          .some(
            (link) =>
              link.source.name === d.source.name &&
              link.target.name === d.target.name
          );
        if (linkExistsInSvg2) {
          highlightLinkInBothDiagrams(d.source.name, d.target.name, true); // Assuming you have this function implemented
          updateLinkInfoPanelGraph2(d.source.name, d.target.name, d.value);
        } else {
          updateLinkInfoPanelGraph2("This link does not exist here", "", "");
        }
      })
      .on("mouseout", function (event, d) {
        highlightLinkInBothDiagrams(d.source.name, d.target.name, false);
        updateLinkInfoPanelGraph1();
        updateLinkInfoPanelGraph2();
      });

    // Create the nodes
    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => Math.sqrt(d.value) * 2)
      .attr("fill", (d) => d.colour) // Ensure this uses your nodes' color attribute correctly
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
      })
      .on("click", function (event, d) {
        event.stopPropagation(); // Prevent the body click event
        // Toggle selection state
        if (selectedNode === d) {
          selectedNode = null; // Deselect node
          updateSharedInfoPanel(); // Clear info panel
          highlightNode(svg1, null, false);
          highlightNode(svg2, null, false);
        } else {
          selectedNode = d; // Update selected node
          updateSharedInfoPanel(d.name, d.value, d.colour); // Update info panel
          highlightNode(svg1, d.name, true); // Apply border
          highlightNode(svg2, d.name, true); // Apply border
        }
      });

    // Inside createNodeLinkDiagram function for each svg
    node.on("click", function (event, d) {
      event.stopPropagation(); // Prevent body click event
      selectedNode = d; // Update the selected node globally

      // Update info panels based on the selected node
      const currentGraphIsSvg1 = this.parentNode.parentNode === svg1.node();
      if (currentGraphIsSvg1) {
        updateInfoPanelGraph1(d.name, d.value, d.color); // Update for svg1
        const nodeExistsInSvg2 = svg2
          .selectAll(".nodes circle")
          .data()
          .find((node) => node.name === d.name);
        if (nodeExistsInSvg2) {
          highlightNode(svg2, d.name, true); // Highlight in svg2 if exists
          updateInfoPanelGraph2(d.name, d.value, d.color); // Also update info panel for svg2
        } else {
          updateInfoPanelGraph2("Node does not exist here", "", ""); // Update info panel indicating non-existence
        }
      } else {
        updateInfoPanelGraph2(d.name, d.value, d.color); // Update for svg2
        const nodeExistsInSvg1 = svg1
          .selectAll(".nodes circle")
          .data()
          .find((node) => node.name === d.name);
        if (nodeExistsInSvg1) {
          highlightNode(svg1, d.name, true); // Highlight in svg1 if exists
          updateInfoPanelGraph1(d.name, d.value, d.color); // Also update info panel for svg1
        } else {
          updateInfoPanelGraph1("Node does not exist here", "", ""); // Update info panel indicating non-existence
        }
      }

      // Always highlight the node in the current graph
      highlightNode(
        this.parentNode.parentNode === svg1.node() ? svg1 : svg2,
        d.name,
        true
      );
    });

    // // Add labels to the nodes
    // const label = svg
    //   .append("g")
    //   .attr("class", "labels")
    //   .selectAll("text")
    //   .data(nodes)
    //   .enter()
    //   .append("text")
    //   .attr("dy", ".35em")
    //   .text((d) => d.name);

    // Force simulation tick update
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      //label.attr("x", (d) => d.x + 5).attr("y", (d) => d.y + 5);
    });

    // Drag event handlers
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  });
}

// Function to update node-link diagram based on selected dataset and threshold
function updateNodeLinkDiagram(svg, datasetDropdown, threshold, svg1, svg2) {
  const selectedDataset = datasetDropdown.property("value");
  svg.selectAll("*").remove(); // Clear existing diagram
  createNodeLinkDiagram(svg, selectedDataset, threshold, svg1, svg2);
}
// Initial creation of node-link diagrams with default datasets and thresholds
updateNodeLinkDiagram(svg1, d3.select("#datasetDropdown1"), 0, svg1, svg2);
updateNodeLinkDiagram(svg2, d3.select("#datasetDropdown2"), 0, svg1, svg2);

// Event listener for dataset dropdowns
d3.select("#datasetDropdown1").on("change", function () {
  updateNodeLinkDiagram(
    svg1,
    d3.select(this),
    d3.select("#nodeSizeSlider1").property("value"),
    svg1,
    svg2
  );
});

d3.select("#datasetDropdown2").on("change", function () {
  updateNodeLinkDiagram(
    svg2,
    d3.select(this),
    d3.select("#nodeSizeSlider2").property("value"),
    svg1,
    svg2
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
  updateThreshold(svg1, filterValue);
});

d3.select("#nodeSizeSlider2").on("input", function () {
  const filterValue = +this.value;
  updateThreshold(svg2, filterValue);
});
