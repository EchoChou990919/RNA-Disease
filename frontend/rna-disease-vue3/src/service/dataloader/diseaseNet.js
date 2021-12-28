
import Graph from 'graphology';

import diseaseNet from "/public/diseaseNet.json";



export function loadDiseaseNet() {
    return diseaseNet
}

export function subGraph(net, subNodes, opts = {}) {
    const { id = i => i.id } = opts;
    const g = new Graph();
    const { nodes, edges } = net;
    nodes.forEach(node => g.addNode(id(node), node));
    edges.forEach(edge => g.addEdge(edge.source, edge.target, edge));
    const queue = [...subNodes];
    const subNodesSet = new Set(subNodes);
    while (queue.length > 0) {
        const node = queue.shift();
        if(!g.hasNode(node)){
            continue;
        }
        const neighbors = g.outNeighbors(node);
        neighbors.forEach(neighbor => {
            if (!subNodesSet.has(neighbor)) {
                subNodesSet.add(neighbor);
                queue.push(neighbor);
            }
        });
    }
    return {
        nodes: nodes.filter(node => subNodesSet.has(id(node))),
        edges: edges.filter(edge => subNodesSet.has(edge.source) && subNodesSet.has(edge.target))
    }
}
