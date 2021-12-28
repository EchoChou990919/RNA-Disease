<template>
    <n-layout>
        <n-layout-header bordered>
            <n-space class="m-4 h-1/1" justify="space-between">
                <div
                    class="text-3xl font-serif font-semibold h-1/1 items-center"
                    style="display: inline-flex;"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 448 512"
                        height="2rem"
                        class="m-x-4"
                    >
                        <path
                            d="M.1 494.1c-1.1 9.5 6.3 17.8 15.9 17.8l32.3.1c8.1 0 14.9-5.9 16-13.9c.7-4.9 1.8-11.1 3.4-18.1H380c1.6 6.9 2.9 13.2 3.5 18.1c1.1 8 7.9 14 16 13.9l32.3-.1c9.6 0 17.1-8.3 15.9-17.8c-4.6-37.9-25.6-129-118.9-207.7c-17.6 12.4-37.1 24.2-58.5 35.4c6.2 4.6 11.4 9.4 17 14.2H159.7c21.3-18.1 47-35.6 78.7-51.4C410.5 199.1 442.1 65.8 447.9 17.9C449 8.4 441.6.1 432 .1L399.6 0c-8.1 0-14.9 5.9-16 13.9c-.7 4.9-1.8 11.1-3.4 18.1H67.8c-1.6-7-2.7-13.1-3.4-18.1c-1.1-8-7.9-14-16-13.9L16.1.1C6.5.1-1 8.4.1 17.9C5.3 60.8 31.4 171.8 160 256C31.5 340.2 5.3 451.2.1 494.1zM224 219.6c-25.1-13.7-46.4-28.4-64.3-43.6h128.5c-17.8 15.2-39.1 30-64.2 43.6zM355.1 96c-5.8 10.4-12.8 21.1-21 32H114c-8.3-10.9-15.3-21.6-21-32h262.1zM92.9 416c5.8-10.4 12.8-21.1 21-32h219.4c8.3 10.9 15.4 21.6 21.2 32H92.9z"
                            fill="currentColor"
                        />
                    </svg>
                    <span style="color: green;">
                        D
                        <!-- <sub>isease</sub> -->
                    </span>
                    <span style="color: steelblue;">
                        L
                        <!-- <sub>ncRNA</sub> -->
                    </span>
                    <span style="color: orange;">
                        M
                        <!-- <sub>iRNA</sub> -->
                    </span>
                    V
                </div>
                <search-box-vue></search-box-vue>
                <!-- <n-switch v-model:value="active" :round="false">
                </n-switch> -->
            </n-space>
        </n-layout-header>
        <n-layout has-sider>
            <!-- <n-layout-sider
                class="shadow-lg"
                bordered
                collapse-mode="transform"
                show-trigger="arrow-circle"
                :collapsed="left_slider_collapsed"
                @update:collapsed="left_slider_collapsed = $event"
                content-style="padding: 12px;"
            >
            <n-scrollbar style="height:calc(100vh - 88px)">
                <div v-show="!left_slider_collapsed" >
                    <suspense>
                        <template #default>  
                            <left-panel />
                        </template>
                    </suspense>
                </div>
            </n-layout-sider>-->
            <n-layout has-sider sider-placement="right">
                <n-layout-content>
                    <graph-vue class="w-1/1 h-1/1"></graph-vue>
                </n-layout-content>
                <!-- <n-layout-sider
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
                </n-layout-sider>-->
            </n-layout>
        </n-layout>
        <!-- <n-layout-footer>成府路</n-layout-footer> -->
    </n-layout>
</template>

<script setup>
import { NLayout, NLayoutSider, NLayoutContent, NLayoutFooter, NLayoutHeader, NSpin ,NSwitch,NScrollbar} from 'naive-ui';
import { ref ,computed} from "vue";

import SearchBoxVue from '../components/control/SearchBox.vue';
import LeftPanel from "../components/control/selectPanel/panel.vue";
import graphVue from '../components/chart/graph.vue';
// import DAGVue from '../components/chart/dag.vue';
import Dag from '../components/chart/dag.vue';
import connectVue from '../components/chart/connect.vue';

const header_height = "64px";
const left_slider_collapsed = ref(false);
const right_slider_collapsed = ref(false);
// const active=ref(false);


</script>

<style>
.n-layout-header {
    height: v-bind(header_height);
}

.n-layout-content {
    height: calc(100vh - v-bind(header_height));
}
</style>