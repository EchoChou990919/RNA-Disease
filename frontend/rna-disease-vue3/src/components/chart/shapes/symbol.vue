<template>
    <path
        :transform="`translate(${x},${y})`"
        :d="d3.symbol(symbol,size)()"
        :fill="fill"
        v-bind="$attrs"
    ></path>
</template>

<script setup>
import * as d3 from "d3";
const props = defineProps({
    x: Number,
    y: Number,
    symbol: Object,
    size: Number,
    fill: String,
})

</script>