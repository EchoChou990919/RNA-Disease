import _ from "lodash";

import nodeLinks from "/public/newNodeLinks.json";


let netCache = null;
let connCache = null;
let connMtx_t = {};

for(const edge of nodeLinks.edges){
    if(!connMtx_t[edge.source]){
        connMtx_t[edge.source]={};
    }
    connMtx_t[edge.source][edge.target]=edge;
    const reverseLink = {
        ...edge,
        source: edge.target,
        target: edge.source,
    };
    if (!connMtx_t[edge.target]) {
        connMtx_t[edge.target] = {};
    }
    connMtx_t[edge.target][edge.source] = reverseLink;
}
export const connMtx=connMtx_t;


export function loadNodeLinks() {
    return nodeLinks;
}

export function net2connTable(net=nodeLinks) {
    if(connCache){
        return connCache;
    }
    const table = {};
    const edges = net.edges;
    const nodes=net.nodes;
    for (const index in edges) {
        const edge = edges[index];
        const { source, target, value } = edge;
        const sourceNode = nodes.find(n => n.id == source);
        const targetNode = nodes.find(n => n.id == target);
        const link = {
            ...edge,
            sourceNode,targetNode,
            index
        };

        if (_.has(table, source)) {
            table[source].push(link);
        }
        else {
            table[source] = [link];
        }

        const reverseLink = {
            ...edge,
            source: target,
            target: source,
            sourceNode:targetNode, targetNode:sourceNode,
            index
        };
        if (_.has(table, target)) {
            table[target].push(reverseLink);
        }
        else {
            table[target] = [reverseLink];
        }
    }
    connCache=table;
    return table;
}

// export function getEdgeBy