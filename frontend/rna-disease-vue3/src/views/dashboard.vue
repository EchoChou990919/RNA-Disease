<template>
    <n-layout>
        <n-layout-header bordered>
            <n-space class="m-4 h-1/1" justify="left">
                <div
                    class="text-3xl font-serif font-semibold h-1/1 items-center"
                    style="display: inline-flex;"
                >Connected RNA</div>
                <search-box-vue></search-box-vue>
            </n-space>
        </n-layout-header>
        <n-layout has-sider>
            <n-layout-sider
                class="shadow-lg"
                bordered
                collapse-mode="transform"
                show-trigger="arrow-circle"
                :collapsed="left_slider_collapsed"
                @update:collapsed="left_slider_collapsed = $event"
                content-style="padding: 12px;"
            >
                <div v-show="!left_slider_collapsed">
                    <suspense>
                        <template #default>
                            <left-panel />
                        </template>
                    </suspense>
                </div>
            </n-layout-sider>
            <n-layout has-sider sider-placement="right">
                <n-layout-content>
                    <suspense>
                        <template #default>
                            <graph-vue class="w-1/1 h-1/1"></graph-vue>
                        </template>
                        <template #fallback>
                            <n-spin></n-spin>
                        </template>
                    </suspense>
                </n-layout-content>
                <n-layout-sider
                    class="shadow-lg"
                    collapse-mode="transform"
                    show-trigger="arrow-circle"
                    :collapsed="right_slider_collapsed"
                    @update:collapsed="right_slider_collapsed = $event"
                    bordered
                    width="500"
                >
                    <div v-show="!right_slider_collapsed">
                    <suspense>
                        <template #default>
                            <Dag class="w-1/1 h-1/1"></Dag>
                        </template>
                    </suspense>
                    </div>
                </n-layout-sider>
            </n-layout>
        </n-layout>
        <!-- <n-layout-footer>成府路</n-layout-footer> -->
    </n-layout>
</template>

<script setup>
import { NLayout, NLayoutSider, NLayoutContent, NLayoutFooter, NLayoutHeader, NSpin } from 'naive-ui';
import { ref } from "vue";

import SearchBoxVue from '../components/control/SearchBox.vue';
import LeftPanel from "../components/control/selectPanel/panel.vue";
import graphVue from '../components/chart/graph.vue';
// import DAGVue from '../components/chart/dag.vue';
import Dag from '../components/chart/dag.vue';

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