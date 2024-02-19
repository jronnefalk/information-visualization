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

// Function to create node-link diagram
function createNodeLinkDiagram(svg, datasetUrl, threshold) {
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
      );

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
function updateNodeLinkDiagram(svg, datasetUrl, threshold) {
  svg.selectAll("*").remove(); // Clear existing diagram
  createNodeLinkDiagram(svg, datasetUrl, threshold);
}
// Initial creation of node-link diagrams with default datasets and thresholds
updateNodeLinkDiagram(
  svg1,
  "data/starwars-full-interactions-allCharacters.json",
  0
);
updateNodeLinkDiagram(
  svg2,
  "data/starwars-full-interactions-allCharacters.json",
  0
);

// Event listener for dataset dropdowns
d3.select("#datasetDropdown1").on("change", function () {
  const selectedDataset = d3.select(this).property("value");
  const threshold = +d3.select("#nodeSizeSlider1").property("value");
  updateNodeLinkDiagram(svg1, selectedDataset, threshold);
});

d3.select("#datasetDropdown2").on("change", function () {
  const selectedDataset = d3.select(this).property("value");
  const threshold = +d3.select("#nodeSizeSlider2").property("value");
  updateNodeLinkDiagram(svg2, selectedDataset, threshold);
});

// Function to update node-link diagram based on threshold slider value
function updateThreshold(svg, threshold) {
  const nodes = svg.selectAll(".nodes circle");
  const labels = svg.selectAll(".labels text");
  labels.attr("display", function (d) {
    return d.value > threshold ? "block" : "none";
  });
  nodes.attr("display", function (d) {
    return d.value > threshold ? "block" : "none";
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
