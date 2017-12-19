// Import ForceGraph class
import ForceGraph from './ForceGraph';
let graph = new ForceGraph();

$(document).ready(function() {
	graph.setGraphWidth($('#forcegraph').width());
	graph.drawForcegraph();

	const resizeThreshold = 175;

	// Check for drastic window resize
	// $(window).resize(function() {
	// 	const changeInWidth = Math.abs($('#forcegraph').width() - graph.getGraphWidth());
	// 	// console.log(changeInWidth);

	// 	if (changeInWidth > resizeThreshold) {
	// 		console.log('...resizing graph...');
	// 		$('#forcegraph').addClass('invisible');
	// 		graph.setGraphWidth($('#forcegraph').width());
	// 		graph.drawForcegraph();
	// 	}
	// });
});
