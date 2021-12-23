import axios from "axios";
import _ from "lodash";
import Graph from 'graphology';

let netCache = null;

export async function loadNodeLinks() {
    if (netCache) {
        return netCache;
    }
    const response = await axios.get(`/nodeLinks.json`);
    netCache=response.data;
    return response.data;
}

export function net2connTable(net) {
    const table = {};
    const edges = net.edges;
    for (const index in edges) {
        const edge = edges[index];
        const { source, target, value } = edge;
        const link = {
            ...edge,
            index
        };

        if (_.has(table, source)) {
            table[source].push(link);
        }
        else {
            table[source] = [link];
        }

        const reverseLink = {
            source: target,
            target: source,
            index
        };
        if (_.has(table, target)) {
            table[target].push(reverseLink);
        }
        else {
            table[target] = [reverseLink];
        }
    }
    return table;
}

export function subGraph(net,subNodes){
    const g=new Graph();
    const {nodes,edges}=net;
    nodes.forEach(node=>g.addNode(node.id,node));
    edges.forEach(edge=>g.addEdge(edge.source,edge.target,edge));
    const queue=[...subNodes];
    const subNodesSet=new Set(subNodes);
    while(queue.length>0){
        const node=queue.shift();
        const neighbors = g.outNeighbors(node);
        neighbors.forEach(neighbor=>{
            if(!subNodesSet.has(neighbor)){
                subNodesSet.add(neighbor);
                queue.push(neighbor);
            }
        });
    }
    return {
        nodes:nodes.filter(node=>subNodesSet.has(node.id)),
        edges:edges.filter(edge=>subNodesSet.has(edge.source)&&subNodesSet.has(edge.target))
    }
}