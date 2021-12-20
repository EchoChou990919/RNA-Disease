<template>
    <n-card>
        <template #header>
            <slot name="header"></slot>
        </template>
        <template #header-extra>
            <perdict-result-vue :is-checked="isChecked"></perdict-result-vue>
        </template>
    </n-card>
</template>

<script setup>
import perdictResultVue from './perdictResult.vue';
const props = defineProps({
    isChecked: Boolean,
})

</script>