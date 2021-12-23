<template>
    <tooltip-vue v-if="tooltip" :x="tooltip.x" :y="tooltip.y">
        <n-space>
            <div
            >{{ tooltip.name }}</div>
        </n-space>
    </tooltip-vue>
    <svg
        :width="width"
        :height="height"
        :viewBox="`${min_x} ${min_y} ${width} ${height}`"
        ref="el"
        @mousemove="onMouseMove"
        :class="class"
    >
        <mask
            :x="min_x - r"
            :y="min_y - r"
            :width="width + 2 * r"
            :height="height + 2 * r"
            v-for="group,idx in groups"
            :id="`particalEdges${idx}`"
        >
            <link-vertical-vue
                v-for="link in group.particalEdges"
                v-bind="link"
                stroke-linecap="round"
                :stroke-width="2 * r"
                stroke="#fff"
            />
            <circle v-for="point in group.points" :cx="point.x" :cy="point.y" :r="r" fill="#fff" />
        </mask>

        <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="15"
            refY="12"
            viewBox="0 0 24 24"
            orient="auto"
            markerUnits="strokeWidth"
        >
            <path d="M6.23 20.23L8 22l10-10L8 2L6.23 3.77L14.46 12z" :fill="stroke_color" />
            <!-- <path d="M0,0 L0,6 L9,3 z" fill="currentColor" /> -->
        </marker>
        
        <rect
            v-for="group,idx in groups"
            :x="min_x - r"
            :y="min_y - r"
            :width="width + 2 * r"
            :height="height + 2 * r"
            :fill="colors[idx]"
            opacity="0.5"
            :mask="`url(#particalEdges${idx})`"
        />
        <link-vertical-vue
            v-for="link in dag_links"
            v-bind="link"
            fill="none"
            :stroke="stroke_color"
            :stroke-width="0.5"
            marker-end="url(#arrow)"
        />
        <!-- <symbol-vue 
            v-for="point in dag_points" 
            v-bind="point" 
            :size="Math.PI*node_r**2" 
            fill="#aaa" 
            :stroke="stroke_color"
            :stroke-width="0.5"
        />
        <g v-for="group,idx in groups">
            <symbol-vue
                v-for="point in group.points"
                v-bind="point"
                :size="Math.PI*node_r**2"
                :fill="colors[idx]"
            />
        </g> -->
        <pie-vue 
            v-for="point in dag_points"
            :data="[1, 1]" 
            :colors="color(point)"
            :x="point.x"
            :y="point.y"
            :inner-radius="0"
            :outer-radius="node_r"
            :tag="'g'"
        ></pie-vue>
        <circle
            v-for="point in dag_points"
            :cx="point.x"
            :cy="point.y"
            :r="node_r"
            :stroke="stroke_color"
            :stroke-width="0.5"
            fill="none"
        >
        </circle>
    </svg>
    <n-button @click="subNet">111</n-button>
</template>

<script setup>
import * as d3 from "d3";
import { NGradientText } from "naive-ui";

import symbolVue from "./shapes/symbol.vue";
import linkVerticalVue from "./shapes/linkVertical.vue";
import curveVue from "./shapes/curve.vue";
import tooltipVue from "./shapes/tooltip.vue";
import pieVue from "./pie.vue";

import { ArrowCircleDown20Filled } from "@vicons/fluent"

import _ from "lodash";
import { reactive, ref, onMounted } from "vue";
import svgPanZoom from "svg-pan-zoom";
import { loadCase } from "@/service/dataloader/dag";
import { dagLayout, pack, filterNode2edges } from "@/utils/dagLayout";
import { useZoom, offset2svg, svg2offset } from "@/utils/zoom"; 
import {subGraph,loadNodeLinks} from "@/service/dataloader/nodelinks";

defineProps(["class"])
const el = ref(null);
const { transform } = useZoom(el);

const width = 200;
const height = 200;
const min_x = -width / 2;
const min_y = -height / 2;
const r = 10;
const colors = ["#8dd3c7", "#ffffb3"];
const stroke_color = "#000"
const node_r=5;
const margin=100;

const caseData = await loadCase();
const { case_i, case_j, nodes, edges } = caseData;


const layout = dagLayout(nodes, edges, {
    id: item => item.doid,
    graph_opts: {
        rankdir: "BT",
        marginx:margin,
        marginy:margin,
    },
    node_opts:{
        width:node_r*2,
        height:node_r*2,
    }
});

const dag_raw_points = layout.nodes;
const dag_raw_edges = layout.edges;
const out_graph = layout.graph;
const x = d3.scaleLinear().domain([0, out_graph.width]).range([min_x, min_x + width]);
const y = d3.scaleLinear().domain([0, out_graph.height]).range([min_y, min_y + height]);
const dag_points = dag_raw_points.map(v => {
    return {
        x: x(v.x),
        y: y(v.y),
        name: v.doid
    };
});

const dag_links = [];
for (let edge of edges) {
    const { source, target } = edge;
    const source_node = dag_points.find(point => point.name == source);
    const target_node = dag_points.find(point => point.name == target);
    dag_links.push({
        source: [source_node.x, source_node.y-node_r],
        target: [target_node.x, target_node.y+node_r],
        v: source,
        w: target
    });
}


const groups = [case_i, case_j].map(case_item => {
    const points = dag_points.filter(point => case_item.find(j => j == point.name));
    // pack(points);
    const particalEdges = filterNode2edges(points, dag_links, {
        id: i => i.name,
        edge_source: i => i.v,
        edge_target: i => i.w
    });
    return {
        points,
        particalEdges
    };
})


const tooltip = ref(null);
const quadtree = d3.quadtree().x(d => d.x).y(d => d.y).addAll(dag_points);
function onMouseMove(e) {
    const { offsetX, offsetY } = e;
    let { x, y } = offset2svg(offsetX, offsetY, transform);
    const node = quadtree.find(x, y, r);
    // console.log(node,offsetX,offsetY,x,y);
    if (node) {
        let { x, y } = svg2offset(node.x, node.y, transform);
        tooltip.value = {
            ...node,
            x,
            y,
        };
    }
    else {
        tooltip.value = null;
    }
}

function color(node) {
    const in_case_i = case_i.find(i => i == node.name);
    const in_case_j = case_j.find(i => i == node.name);
    if (in_case_i && in_case_j) {
        return (_, __, idx) => colors[idx];
    }
    else if (in_case_j) {
        return () => colors[1];
    }
    else if (in_case_i) {
        return () => colors[0];
    }
    else {
        return () => "#aaa";
    }
}

const nodelinks=await loadNodeLinks();

async function subNet(){
    const nodes=[{
            "id": "2",
            "name": "LINC01531",
            "category": 0,
            "degree": 1.000000000000007
        },
        {
            "id": "3",
            "name": "HPN-AS1",
            "category": 0,
            "degree": 1.000000000000007
        }];
    const res=await subGraph(nodelinks,nodes.map(node=>node.id));
    console.log(res);
}

</script>