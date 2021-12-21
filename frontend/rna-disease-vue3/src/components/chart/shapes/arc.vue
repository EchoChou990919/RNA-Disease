<template>
    <path 
        :d="arc" 
        :fill="fill"
        :stroke="stroke"
        :stroke-width="strokeWidth"
    ></path>
</template>

<script setup>

import * as d3 from "d3";
import { computed, defineProps } from "vue";

const props = defineProps({
    innerRadius: Number,
    outerRadius: Number,
    startAngle: Number,
    endAngle: Number,
    fill:String,
    stroke:String,
    strokeWidth:Number,
    cornerRadius:Number,
});
const arc=computed(()=>{
    return d3.arc()
    .cornerRadius(props.cornerRadius)({
        ...props
    });
})


</script>