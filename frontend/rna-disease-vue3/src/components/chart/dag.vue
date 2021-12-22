<template>
    <svg
        :width="width"
        :height="height"
        :viewBox="`${min_x} ${min_y} ${width} ${height}`"
        ref="el"
    >
        <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
        >
            <path d="M0,0 L0,6 L9,3 z" fill="black" />
        </marker>
        <path opacity="0.1" v-for="p in paths" :key="p" :d="d3.geoPath()(p)" />
        <symbol-vue v-for="point in hull" :x="point[0]" :y="point[1]" size="10" fill="green" />
        <symbol-vue v-for="point in outerPoints" v-bind="point" :size="5" fill="blue" />
        <symbol-vue :x="center[0]" :y="center[1]" fill="red" />
        <path
            :d="line+'Z'"
            :stroke="'red'"
            fill="red"
            opacity="0.2"
        ></path>
        <path
            :d="line2+'Z'"
            :stroke="'blue'"
            fill="blue"
            opacity="0.2"
        ></path>
        <symbol-vue v-for="point in dag_points" v-bind="point" :size="10" />
        <link-vertical-vue v-for="link in dag_links" v-bind="link" fill="none" stroke="black" marker-end="url(#arrow)"/>
        <symbol-vue v-for="point in points" v-bind="point" :size="10" fill="red" />
        <symbol-vue v-for="point in points2" v-bind="point" :size="10" fill="blue" />

        <!-- <line 
            v-for="link in dag_links"
            :x1="link.source[0]"
            :y1="link.source[1]"
            :x2="link.target[0]"
            :y2="link.target[1]"
            stroke="black"
        ></line>-->
    </svg>
</template>

<script setup>
import * as d3 from "d3";
import symbolVue from "./shapes/symbol.vue";
import linkVerticalVue from "./shapes/linkVertical.vue";
import _ from "lodash";
import { reactive, ref, onMounted } from "vue";
import svgPanZoom from "svg-pan-zoom";
import { loadCase } from "@/service/dataloader/dag";
import Graph from 'graphology';

import dagre from 'dagre';

const el = ref(null);
let zoom = null;
const initZoom = () => {
    zoom = svgPanZoom(el.value);
};
onMounted(initZoom);

const width = 200;
const height = 200;
const min_x = -width / 2;
const min_y = -height / 2;


const caseData = await loadCase();
const { case_i, case_j, nodes, edges } = caseData;
const graph = new Graph();
nodes.forEach(node => graph.addNode(node.doid));
edges.map(edge => [edge.source, edge.target]).forEach(
    edge => graph.addEdge(edge[0], edge[1])
);

const g = new dagre.graphlib.Graph();
g.setGraph({
    rankdir:"BT"
});
g.setDefaultEdgeLabel(function () { return {}; });
nodes.forEach(node => g.setNode(node.doid, {}));
edges.forEach(edge => g.setEdge(edge.source, edge.target));
dagre.layout(g);
const dag_points = [];
const out_graph = g.graph();
const x = d3.scaleLinear().domain([-10, out_graph.width + 10]).range([min_x, min_x + width]);
const y = d3.scaleLinear().domain([-10, out_graph.height + 10]).range([min_y, min_y + height]);

console.log(g.nodes());
g.nodes().forEach(v => {
    console.log(v, g.node(v));
    dag_points.push({
        x: x(g.node(v).x),
        y: y(g.node(v).y),
        name: v
    });
})
console.log("graph", g.graph());

// const res={};
// let layer=0;
// while(graph.order){
//     console.log(graph.order)
//     const zero_in_nodes=graph.filterNodes(node=>graph.outDegree(node)==0);
//     console.log(zero_in_nodes);
//     res[layer++]=zero_in_nodes;
//     zero_in_nodes.forEach(node=>graph.dropNode(node));
// }

// const layer_height=height/_.keys(res).length;

// for(let layer in res){
//     const nodes=res[layer];
//     const layer_width=width/nodes.length;
//     for(let i in nodes){
//         const node=nodes[i];
//         dag_points.push({
//             x:min_x+layer_width/2+layer_width*i,
//             y:min_y+layer_height*layer,
//             name:node
//         });
//     }
// }



const dag_links = [];
for (let edge of edges) {
    const { source, target } = edge;
    const source_node = dag_points.find(point => point.name == source);
    const target_node = dag_points.find(point => point.name == target);
    dag_links.push({
        source: [source_node.x, source_node.y],
        target: [target_node.x, target_node.y]
    });
}


const points=dag_points.filter(point=>case_i.find(j=>j==point.name));
const hull = d3.polygonHull(points.map(i => [i.x, i.y]));
const center = d3.polygonCentroid(hull);
const offset = 10;
const outerPoints = [];
for (let point of hull) {
    // const { x, y } = point;
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
const line = d3.line().curve(d3.curveCatmullRomClosed)(outerHull);


const points2=dag_points.filter(point=>case_j.find(j=>j==point.name));
const hull2 = d3.polygonHull(points2.map(i => [i.x, i.y]));
const center2 = d3.polygonCentroid(hull);
const outerPoints2 = [];
for (let point of hull2) {
    // const { x, y } = point;
    const x = point[0];
    const y = point[1];
    const centerX = center2[0];
    const centerY = center2[1];
    const vX = x - centerX;
    const vY = y - centerY;
    const vL = Math.sqrt(vX * vX + vY * vY);
    const iX = vX / vL;
    const iY = vY / vL;
    const nX = iX * offset;
    const nY = iY * offset;
    outerPoints2.push({
        x: x + nX,
        y: y + nY
    });
}
const outerHull2 = d3.polygonHull(outerPoints2.map(i => [i.x, i.y]));
const line2 = d3.line().curve(d3.curveCatmullRomClosed)(outerHull2);
</script>