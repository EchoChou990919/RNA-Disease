<template>
    <div 
        class="absolute w-auto h-auto border-black m-3 border-1 p-1 bg-white text-black bg-opacity-90"
    >
        <n-space vertical justify="center">
            <div class="flex items-center" v-for="item,idx in _.union([i, j])">
                <div class="border-black border-1 m-x-1 w-1rem h-1rem" :style="{ 'background-color': colors[idx] }"></div>
                <div>{{item}}</div>
            </div>
        </n-space>
        <div v-if="similarity">
            Similarity: {{_.round(similarity*100)}}%
        </div>
    </div>
    <dag-vue :colors="colors" :case_i="case_i" :case_j="case_j" :net="subNet" v-bind="$attrs"></dag-vue>
</template>

<script setup>
import dagVue from "./dag.vue";
import { loadInc2Di } from "@/service/dataloader/lnc2Di";
import { loadDiseaseNet, subGraph } from "@/service/dataloader/diseaseNet";
import { connMtx,loadNodeLinks } from "@/service/dataloader/nodelinks";
import { computed } from "vue";
import _ from "lodash";

const props = defineProps({
    i: String,
    j: String,
})

const colors = [ "#5eead4","#f9d04c"];


const diseaseNet = loadDiseaseNet();
const inc2Di = loadInc2Di();
const nodeLinks= loadNodeLinks();
// const connTable=net2connTable(nodeLinks);

const case_i = computed(() => {
    return inc2Di[props.i]||[];
})

const case_j = computed(() => {
    return inc2Di[props.j]||[];
})

const similarity = computed(()=>{
    if(props.i==props.j){
        return null;
    }
    const id_i=nodeLinks.nodes.find(node=>node.name==props.i);
    const id_j=nodeLinks.nodes.find(node=>node.name==props.j);
    // if(id_i==null||id_j==null){
    //     return 0;
    // }
    // const edge=connTable[id_i.id].find(edge=>edge.target==id_j.id)||
    //     connTable[id_j.id].find(edge=>edge.target==id_i.id);
    // return edge?edge.value:0;
    return connMtx[id_i.id][id_j.id].value;
})

const subNet = computed(() => {
    return subGraph(diseaseNet, _.union(case_i.value, case_j.value), {
        id: i => i.doid
    });
})

</script>