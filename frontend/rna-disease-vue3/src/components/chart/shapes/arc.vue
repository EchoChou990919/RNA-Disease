<template>
    <path 
        :d="arc" 
        v-bind="$attrs"
    ></path>
</template>

<script setup>

import * as d3 from "d3";
import { computed, defineProps } from "vue";

const props = defineProps({
    innerRadius: [Number,String],
    outerRadius: [Number,String],
    startAngle: [Number,String],
    endAngle: [Number,String],
    cornerRadius:[Number,String],
});
const arc=computed(()=>{
    return d3.arc()
    .cornerRadius(props.cornerRadius)({
        ...props
    });
})


</script>