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

// Update the shared information panel (nodes)
function updateSharedInfoPanel(name = "", value = "", color = "") {
  document.getElementById("info-name").textContent = name;
  document.getElementById("info-value").textContent = value;
  document.getElementById("info-color").style.backgroundColor = color;
  document.getElementById("info-color").textContent = color ? "" : "N/A";
}

// Update the shared information panel (links)
function updateLinkInfoPanel(source = "", target = "", value = "") {
  document.getElementById("link-source").textContent = source || "";
  document.getElementById("link-target").textContent = target || "";
  document.getElementById("link-value").textContent = value || "";
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

function resizeNodeInBothDiagrams(nodeName, newSize) {
  [svg1, svg2].forEach((svg) => {
    svg
      .selectAll(".nodes circle")
      .filter((d) => d.name === nodeName)
      .transition()
      .duration(150)
      .attr("r", (d) =>
        newSize ? Math.sqrt(d.value) * newSize : Math.sqrt(d.value) * 2
      );
  });
}

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

    const simulation = d3
      .forceSimulation(nodes)
      .force("collide", d3.forceCollide().radius(30))
      .force("link", d3.forceLink().links(links).distance(5))
      .force("charge", d3.forceManyBody().strength(-50))
      .force(
        "center",
        d3.forceCenter(+svg.attr("width") / 2, +svg.attr("height") / 2)
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
        updateLinkInfoPanel(d.source.name, d.target.name, d.value);
      })
      .on("mouseout", function (event, d) {
        highlightLinkInBothDiagrams(d.source.name, d.target.name, false);
        updateLinkInfoPanel();
      });

    // Create the nodes
    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => Math.sqrt(d.value) * 2) // Set initial radius based on node's value
      .attr("fill", (d) => d.colour)
      .on("mouseover", function (event, d) {
        resizeNodeInBothDiagrams(d.name, 3); // Attempt to resize nodes in both diagrams
        updateSharedInfoPanel(d.name, d.value, d.colour); // Update info panel
      })
      .on("mouseout", function (event, d) {
        resizeNodeInBothDiagrams(d.name, null); // Attempt to restore original size in both diagrams
      })
      .call(
        d3
          .drag() // Enable drag functionality
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

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
  nodeSizeValue1.innerText = filterValue;
  updateThreshold(svg1, filterValue);
});

d3.select("#nodeSizeSlider2").on("input", function () {
  const filterValue = +this.value;
  nodeSizeValue2.innerText = filterValue;
  updateThreshold(svg2, filterValue);
});
