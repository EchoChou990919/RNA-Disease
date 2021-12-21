<template>
    <n-space vertical :item-style="{ width: '100%' }">
        <item-select-vue
            v-for="item in data"
            :key="item.name"
            :name="item.name"
            :score="item.score"
            :is-checked="item.isChecked"
        ></item-select-vue>
    </n-space>
</template>

<script setup>

import ItemSelectVue from './ItemSelect.vue';

const data = [
    {
        name: "DOID:0002116",
        isChecked: true,
        score: 0.941
    },
    {
        name: "DOID:0014667",
        isChecked: false,
        score: 0.832
    },
    {
        name: "DOID:0014667",
        isChecked: false,
        score: 0.832
    }, 
    {
        name: "DOID:0014667",
        isChecked: false,
        score: 0.832
    }
];
const origin = {
    name: "DOID:0001816",
    isChecked: true,
    score: 0.941
}

</script>