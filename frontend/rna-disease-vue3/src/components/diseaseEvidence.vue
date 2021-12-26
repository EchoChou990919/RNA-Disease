<template>
    <div v-if="lncRNADisease">
        <div class="font-bold">lncRNADisease</div>
        <n-table>
            <thead></thead>
            <tbody>
                <tr>
                    <th>lncRNA</th>
                    <td>{{ lncRNA }}</td>
                </tr>
                <tr>
                    <th>Disease</th>
                    <td>{{ disease }}</td>
                </tr>
                <tr>
                    <th>Sample</th>
                    <td>{{ lncRNADisease.sample }}</td>
                </tr>
                <tr>
                    <th>dysfunction pattern</th>
                    <td>{{ lncRNADisease["dysfunction pattern"] }}</td>
                </tr>
                <tr>
                    <th>validated method</th>
                    <td>{{ lncRNADisease["validated method"].join(", ") }}</td>
                </tr>
                <tr>
                    <th>discription</th>
                    <td>{{ lncRNADisease["discription"] }}</td>
                </tr>
            </tbody>
        </n-table>
    </div>
    <div v-if="lncRNA2Cancer">
        <div class="font-bold">lncRNA2Cancer</div>
        <n-table>
            <thead></thead>
            <tbody>
                <tr>
                    <th>lncRNA</th>
                    <td>{{ lncRNA }}</td>
                </tr>
                <tr>
                    <th>Disease</th>
                    <td>{{ disease }}</td>
                </tr>
                <tr>
                    <th>Sample</th>
                    <td>{{ lncRNA2Cancer.sample }}</td>
                </tr>
                <tr>
                    <th>methods</th>
                    <td>{{ lncRNA2Cancer["methods"] }}</td>
                </tr>
                <tr>
                    <th>regulated</th>
                    <td>{{ lncRNA2Cancer["regulated"] }}</td>
                </tr>
                <tr>
                    <th>function description</th>
                    <td>{{ lncRNA2Cancer["function description"] }}</td>
                </tr>
            </tbody>
        </n-table>
    </div>
</template>

<script setup>
import { lncDisConnMtx } from '@/service/dataloader/diseaseEvidence';
import { computed } from 'vue';
import { NTable } from 'naive-ui';
import _ from "lodash";

const props = defineProps({
    lncRNA: String,
    disease: String,
})


const lncRNADisease = computed(() => {

    return lncDisConnMtx.lncRNADisease[props.lncRNA] ? lncDisConnMtx.lncRNADisease[props.lncRNA][props.disease] : null;
});

const lncRNA2Cancer = computed(() => {

    return lncDisConnMtx.lncRNA2Cancer[props.lncRNA] ? lncDisConnMtx.lncRNA2Cancer[props.lncRNA][props.disease] : null;
});

</script>

<style scoped>
th {
    @apply font-weight-bold;
}
</style>