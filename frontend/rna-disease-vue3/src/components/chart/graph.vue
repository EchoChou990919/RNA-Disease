<template>
    <tooltip-vue
        v-for="node in labels"
        :key="node.id"
        :x="d3position2offset(node.x, node.y).x"
        :y="d3position2offset(node.x, node.y).y"
        :style="{
            color: colors[node.category]
        }"
    >{{ node.name }}</tooltip-vue>
    <svg
        :class="class"
        :width="width"
        :height="height"
        :viewBox="`${VIEW_RANGE[0]} ${VIEW_RANGE[1]} ${width} ${height}`"
        ref="el"
        @mousemove="onMouseMove"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
    >
        <g>
            <!-- 节点链接图 -->
            <line
                v-if="renderDone"
                v-for="edge in showEdges"
                :stroke-width="2 / transform.k"
                :key="edge.source.id + '-' + edge.target.id"
                :x1="x(edge.source.x)"
                :y1="y(edge.source.y)"
                :x2="x(edge.target.x)"
                :y2="y(edge.target.y)"
                :opacity="edge.value * 0.5"
                :stroke="colors[edge.target.category]"
                :stroke-dasharray="
                    edge.source_type == edge.target_type ? '1' : 'none'
                "
            />
            <symbol-vue
                v-if="renderDone"
                v-for="(node,index) in nodes"
                :key="node.id"
                :x="x(node.x || 0)"
                :y="y(node.y || 0)"
                :size="(2 + node.degree / 12) / transform.k"
                :fill="colors[node.category]"
                :symbol="symbols[node.category]"
                :opacity="node.highlight == nodeHighlightToken ? 1 : 0.1"
            />
        </g>
        <g>
            <!-- 密度图 -->
            <g v-for="group in _.keys(paths)" :key="group">
                <path
                    opacity="0.1"
                    v-for="p in paths[group]"
                    :key="p"
                    :d="d3.geoPath()(p)"
                    :fill="colors[group]"
                />
            </g>
        </g>
    </svg>
</template>

<script setup>
import * as d3 from "d3";
import _ from "lodash";
import { ref, reactive, onMounted, computed, watch, watchEffect } from "vue";
import svgPanZoom from "svg-pan-zoom";

import symbolVue from "./shapes/symbol.vue";
import tooltipVue from "./shapes/tooltip.vue";

import { SelectionStore } from "@/store/selection";
import { loadNodeLinks, net2connTable } from "@/service/dataloader/nodelinks";
import ForceWorker from "@/service/worker/force.worker?worker";
import { useZoom,offset2svg,svg2offset } from "@/utils/zoom";

defineProps(["class"]);

//配置
const width = 800;
const height = 600;
const RANGE_X = [-1000, 1000];
const RANGE_Y = [-750, 750];
const VIEW_RANGE = [0, 0, width, height];
const colors = {
    0: "steelblue",
    1: "green",
    2: "orange",
}
const label = {
    0: "lncRNA",
    1: "Disease",
    2: "miRNA"
}

const symbols = {
    0: d3.symbolCircle,
    1: d3.symbolSquare,
    2: d3.symbolTriangle,
}

const nodeHighlightToken = ref(0);
const selectionStore = SelectionStore();

//加载数据
const forceWorker = new ForceWorker();
const nodeLinks = await loadNodeLinks();
const connTable = net2connTable(nodeLinks);

const nodes = ref(nodeLinks.nodes); //节点
const edges = ref(nodeLinks.edges); //边
const paths = ref([]);              //密度图

const showEdges = ref([]);

const x = d3.scaleLinear().domain(RANGE_X).range([VIEW_RANGE[0], VIEW_RANGE[2]]);
const y = d3.scaleLinear().domain(RANGE_Y).range([VIEW_RANGE[1], VIEW_RANGE[3]]);
const rx = d3.scaleLinear().domain([VIEW_RANGE[0], VIEW_RANGE[2]]).range(RANGE_X);
const ry = d3.scaleLinear().domain([VIEW_RANGE[1], VIEW_RANGE[3]]).range(RANGE_Y);

const renderDone = ref(false);

let quadtree = d3
    .quadtree()
    .x((d) => d.x)
    .y((d) => d.y);
let delaunay = d3.Delaunay.from([]);

//力引导
forceWorker.postMessage({
    nodes: nodeLinks.nodes,
    edges: nodeLinks.edges,
    range_x: RANGE_X,
    range_y: RANGE_Y,
    height,
    width,
    view_range: VIEW_RANGE,
});
forceWorker.onmessage = (e) => {
    switch (e.data.type) {
        case "tick":
            paths.value = e.data.contours;
            break;
        case "end":
            nodes.value = e.data.nodes;
            highlight(nodes.value);
            edges.value = e.data.edges;
            quadtree.addAll(nodes.value);
            delaunay = d3.Delaunay.from(
                nodes.value,
                (d) => d.x,
                (d) => d.y
            );
            console.log("done.", nodes.value);
            renderDone.value = true;
            break;
    }
};

//缩放
const el = ref(null);
const panning = ref(false);
const { transform, zoom } = useZoom(el, {
    beforePan: () => {
        panning.value = true;
    },
    dblClickZoomEnabled: false,
})


//处理鼠标交互
function highlight(nodes) {
    nodeHighlightToken.value++;
    nodes.forEach(node => {
        node.highlight = nodeHighlightToken.value;
    });
}

function isHighlight(node) {
    return node.highlight == nodeHighlightToken.value;
}

function clearSelection() {
    showEdges.value = [];
    highlight(nodes.value);
}

function mouse2nodeIndex(offsetX, offsetY, d_threshold = 70) {
    const {x,y}=offset2svg(offsetX,offsetY,transform);
    const target_x = rx(x);
    const target_y = ry(y);
    const target_index = delaunay.find(target_x, target_y);
    const target = nodes.value[target_index];
    if (!target) return null;
    const d = (target.x - target_x) ** 2 + (target.y - target_y) ** 2;
    if (d > d_threshold ** 2) {
        return null;
    }
    return target;
}

const top = ref(0);
const left = ref(0);
function d3position2offset(target_x, target_y) {
    return svg2offset(x(target_x),y(target_y),transform);
}

// 实现悬浮效果
// const hovered = ref(null);
function onMouseMove(e) {

    const { offsetX, offsetY } = e;
    top.value = offsetY;
    left.value = offsetX;
    const target = mouse2nodeIndex(offsetX, offsetY);
    if (selectionStore.locked) {
        if (!target) {
            return;
        }
        else if (!isHighlight(target)) {
            selectionStore.hovered = null;
        }
        else {
            selectionStore.hovered = target;
        }
        return;
    }
    else {
        selectionStore.hovered = target;
    }
    if (!target) {
        clearSelection();
        return;
    }
    showEdges.value = connTable[target.id].map(e => {
        const { index, source, target } = e;
        const edge = edges.value[index];
        let res = null;
        if (edge.source.id == source) {
            res = edge;
        }
        else {
            res = {
                ...edge,
                source: edge.target,
                target: edge.source,
            }
        }
        return res;
    }).filter(edge =>
        edge.source != edge.target
    );
    const highlightTarget = [target, ...showEdges.value.map(e => e.target)]
    highlight(highlightTarget);
}

// 实现点击效果
// const locked = ref(null);
function onMouseDown(e) {

}

function onMouseUp(e) {
    if (panning.value) {
        panning.value = false;
        return;
    }
    const { offsetX, offsetY } = e;
    const target = mouse2nodeIndex(offsetX, offsetY);
    if (!target || (selectionStore.locked && target != selectionStore.locked)) {
        selectionStore.locked = false;
        clearSelection();
        return;
    }
    else {
        selectionStore.locked = target;
    }
}

// 标签
const labels = computed(() => {
    const target = [selectionStore.locked, selectionStore.hovered];
    return target.filter(e => e != null);
})
</script>