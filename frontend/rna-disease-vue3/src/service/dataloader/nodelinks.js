// import axios from "axios";
import _ from "lodash";

import nodeLinks from "/public/nodeLinks.json";


let netCache = null;
let connCache = null;

export function loadNodeLinks() {
    // if (netCache) {
    //     return netCache;
    // }
    // const response = await axios.get(`/nodeLinks.json`);
    // netCache=response.data;
    // return response.data;
    return nodeLinks;
}

export function net2connTable(net=nodeLinks) {
    if(connCache){
        return connCache;
    }
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
            ...edge,
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
    connCache=table;
    return table;
}

// export function getEdgeBy