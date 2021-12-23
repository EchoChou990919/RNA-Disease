<template>

<path
    :d="line"
    v-bind="$attrs"
></path>

</template>
<script setup>
import * as d3 from "d3";
import { computed } from "vue";
const props=defineProps({
    curveType:{
        type:Function,
        default:d3.curveBasis
    },
    points:Array
})
const line=computed(()=>{
    const {points,curveType}=props;
    return d3.line()
        .curve(curveType)
        (points);
});
</script>