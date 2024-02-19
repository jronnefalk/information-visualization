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

// Function to handle node click event
function handleNodeClick(clickedNodeData, svg1, svg2) {
  // Extract the name of the clicked node
  const clickedNodeName = clickedNodeData.name;

  // Define a class for highlighting
  const highlightClass = "selected";

  // Function to highlight nodes by name
  const highlightNode = (svg, nodeName) => {
    svg.selectAll(".nodes circle").each(function (d) {
      if (d.name === nodeName) {
        d3.select(this).classed(highlightClass, true);
      } else {
        d3.select(this).classed(highlightClass, false);
      }
    });
  };

  // Highlight the clicked node in both SVG elements
  highlightNode(svg1, clickedNodeName);
  highlightNode(svg2, clickedNodeName);
}

// Function to create node-link diagram
function createNodeLinkDiagram(svg, datasetUrl, threshold, svg1, svg2) {
  console.log("Creating node-link diagram:", svg);
  d3.json(datasetUrl).then(function (data) {
    // Extract nodes and links from the data
    const nodes = data.nodes.filter((d) => d.value > threshold);
    const links = data.links;

    // Create the simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.index)
      )
      .force("charge", d3.forceManyBody().strength(-100))
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
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Create the nodes
    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => Math.sqrt(d.value) * 2)
      .attr("fill", (d) => d.colour)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", function (event, d) {
        console.log("Node clicked:", d);
        handleNodeClick(d, svg1, svg2);
      });

    // Add labels to the nodes
    const label = svg
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("dy", ".35em")
      .text((d) => d.name);

    // Apply the forces
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      label.attr("x", (d) => d.x + 5).attr("y", (d) => d.y);
    });

    // Drag handlers
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

// Event listener for threshold sliders
d3.select("#nodeSizeSlider1").on("input", function () {
  const filterValue = +this.value;
  // Update the visualization with the new filter value
  updateNodeLinkDiagram(
    svg1,
    d3.select("#datasetDropdown1"),
    filterValue,
    svg1,
    svg2
  );
});

d3.select("#nodeSizeSlider2").on("input", function () {
  const filterValue = +this.value;
  // Update the visualization with the new filter value
  updateNodeLinkDiagram(
    svg2,
    d3.select("#datasetDropdown2"),
    filterValue,
    svg1,
    svg2
  );
});
