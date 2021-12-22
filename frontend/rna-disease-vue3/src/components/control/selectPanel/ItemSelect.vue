<template>
    <n-card hoverable>
        <template #header>
            {{ name }}
            <slot name="header"></slot>
        </template>
        <template #header-extra>
            <perdict-result-vue :is-checked="isChecked"></perdict-result-vue>
        </template>
        <n-space>
            <progress-vue :value="score" class="w-15 h-15" :fill="progress_color"></progress-vue>
            <n-space vertical class="h-1/1" justify="center">
                <div>{{ id }}</div>
            </n-space>
        </n-space>
    </n-card>
</template>

<script setup>

import { useThemeVars } from 'naive-ui';
import progressVue from '@/components/chart/progress.vue';

import perdictResultVue from './perdictResult.vue';
import { computed } from 'vue';

const themeVars = useThemeVars();
const props = defineProps({
    isChecked: Boolean,
    id: String,
    name: String,
    score: Number,
})
const progress_color=computed(()=>{
    if(props.score>0.9){
        return themeVars.value.successColor;
    }
    else if(props.score>0.8){
        return themeVars.value.warningColor;
    }
    else{
        return themeVars.value.errorColor;
    }
})

</script>