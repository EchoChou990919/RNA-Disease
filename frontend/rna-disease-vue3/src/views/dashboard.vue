<template>
    <n-layout>
        <n-layout-header bordered>
            <n-space class="m-4 h-1/1" justify="space-between">
                <div
                    class="text-3xl font-serif font-semibold h-1/1 items-center"
                    style="display: inline-flex;"
                >Connected RNA</div>
                <search-box-vue></search-box-vue>
                <div>Test</div>
            </n-space>
        </n-layout-header>
        <n-layout has-sider>
            <n-layout-sider
                bordered
                collapse-mode="transform"
                show-trigger="arrow-circle"
                :collapsed="left_slider_collapsed"
                @update:collapsed="left_slider_collapsed = $event"
                content-style="padding: 12px;"
            >
                <div v-show="!left_slider_collapsed">
                    <left-panel></left-panel>
                </div>
            </n-layout-sider>
            <n-layout has-sider sider-placement="right">
                <n-layout-content>
                    平山道
                    <progress-vue></progress-vue>
                </n-layout-content>
                <n-layout-sider
                    class="bg-blue-300"
                    collapse-mode="transform"
                    show-trigger="arrow-circle"
                    :collapsed="right_slider_collapsed"
                    @update:collapsed="right_slider_collapsed = $event"
                >
                    <div v-show="!right_slider_collapsed">右侧栏</div>
                </n-layout-sider>
            </n-layout>
        </n-layout>
        <!-- <n-layout-footer>成府路</n-layout-footer> -->
    </n-layout>
</template>

<script setup>
import { NLayout, NLayoutSider, NLayoutContent, NLayoutFooter, NLayoutHeader } from 'naive-ui';
import { ref } from "vue";

import SearchBoxVue from '../components/control/SearchBox.vue';
import LeftPanel from "../components/control/selectPanel/panel.vue";
import progressVue from '../components/chart/progress.vue';

const header_height = "64px";
const left_slider_collapsed = ref(false);
const right_slider_collapsed = ref(false);

</script>

<style>
.n-layout-header {
    height: v-bind(header_height);
}

.n-layout-content {
    height: calc(100vh - v-bind(header_height));
}
</style>