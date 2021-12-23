<template>
    <component 
        :is="tag" 
        :viewBox="viewBox"
        :transform="transform"
        v-bind="$attrs"
    >
        <arc-vue
            v-for="(arc,idx) in arcs"
            v-bind="arc"
            :inner-radius="innerRadius"
            :outer-radius="outerRadius"
            :fill="arc.color"
        />
    </component>
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
        default: function (data, value, idx) {
            return d3.schemeCategory10[idx];
        }
    },
    x: [Number, String],
    y: [Number, String],
    tag: {
        type: String,
        default: "svg"
    },
    innerRadius:{
        type:[Number, String],
        default:0
    },
    outerRadius:{
        type:[Number, String],
        default:50
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
const viewBox=computed(()=>{
    return props.tag=='svg'?'-50 -50 100 100':null;
})

const transform=computed(()=>{
    return props.tag=='svg'?null:`translate(${props.x},${props.y})`;
})
</script>