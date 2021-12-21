<template>
    <n-card hoverable>
        <template #header>
            <slot name="header"></slot>
        </template>
        <template #header-extra>
            <perdict-result-vue :is-checked="isChecked"></perdict-result-vue>
        </template>
        <n-space>
            <div>
            <!-- <n-progress class="w-1" :percentage="score*100" type="circle"></n-progress> -->
            <progress-vue :value="score" class="w-10 h-10"></progress-vue>
            </div>
            <div>
                {{name}}
            </div>
        </n-space>
    </n-card>
</template>

<script setup>
import { NProgress } from 'naive-ui';
import progressVue from '@/components/chart/progress.vue';

import perdictResultVue from './perdictResult.vue';
const props = defineProps({
    isChecked: Boolean,
    name:String,
    score:Number,
})

</script>