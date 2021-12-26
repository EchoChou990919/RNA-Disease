<template>

<path :d="path" v-bind="$attrs"></path>

</template>
<script setup>
import * as d3 from "d3";
import {computed} from "vue";
const props=defineProps({
    source:Array,
    target:Array,
})
const path=computed(()=>{
    return d3.linkHorizontal()({
        ...props
    });
})
</script>