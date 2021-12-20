import _ from "lodash";
import * as d3 from "d3";



onmessage = function (event) {
    var nodes = event.data.nodes,
        links = event.data.edges;

    const RANGE = event.data.range||[-1000, 1000];

    const width = event.data.width||800;
    const height = event.data.height||600;

    const x = d3.scaleLinear().domain(RANGE).range([0, width]);
    const y = d3.scaleLinear().domain(RANGE).range([0, height]);

    let simulation = d3.forceSimulation()
        .nodes(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(0, 0))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", () => console.log("tick"))
        .stop();

    let densityCalc = d3
        .contourDensity()
        .x((d) => x(d.x))
        .y((d) => y(d.y))
        .weight((d) => d.degree)
        .cellSize(10)
        .bandwidth(30)
        .thresholds([2, 5, 10, 20, 30]);


    let nodeGroup = _.groupBy(nodes, (d) => d.category);


    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        let contours = _.mapValues(nodeGroup, densityCalc);
        postMessage({
            type: "tick",
            //  nodes: nodes, 
            //  links: links ,
            contours
        });
        simulation.tick();
    }

    postMessage({ type: "end", nodes: nodes, edges: links });
};