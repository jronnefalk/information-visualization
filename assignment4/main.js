// Load the data from the JSON file
d3.json("data/starwars-full-interactions-allCharacters.json").then(function (
  data
) {
  // Extract nodes and links from the data
  const nodes = data.nodes;
  const links = data.links;

  // Create the SVG container
  const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  // Create the simulation
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.index)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Create the links
  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
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
    .attr("fill", (d) => d.colour);

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
});
