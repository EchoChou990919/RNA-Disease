/* eslint-disable */

import _ from "lodash";

export default function (groupCenter, groupFunc = x => x.category) {
    var nodes, strength = 1;

    var groups=_.keys(groupCenter);

    // if (x == null) x = 0;
    // if (y == null) y = 0;

    function force() {
        let nodeGroup=_.groupBy(nodes,groupFunc);
        for(var c in nodeGroup){
            let node_g=nodeGroup[c];
            let x=0,y=0;
            if(groupCenter[c]!=null){
                x=groupCenter[c].x;
                y=groupCenter[c].y;
            }
            var i,
                n = node_g.length,
                node,
                sx = 0,
                sy = 0;

            for (i = 0; i < n; ++i) {
                node = node_g[i], sx += node.x, sy += node.y;
            }

            for (sx = (sx / n - x) * strength, sy = (sy / n - y) * strength, i = 0; i < n; ++i) {
                node = node_g[i], node.x -= sx, node.y -= sy;
            }
        }
    }

    force.initialize = function (_) {
        nodes = _;
    };

    force.x = function (_) {
        return arguments.length ? (x = +_, force) : x;
    };

    force.y = function (_) {
        return arguments.length ? (y = +_, force) : y;
    };

    force.strength = function (_) {
        return arguments.length ? (strength = +_, force) : strength;
    };

    return force;
}