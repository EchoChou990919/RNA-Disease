<template>
    <svg width="100" height="100" viewBox="-50 -50 100 100">
        <arc 
            :inner-radius="40" 
            :outer-radius="50" 
            :start-angle="0" 
            :end-angle="Math.PI*100" 
            fill="#ebebeb"
        />
        <arc 
            :inner-radius="40" 
            :outer-radius="50" 
            :start-angle="0" 
            :end-angle="Math.PI*value*2" 
            :corner-radius="5"
            :fill="fill"
        />
        <text text-anchor="middle" dominant-baseline="middle" font-size="20">{{value*100}}%</text>
    </svg>
</template>

<script setup>
import arc from "./shapes/arc.vue"
// const value=0.941;
defineProps({
    value:Number,
    fill:{
        type:String,
        default:"#2080f0"
    },
})

</script>