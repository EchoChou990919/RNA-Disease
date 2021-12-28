<template>
    <n-space vertical justify="center" class="h-1/1">
        <n-auto-complete :options="options" :disabled="disabled" v-model:value="value" placeholder>
            <template #suffix>
                <n-icon v-if="disabled==false">
                    <Search12Filled />
                </n-icon>
                <n-spin v-if="disabled==true" style="height:5px" size="medium" />
                
            </template>
        </n-auto-complete>
    </n-space>
</template>

<script setup>
import { Search12Filled } from "@vicons/fluent"
import { NInput,NSpin } from "naive-ui";
import { NAutoComplete } from "naive-ui";
import { ref, computed, watchEffect } from "vue";
import _ from "lodash";
import * as nodelink from '@/service/dataloader/nodelinks';
import { SelectionStore } from "@/store/selection";
const selectionStore = SelectionStore();
const value = ref("");
const disabled = ref(true);

var myVar = setInterval(() => { if (nodelink.loadNodeLinks().nodes[0].x != null) { disabled.value = false; clearInterval(myVar); } }, 1000);


const nodes = nodelink.loadNodeLinks().nodes;//Array
const options = computed(() => {
    var result = nodes.filter(n => _.startsWith(n.name, value.value)).map(n => {
        return {
            value: n.name,
            label: n.name
        }
    })
    return result;
})
watchEffect(() => {
    var result = nodelink.loadNodeLinks().nodes.filter(n => n.name == value.value)
    if (result.length != 0) selectionStore.locked = result;
    console.log(result);
})
</script>