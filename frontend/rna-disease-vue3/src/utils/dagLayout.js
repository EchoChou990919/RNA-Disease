import dagre from 'dagre';
import * as d3 from "d3";

export function dagLayout(nodes, edges, opts = {}) {
    const {
        id = item => item.id,
        edge_id = item => item,
        edge_source = item => item.source,
        edge_target = item => item.target,
        graph_opts = {},
        node_opts = {},
    } = opts;
    const g = new dagre.graphlib.Graph();
    g.setGraph(graph_opts);
    nodes.forEach(node => g.setNode(id(node), {
        ...node,
        width:1,
        height:1,
        ...node_opts,
    }));
    edges.forEach(edge => g.setEdge(edge_id(edge_source(edge)), edge_id(edge_target(edge)), edge));
    dagre.layout(g);
    return {
        nodes: g.nodes().map(id => g.node(id)),
        edges: g.edges().map(e => {
            const edge = g.edge(e);
            return {
                source: e.v,
                target: e.w,
                ...edge,
            }
        }),
        graph: g.graph(),
    }
}

export function pack(points, opts = {}) {
    const {
        x = i => i.x,
        y = i => i.y,
        offset = 10,
        curve = d3.curveCatmullRomClosed
    } = opts;
    const points_processed = points.map(i => [x(i), y(i)]);
    const hull = d3.polygonHull(points_processed);
    const center = d3.polygonCentroid(hull);
    // const offset = 10;
    const outerPoints = [];
    for (let point of hull) {
        const x = point[0];
        const y = point[1];
        const centerX = center[0];
        const centerY = center[1];
        const vX = x - centerX;
        const vY = y - centerY;
        const vL = Math.sqrt(vX * vX + vY * vY);
        const iX = vX / vL;
        const iY = vY / vL;
        const nX = iX * offset;
        const nY = iY * offset;
        outerPoints.push({
            x: x + nX,
            y: y + nY
        });
    }
    const outerHull = d3.polygonHull(outerPoints.map(i => [i.x, i.y]));
    const line = d3.line().curve(curve)(outerHull);
    return { line, outerPoints, center, hull };
}

export function filterNode2edges(nodes, edges, opts = {}) {
    const {
        id = item => item.id,
        edge_id = item => item,
        edge_source = item => item.source,
        edge_target = item => item.target,
    } = opts;
    const node_ids = new Set(nodes.map(id));
    const res = edges.filter(edge => {
        return node_ids.has(edge_id(edge_source(edge))) && node_ids.has(edge_id(edge_target(edge)))
    })
    return res;
}