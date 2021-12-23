<template>

<div
    class="p-1 rounded border bg-white shadow"
    :style="{
        left:`${x}px`,
        top:`${y}px`,
        position:'absolute',
        ...style
    }"
>
    <slot></slot>
</div>

</template>

<script setup>
defineProps(["x","y","style"]);
</script>