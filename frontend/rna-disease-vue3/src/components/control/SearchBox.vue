<template>
<n-space vertical justify="center" class="h-1/1">

    <n-input round placeholder="搜索" class="w-3xl" style="width: 50vw;">
        <template #suffix>
            <n-icon>
                <Search12Filled />
            </n-icon>
        </template>
    </n-input>
    
</n-space>
</template>

<script setup>
import {Search12Filled} from "@vicons/fluent"
import { NInput } from "naive-ui";
</script>