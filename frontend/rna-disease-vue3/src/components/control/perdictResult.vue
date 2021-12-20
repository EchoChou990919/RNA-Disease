<template>
<n-icon v-if="isChecked">
    <Checkmark16Filled></Checkmark16Filled>
</n-icon>
<n-icon v-else>
    <question16-filled></question16-filled>
</n-icon>


</template>
<script setup>
import {Checkmark16Filled,Question16Filled} from "@vicons/fluent"
defineProps({
    isChecked:Boolean,
})

</script>