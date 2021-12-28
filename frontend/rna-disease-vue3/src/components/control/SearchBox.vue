<template>
    <n-space vertical justify="center" class="h-1/1">
        <n-auto-complete :options="options" :disabled="disabled" v-model:value="value" placeholder="">
            <template #suffix>
                <n-icon>
                    <Search12Filled />
                </n-icon>
            </template>
        </n-auto-complete>
    </n-space>
</template>

<script setup>
import { Search12Filled } from "@vicons/fluent"
import { NInput } from "naive-ui";
import { NAutoComplete } from "naive-ui";
import { ref ,computed,watchEffect} from "vue";
import _ from "lodash";
import * as nodelink from '@/service/dataloader/nodelinks';
import { SelectionStore } from "@/store/selection";
const selectionStore = SelectionStore();
const value = ref("");
const disabled=ref(false);

const nodes=nodelink.loadNodeLinks().nodes;//Array
const options=computed(()=>{
    var result=nodes.filter(n=>_.startsWith(n.name,value.value)).map(n=>{
        return {
            value:n.name,
            label:n.name
        }
    })
    return result;
})
watchEffect(()=>{
    var result=nodelink.loadNodeLinks().nodes.filter(n=>n.name==value.value)
    if(result.length!=0) selectionStore.locked=result;
    console.log(result);
})
</script>