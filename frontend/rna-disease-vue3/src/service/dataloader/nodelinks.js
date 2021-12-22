import axios from "axios";
import _ from "lodash";

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