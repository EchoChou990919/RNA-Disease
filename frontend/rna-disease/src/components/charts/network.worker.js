import _ from "lodash";
import * as d3 from "d3";
import groupCenter from "../../utils/groupCenter";



onmessage= function(event) {
    var nodes = event.data.nodes,
        links = event.data.edges;


    const width = 800;
    const height = 600;

    const RANGE = [-1000, 1000];
    const x = d3.scaleLinear().domain(RANGE).range([0, width]);
    const y = d3.scaleLinear().domain(RANGE).range([0, height]);

    let simulation = d3
        .forceSimulation(nodes)
        .force(
            "link",
            d3
                .forceLink(links)
                .id((d) => d.id)
        )
        .force("charge", d3.forceManyBody())
        .force("center", groupCenter(
            {
                0: { x: 0, y: 150 },
                1: { x: -300, y: -150 },
                2: { x: 300, y: -150 },
            }
        ))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .stop();

    let densityCalc = d3
        .contourDensity()
        .x((d) => x(d.x))
        .y((d) => y(d.y))
        .cellSize(10)
        .bandwidth(30)
        .thresholds([0.05, 0.1, 0.2, 0.3]);


    let nodeGroup=_.groupBy(nodes, (d)=>d.category);
    

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

    postMessage({ type: "end", nodes: nodes, links: links });
};