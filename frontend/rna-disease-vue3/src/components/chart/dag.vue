<template>
    <tooltip-vue v-if="tooltip" :x="tooltip.x" :y="tooltip.y" class="text-black">
        <n-space vertical>
            <div class="font-bold text-green-600">{{ tooltip.name }}</div>
            <div>{{ names[tooltip.name] }}</div>
        </n-space>
    </tooltip-vue>
    <svg
        :width="width"
        :height="height"
        :viewBox="`${min_x} ${min_y} ${width} ${height}`"
        ref="el"
        :class="class"
        v-bind="$attrs"
    >
        <mask
            :x="min_x - outline_r"
            :y="min_y - outline_r"
            :width="width + 2 * outline_r"
            :height="height + 2 * outline_r"
            v-for="group,idx in groups"
            :id="`particalEdges${idx}`"
        >
            <link-vertical-vue
                v-for="link in group.particalEdges"
                v-bind="link"
                stroke-linecap="round"
                :stroke-width="2 * outline_r"
                stroke="#fff"
            />
            <circle
                v-for="point in group.points"
                :cx="point.x"
                :cy="point.y"
                :r="outline_r"
                fill="#fff"
            />
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
            <path
                d="M6.23 20.23L8 22l10-10L8 2L6.23 3.77L14.46 12z"
                :fill="stroke_color"
                :opacity="stroke_opacity"
            />
        </marker>

        <g v-for="group,idx in groups" class="mix-blend-multiply">
            <link-vertical-vue
                v-for="link in group.particalEdges"
                v-bind="link"
                stroke-linecap="round"
                :stroke-width="2 * outline_r"
                :stroke="colors[idx]"
                fill="none"
            />
            <circle
                v-for="point in group.points"
                :cx="point.x"
                :cy="point.y"
                :r="outline_r"
                :fill="colors[idx]"
            />
        </g>
        <link-vertical-vue
            v-for="link in dag_links"
            v-bind="link"
            fill="none"
            :stroke="stroke_color"
            :stroke-width="0.5"
            :opacity="stroke_opacity"
            marker-end="url(#arrow)"
        />
        <pie-vue
            v-for="point in dag_points"
            :data="[1, 1]"
            :colors="color(point)"
            :x="point.x"
            :y="point.y"
            :inner-radius="0"
            :outer-radius="r"
            @mouseenter="onMouseenter(point)"
            @mouseleave="onMouseleave"
        />
        <circle
            v-for="point in dag_points"
            :cx="point.x"
            :cy="point.y"
            :r="r"
            :stroke="stroke_color"
            :opacity="stroke_opacity"
            :stroke-width="0.5"
            fill="none"
        />
    </svg>
</template>

<script setup>
import * as d3 from "d3";
import linkVerticalVue from "./shapes/linkVertical.vue";
import tooltipVue from "./shapes/tooltip.vue";
import pieVue from "./pie.vue";


import _ from "lodash";
import { computed, reactive, ref, watch } from "vue";
import { loadCase } from "@/service/dataloader/dag";
import { loadDiseaseAttrs, doid2name } from "@/service/dataloader/diseaseDetail";
import { dagLayout, pack, filterNode2edges } from "@/utils/dagLayout";
import { useZoom, offset2svg, svg2offset } from "@/utils/zoom";

import { SelectionStore } from "@/store/selection";

const selectionStore = SelectionStore();

// defineProps(["class"])
const el = ref(null);
const { transform } = useZoom(el);

const detail = loadDiseaseAttrs();
const names = doid2name(detail.diseases);

const width = 200;
const height = 200;
const min_x = -width / 2;
const min_y = -height / 2;
// const colors = ["#f9d04c", "#5eead4"];
const other_color = "#aaa";
const node_r = 5;
const margin = 100;

// const { case_i, case_j, nodes, edges } = caseData;
// const case_i = computed(() => selectionStore.case_i);
// const case_j = computed(() => selectionStore.case_j);
// const net = computed(() => selectionStore.subNet || { nodes: [], edges: [] });

const props = defineProps({
    case_i: {},
    case_j: {},
    net: {
        default: {
            nodes: [],
            edges: []
        }
    },
    class: {},
    colors:Array
})
// const props=defineProps(["case_i", "case_j", "net","class"]);
const case_i = computed(() => props.case_i);
const case_j = computed(() => props.case_j);
const net = computed(() => props.net);

const nodes = computed(() => net.value.nodes);
const edges = computed(() => net.value.edges);

const isLargeGraph = computed(() => nodes.value.length > 50);

const stroke_color = computed(() => {
    if (isLargeGraph.value) return "#000";
    else return "#000"
});
const stroke_opacity = computed(() => {
    if (isLargeGraph.value) return 0.2;
    else return 1
});


const layout = computed(() => dagLayout(nodes.value, edges.value,
    {
        id: item => item.doid,
        graph_opts: {
            rankdir: "BT",
            marginx: margin,
            marginy: margin,
            nodesep: 20
        },
        node_opts: {
            width: node_r * 2,
            height: node_r * 2,
        }
    }
));

const x = computed(() => {
    const out_graph = layout.value.graph;
    return d3.scaleLinear().domain([0, out_graph.width]).range([min_x, min_x + width]);
})
const y = computed(() => {
    const out_graph = layout.value.graph;
    return d3.scaleLinear().domain([0, out_graph.height]).range([min_y, min_y + height]);
})

const r = computed(() => {
    return x.value(node_r) - x.value(0);
})

const outline_r = computed(() => {
    let r = node_r * 2;
    if (isLargeGraph.value) r = r * 3;
    return x.value(r) - x.value(0);
});

const outline_opacity = computed(() => {
    // if (isLargeGraph.value) return 0.5;
    // else return 0.5
    return 1
});


const dag_points = computed(() => {
    const dag_raw_points = layout.value.nodes;
    return dag_raw_points.map(v => {
        return {
            x: x.value(v.x),
            y: y.value(v.y),
            name: v.doid
        };
    });
})

const dag_links = computed(() => {
    return edges.value.map(edge => {
        const { source, target } = edge;
        const source_node = dag_points.value.find(point => point.name == source);
        const target_node = dag_points.value.find(point => point.name == target);
        return {
            source: [source_node.x, source_node.y - r.value],
            target: [target_node.x, target_node.y + r.value],
            v: source,
            w: target
        };
    })

})


const groups = computed(() => {
    return _.union([case_i.value, case_j.value]).map(case_item => {
        const points = dag_points.value.filter(point => case_item.find(j => j == point.name));
        // pack(points);
        const particalEdges = filterNode2edges(points, dag_links.value, {
            id: i => i.name,
            edge_source: i => i.v,
            edge_target: i => i.w
        });
        return {
            points,
            particalEdges
        };
    })
})

function color(node) {
    const in_case_i = case_i.value.find(i => i == node.name);
    const in_case_j = case_j.value.find(i => i == node.name);
    if (case_i.value == case_j.value) {
        return in_case_i ? () => props.colors[0] : () => other_color;
    }

    if (in_case_i && in_case_j) {
        return (_, __, idx) => props.colors[idx];
    }
    else if (in_case_j) {
        return () => props.colors[1];
    }
    else if (in_case_i) {
        return () => props.colors[0];
    }
    else {
        return () => other_color;
    }
}

const tooltip = ref(null);
function onMouseenter(node) {
    let { x, y } = svg2offset(node.x, node.y, transform);
    tooltip.value = {
        ...node,
        x,
        y,
    };
}

function onMouseleave() {
    tooltip.value = null;
}
</script>