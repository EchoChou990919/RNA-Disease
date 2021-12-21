<template>
<n-icon v-if="isChecked" :color="themeVars.successColor">
    <Checkmark16Filled></Checkmark16Filled>
</n-icon>
<n-icon v-else :color="themeVars.warningColor">
    <question16-filled></question16-filled>
</n-icon>


</template>
<script setup>
import {Checkmark16Filled,Question16Filled} from "@vicons/fluent";
import { useThemeVars } from 'naive-ui';
const themeVars = useThemeVars();
defineProps({
    isChecked:Boolean,
})

</script>