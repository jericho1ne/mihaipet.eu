$(document).ready(function() {
	$('#forcegraph').removeClass('invisible');

	// Constants for the SVG
	var width = 380,
		height = 360,
		circleRadius = 11,
		iconSize = 32;

	// Color scales (10, 20, 20b, 20c)
	// https://github.com/d3/d3-3.x-api-reference/blob/master/Ordinal-Scales.md#categorical-colors
	var color = d3.scale.category10();

	//Set up the force layout
	var force = d3.layout.force()
		.gravity(.21)
		.charge(-1200)
		.distance(60)
		.size([width, height]);

	// Append SVG to the DOM
	var svg = d3.select("#forcegraph").append("svg")
		.attr("width", width)
		.attr("height", height);

	//Read the data from the mis element
	var mis = document.getElementById('forcegraph').innerHTML;

	d3.json('data.json', function(error, graph) {
		if (error) throw error;

		// Create data structure from JSON
		force.nodes(graph.nodes)
			.links(graph.links)
			.start();

		// Create all the line svgs (without locations0
		var link = svg.selectAll(".link")
			.data(graph.links)
			.enter().append("line")
			.attr("class", "link")
			.style("stroke-width", function (d) {
			return Math.sqrt(d.value);
		});

		// Do the same with the each node's circle
		var node = svg.selectAll(".node")
			.data(graph.nodes)
			.enter().append("g")
			.attr("class", "node")
			.call(force.drag);
		node.append("circle")
			.attr("r", circleRadius)
			.style("fill", function (d) {
			return color(d.group);
		});
		node.append("text")
			.attr("dx", 14)
			.attr("dy", ".375em")
			.text(function(d) { return d.name });

		// Append image with a slight offset
		node.append("image")
			.attr("xlink:href",function(d) { return d.img })
			.attr("height", iconSize)
			.attr("width", iconSize);

		// Generate co-ordinates, update attributes of SVG elements
		var xMultiplier = 1;
		force.on("tick", function () {
			link.attr("x1", function (d) { return d.source.x * xMultiplier; })
				.attr("y1", function (d) { return d.source.y; })
				.attr("x2", function (d) { return d.target.x * xMultiplier; })
				.attr("y2", function (d) { return d.target.y; });

			// Append all images to each color node
			d3.selectAll("image")
				.attr("x", function (d) { return (d.x * xMultiplier) - 18; })
				.attr("y", function (d) { return d.y - 16; });

			d3.selectAll("circle")
				.attr("cx", function (d) { return d.x * xMultiplier; })
				.attr("cy", function (d) { return d.y;});


			d3.selectAll("text").attr("x", function (d) { return d.x * xMultiplier;})
				.attr("y", function (d) {
				return d.y;
			});
		});
	});
});
