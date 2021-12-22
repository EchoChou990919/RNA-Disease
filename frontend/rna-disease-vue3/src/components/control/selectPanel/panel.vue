<template>
    <n-space vertical :item-style="{ width: '100%' }">
        <item-select-vue
            v-for="item in data"
            :key="item.name"
            v-bind="item"
        ></item-select-vue>
    </n-space>
</template>

<script setup>
import {computed} from 'vue';

import ItemSelectVue from './ItemSelect.vue';
import { SelectionStore } from '@/store/selection';
import {loadNodeLinks,net2connTable} from "@/service/dataloader/nodelinks";

const store=SelectionStore();

const nodelinks=await loadNodeLinks();
const connTable=net2connTable(nodelinks);

const data=computed(()=>{
    if(store.locked==null){
        return [];
    }
    return connTable[store.locked.id].map(item=>nodelinks.nodes.find(d=>d.id==item.target));
})

// const data = [
//     {
//         id: "DOID:0002116",
//         isChecked: true,
//         score: 0.941,
//         name:"neonatal diabetes"
//     },
//     {
//         id: "DOID:0014667",
//         isChecked: false,
//         score: 0.832,
//         name:"diabetes mellitus"
//     },
//     {
//         id: "DOID:0014667",
//         isChecked: false,
//         score: 0.832,
//         name:"diabetes mellitus"
//     }, 
//     {
//         id: "DOID:0014667",
//         isChecked: false,
//         score: 0.832,
//         name:"diabetes mellitus"
//     }
// ];

const origin = {
    name: "DOID:0001816",
    isChecked: true,
    score: 0.941
}

</script>