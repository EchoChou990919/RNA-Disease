import _ from "lodash";
import * as d3 from "d3";



onmessage = function (event) {
    var nodes = event.data.nodes,
        links = event.data.edges;

    const RANGE_X = event.data.range_x;
    const RANGE_Y = event.data.range_y;
    const VIEW_RANGE= event.data.view_range;
    const alphaMin=event.data.alphaMin||0.001;

    const width = event.data.width;
    const height = event.data.height;

    const x = d3.scaleLinear().domain(RANGE_X).range([VIEW_RANGE[0], VIEW_RANGE[2]]);
    const y = d3.scaleLinear().domain(RANGE_Y).range([VIEW_RANGE[1], VIEW_RANGE[3]]);

    let simulation = d3.forceSimulation()
        .nodes(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(0, 0))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaMin(alphaMin)
        .stop();

    let densityCalc = d3
        .contourDensity()
        .x((d) => x(d.x))
        .y((d) => y(d.y))
        .weight((d) => d.degree)
        .cellSize(4)
        // .bandwidth(30)
        // .thresholds(5)
        .thresholds([1,2, 5, 10, 20, 30]);
        // .thresholds([3,6,12,25,35]);


    let nodeGroup = _.groupBy(nodes, (d) => d.category);

    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        let contours = _.mapValues(nodeGroup, densityCalc);
        postMessage({
            type: "tick",
            contours
        });
        simulation.tick();
    }

    postMessage({ type: "end", nodes: nodes, edges: links });
};