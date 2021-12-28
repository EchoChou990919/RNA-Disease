<template>
    <svg viewBox="-100 -100 200 200" :x="x-outerRadius" :y="y-outerRadius" :width="2*outerRadius" :height="2*outerRadius">
        <arc-vue
            v-for="(arc,idx) in arcs"
            v-bind="arc"
            :inner-radius="100*innerRadius/outerRadius"
            :outer-radius="100"
            :fill="arc.color"
        />
    </svg>
</template>

<script setup>
import * as d3 from "d3";
import { computed } from "vue";
import arcVue from "./shapes/arc.vue";

const props = defineProps({
    data: Array,
    value: {
        type: Function,
        default: d => d
    },
    colors: {
        default: ()=>function (data, value, idx) {
            return d3.schemeCategory10[idx];
        }
    },
    x: [Number, String],
    y: [Number, String],
    tag: {
        type: String,
        default: "svg"
    },
    innerRadius: {
        type: [Number, String],
        default: 0
    },
    outerRadius: {
        type: [Number, String],
        default: 50
    },
});
const arcs = computed(() => {
    const res = d3.pie().value(props.value)(props.data).map((d, idx) => {
        let color = props.colors;
        if (props.colors instanceof Array) {
            color = idx => props.colors[idx];
        }
        return {
            ...d,
            color: color(props.data, d.value, idx)
        }
    });
    return res;
})
</script>