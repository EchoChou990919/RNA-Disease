<template>
    <svg
        :x="x - Math.sqrt(size) / 2"
        :y="y - Math.sqrt(size) / 2"
        :width="Math.sqrt(size)"
        :height="Math.sqrt(size)"
        viewBox="0 0 100 100"
        v-bind="$attrs"
    >
        <rect
            x="0" y="0" width="100" height="100"
            :fill="palette[truth_label]"
            :opacity="label_opacity"
            :stroke="palette[truth_label]"
            :stroke-width="10"
            style="isolation: isolate;"
        />
        <rect 
            :x="(100*(1-perdict_value))/2"
            :y="(100*(1-perdict_value))/2"
            :width="100*perdict_value/2"
            :height="100*perdict_value"
            :fill="palette[perdict_label]"
        />
        <!-- <rect x="0" y="0" width="50" height="100" fill="red"></rect>
        <rect x="50" y="0" width="50" height="100" fill="blue"></rect>-->
    </svg>
</template>

<script setup>
import * as d3 from "d3";
defineProps({
    x: Number,
    y: Number,
    size: Number,
    fill: String,
    perdict_value: Number,
    perdict_label: Number,
    truth_label: Number,
    palette: Object,
    label_opacity: Number,
})
</script>