<template>
<!-- <div class="animate__animated animate__bounce animate__infinite	">animate__animated animate__bounce</div> -->
    <transition-group name="tooltip">
        <tooltip-vue
            v-for="node in labels"
            :show-line="true"
            :key="node.id"
            :x="d3position2offset(node.x, node.y).x"
            :y="d3position2offset(node.x, node.y).y"
            :style="{
                color: colors[node.category]
            }"
            :offset-x="10"
            :offset-y="1"
            :drag="node.locked"
            @pan_begin="panning = true; onClick(node)"
            @pan_end="panning = false"
            @mouseenter="onMouseLeave"
            class="transition-all"
        >
            <template #header>
                <n-space justify="space-between">
                    <n-space>
                        <perdict-glyph-vue
                            v-if="showGlyph(node)"
                            :x="x(node.x || 0)"
                            :y="y(node.y || 0)"
                            :size="300"
                            :perdict_value="connMtx[selectionStore.locked[0].id][node.id].value || 0"
                            :perdict_label="connMtx[selectionStore.locked[0].id][node.id].value >= 0.5 ? 1 : 0"
                            :truth_label="connMtx[selectionStore.locked[0].id][node.id].type == 2 ? 0 : 1"
                            :palette="{
                                0: 'blue',
                                1: 'red',
                            }"
                            :label_opacity="0.5"
                        />
                        <pie-vue
                            v-if="node.category == 0"
                            :data="[connTable[node.id].filter(e=>e.type==1).length, connTable[node.id].filter(e=>e.type==2).length, connTable[node.id].filter(e=>e.type==3).length]"
                            :colors="(a,b,index)=>{
                                return {
                                    0: 'green',
                                    1: 'blue',
                                    2: 'red',
                                }[index]
                            }"
                            :inner-radius="0"
                            :outer-radius="Math.sqrt(300)/2"
                            :x="x(node.x || 0)"
                            :y="y(node.y || 0)"
                        />
                        <div>{{ node.name }}</div>
                        <div v-if="node.category == 1">({{ names[node.name] }})</div>
                    </n-space>
                    <n-button text v-if="node.locked" @click="removeLock(node)">
                        <n-icon>
                            <dismiss></dismiss>
                        </n-icon>
                    </n-button>
                </n-space>
            </template>
            <n-space vertical>
                <transition
                    enter-from-class="transform scale-y-0 opacity-0"
                    enter-to-class="opacity-100"
                    leave-from-class="opacity-100"
                    leave-to-class="transform scale-y-0 opacity-0"
                    enter-active-class="transition-all duration-200 ease-in-out"
                    leave-active-class="transition-all duration-200 ease-in-out"
                >
                    <div v-if="node.locked || node.showEvidence">
                        <div v-if="node.showDAG" class="tooltip-dag">
                            <disease-similarity-vue
                                v-if="selectionStore.locked[0].category == 0 && node.category == 0"
                                :i="selectionStore.locked[0].name"
                                :j="node.name"
                                class="w-1/1 h-1/1"
                            ></disease-similarity-vue>
                        </div>

                        <div v-if="node.showEvidence" class="tooltip-detail overflow-auto">
                            <connect-vue
                                :lncRNA_id="selectionStore.locked[0].id"
                                :disease_id="node.id"
                            ></connect-vue>
                            <disease-evidence-vue
                                :lncRNA="selectionStore.locked[0].name"
                                :disease="names[node.name]"
                            ></disease-evidence-vue>
                        </div>
                    </div>
                </transition>
            </n-space>
        </tooltip-vue>
    </transition-group>

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
                v-for="edge in showEdgesNew"
                :stroke-width="(edge.type == 0 ? 2 : 2) / transform.k"
                :key="edge.source.id + '-' + edge.target.id"
                :x1="x(edge.source.x)"
                :y1="y(edge.source.y)"
                :x2="x(edge.target.x)"
                :y2="y(edge.target.y)"
                :opacity="edge.value * 0.5"
                :stroke="edgeColor(edge) || colors[edge.target.category]"
                :stroke-dasharray="
                    edge.source_type == edge.target_type ? '1' : 'none'
                "
            />
            <g v-if="renderDone" v-for="(node,index) in nodes" :key="node.id">
                <perdict-glyph-vue
                    v-if="showGlyph(node)"
                    :x="x(node.x || 0)"
                    :y="y(node.y || 0)"
                    :size="(2 + node.degree / 12) / transform.k"
                    :perdict_value="connMtx[selectionStore.locked[0].id][node.id].value || 0"
                    :perdict_label="connMtx[selectionStore.locked[0].id][node.id].value >= 0.5 ? 1 : 0"
                    :truth_label="connMtx[selectionStore.locked[0].id][node.id].type == 2 ? 0 : 1"
                    :palette="{
                        0: 'blue',
                        1: 'red',
                    }"
                    :label_opacity="0.5"
                    :class="{
                        'animate__animated animate__flash animate__infinite':hasEvidence(node)
                    }"
                />
                <symbol-vue
                    v-else
                    :x="x(node.x || 0)"
                    :y="y(node.y || 0)"
                    :size="(2 + node.degree / 12) / transform.k"
                    :fill="colors[node.category]"
                    :symbol="symbols[node.category]"
                    :opacity="node.highlight == nodeHighlightToken ? 1 : 0.1"
                />
            </g>
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
import { NDivider, NIcon } from "naive-ui";
import { ref, reactive, onMounted, computed, watch, watchEffect, nextTick } from "vue";
import dagVue from "./dag.vue";

import { Dismiss16Filled as Dismiss } from "@vicons/fluent";

import symbolVue from "./shapes/symbol.vue";
import tooltipVue from "./shapes/tooltip.vue";
import diseaseSimilarityVue from "./diseaseSimilarity.vue";
import linkHorizontalVue from "./shapes/linkHorizontal.vue";
import connectVue from "./connect.vue";
import diseaseEvidenceVue from "../diseaseEvidence.vue";
import perdictGlyphVue from "./shapes/perdictGlyph.vue";
import pieVue from "./pie.vue";

import { SelectionStore } from "@/store/selection";
import { loadNodeLinks, net2connTable, connMtx } from "@/service/dataloader/nodelinks";
import { lncDisConnMtx } from '@/service/dataloader/diseaseEvidence';

import { loadDiseaseNet, subGraph } from "@/service/dataloader/diseaseNet";
import { loadInc2Di } from "@/service/dataloader/lnc2Di";
import { loadDiseaseAttrs, doid2name } from "@/service/dataloader/diseaseDetail";
import ForceWorker from "@/service/worker/force.worker?worker";
import { useZoom, offset2svg, svg2offset } from "@/utils/zoom";

import 'animate.css';

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
const nodeLinks = loadNodeLinks();
const connTable = net2connTable(nodeLinks);
const detail = loadDiseaseAttrs();
const names = doid2name(detail.diseases);

const nodes = ref(nodeLinks.nodes); //节点
const edges = ref(nodeLinks.edges); //边
const paths = ref([]);              //密度图

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
    alphaMin: 0.1,
});
forceWorker.onmessage = (e) => {
    switch (e.data.type) {
        case "tick":
            paths.value = e.data.contours;
            break;
        case "end":
            nodes.value = e.data.nodes;
            nodeLinks.nodes = e.data.nodes;
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
function highlight(nodes, clear = true) {
    if (clear) nodeHighlightToken.value++;
    nodes.forEach(node => {
        node.highlight = nodeHighlightToken.value;
    });
}

function isHighlight(node) {
    return node.highlight == nodeHighlightToken.value;
}

function clearSelection() {
    selectionStore.locked = [];
    selectionStore.hovered = null;
    // highlight(nodes.value);
    // showEdges.value = [];
    // highlight(nodes.value);
    selectionStore.case_i = null;
    selectionStore.case_j = null;
    selectionStore.subNet = null;
}

function mouse2nodeIndex(offsetX, offsetY, d_threshold = 70) {
    const { x, y } = offset2svg(offsetX, offsetY, transform);
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
    return svg2offset(x(target_x), y(target_y), transform);
}


function onMouseMove(e) {
    if (panning.value) {
        return;
    }
    const { offsetX, offsetY } = e;
    const target = mouse2nodeIndex(offsetX, offsetY);
    if (target) {
        onMouseEnter(target);
    }
    else {
        onMouseLeave();
    }
}

function onMouseEnter(node) {
    if (selectionStore.locked.length > 0) {
        if (isHighlight(node)) {
            selectionStore.hovered = node;
        }
        else {
            selectionStore.hovered = null;
        }
        return;
    }
    selectionStore.hovered = node;

}

function onMouseLeave() {
    selectionStore.hovered = null;
}

function onClick(node) {
    if (node == null) {
        clearSelection();
        return;
    }
    else {
        if (_.find(selectionStore.locked, n => n.id == node.id)) {
            return;
        }
        if (!isHighlight(node)) {
            return;
        }
        selectionStore.locked.push(node);
        // highlight([...selectionStore.locked, selectionStore.hovered, ...showEdgesNew.value.map(e => e.target)]);
    }
}

const showEdgesNew = computed(() => {

    const showNodes = _([...selectionStore.locked, selectionStore.hovered]).filter(n => n != null).uniqBy("id").value();

    if (showNodes.length == 0) {
        return [];
    }

    function processEdge(node) {
        return e => {
            const { index, source, target } = e;
            const edge = edges.value[index];
            if (node == edge.source) {
                return edge;
            }
            else {
                return {
                    ...edge,
                    source: edge.target,
                    target: edge.source,
                }
            }
        }
    }

    const firstNode = showNodes[0];
    const otherNodes = showNodes.slice(1);
    const otherNode_set = new Set(otherNodes.map(n => n.id));
    const firstEdges = connTable[firstNode.id]
        .map(processEdge(firstNode))
        .filter(e => e.source != e.target);
    const firstMidNodes = new Set(firstEdges.filter(e => e.type == 0).map(e => e.target.id));
    const otherEdges = otherNodes
        .map(n => connTable[n.id]
            .map(processEdge(n))
            .filter(e => firstMidNodes.has(e.target.id) && e.type == 0)
        )
        .flat();
    // console.log(otherNodes, firstMidNodes, otherEdges);
    const otherMidNodes = new Set(otherEdges.map(e => e.target.id));
    const midNodes = new Set(_.intersection([...firstMidNodes], [...otherMidNodes]));
    const firstEdgesMid = otherNodes.length > 0 ? firstEdges.filter(e => midNodes.has(e.target.id)) : firstEdges;
    const directEdges = firstEdges.filter(e => otherNode_set.has(e.target.id));
    return _.union([...directEdges, ...firstEdgesMid, ...otherEdges].filter(e => e.source != e.target));
});

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
    onClick(target);
}

// 标签
const labels = computed(() => {
    // const lockedTarget = selectionStore.locked;
    let DAGSource = null;
    if (selectionStore.locked.length > 0) DAGSource = selectionStore.locked[0];
    const target = [...selectionStore.locked.map(node => ({
        ...node,
        locked: true
    })),
    selectionStore.hovered ? {
        ...selectionStore.hovered,
        locked: false
    } : null];
    return _.unionBy(target.filter(e => e != null).map(node => {
        return {
            showDAG: node.category == 0 && DAGSource && DAGSource.category == 0,
            showEvidence: node.category == 1 && DAGSource && DAGSource.category == 0,
            ...node,

        }
    }), node => node.name);
})


function removeLock(node) {
    selectionStore.locked = selectionStore.locked.filter(e => e.id != node.id);
    if (selectionStore.locked.length == 0) {
        clearSelection();
    }
    highlight([...selectionStore.locked, selectionStore.hovered, ...showEdgesNew.value.map(e => e.target)].filter(e => e != null));
}

function edgeColor(edge) {
    if (!edge.type) {
        return null;
    }
    else {
        return "#5e3c99";
    }
}


function showGlyph(node) {
    return node.category == 1 && showGlyph && isHighlight(node) && selectionStore.locked.length >= 1 && selectionStore.locked[0].category == 0 && connMtx[selectionStore.locked[0].id][node.id] && connMtx[selectionStore.locked[0].id][node.id].type != 0;

}

function hasEvidence(node) {
    return lncDisConnMtx.lncRNADisease[selectionStore.locked[0].name] && lncDisConnMtx.lncRNADisease[selectionStore.locked[0].name][names[node.name]] != null || lncDisConnMtx.lncRNA2Cancer[selectionStore.locked[0].name] && lncDisConnMtx.lncRNA2Cancer[selectionStore.locked[0].name][names[node.name]] != null
}

watchEffect(() => {
    if (selectionStore.locked.length == 0 && selectionStore.hovered == null) {
        highlight(nodes.value);
    }
    else {
        highlight([...selectionStore.locked, selectionStore.hovered, ...showEdgesNew.value.map(e => e.target)].filter(e => e != null));
    }
})
</script>

<style scoped>
.tooltip-dag {
    /* @apply 2xl:(max-w-lg max-h-lg) max-w-[10rem] max-h-[10rem]; */
    @apply 2xl:(w-lg h-lg) w-[10rem] h-[10rem];
}
.tooltip-detail {
    @apply 2xl:(max-w-lg max-h-lg) max-w-[10rem] max-h-[10rem];
}

.tooltip-enter-from,
.tooltip-leave-to {
    @apply opacity-10;
}

.tooltip-enter-active,
.tooltip-leave-active {
    @apply transition duration-100;
}
</style>