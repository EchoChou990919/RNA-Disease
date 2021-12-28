<template>
    <div id="graph" style="height:400px;width:400px">
        <v-chart class="chart border" :option="option" />
    </div>
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { GraphChart } from "echarts/charts";
import { GridComponent } from 'echarts/components';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent
} from "echarts/components";
import VChart from "vue-echarts";
import * as d3 from "d3";
import { ref, defineComponent, computed } from "vue";
import _ from "lodash";
import * as nodelink from '@/service/dataloader/nodelinks';
import nodelink_data from '/public/newNodeLinks.json';
import w_result from '/public/w_result.json';

use([
    CanvasRenderer,
    GraphChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
]);

const props = defineProps({//id
    lncRNA_id: Number,
    disease_id: Number
})
const nodeObject = _(nodelink_data["nodes"]).map(n => [n.id, n]).fromPairs().value();
var score = w_result["w"];
var maxs = Math.max.apply(null, score)
var mins = Math.min.apply(null, score)
const d = computed(() => {

    var linki = nodelink.net2connTable()[props.lncRNA_id];///
    var linkj = nodelink.net2connTable()[props.disease_id];
    var data = [{
        'id': props.lncRNA_id,
        'name': nodeObject[props.lncRNA_id].name,
        'categorg': 0
    }, {
        'id': props.disease_id,
        'name': nodeObject[props.disease_id].name,
        'categorg': 1
    }];
    var link = [];
    var left_link = new Array(1200).fill(0);
    var right_link = new Array(1200).fill(0);
    for (var itemi of linki) {
        if(itemi["type"]==0)
        left_link[itemi["target"]] = itemi["value"];
    }
    for (var itemj of linkj) {
        if(itemj["type"]==0)
        right_link[itemj["target"]] = itemj["value"];
    }
    // console.log(right_link)
    var data_w = [];
    for (var i = 0; i < 1200; i++) {
        if (left_link[i] != 0 && right_link[i] != 0 && i != props.lncRNA_id && i != props.disease_id && nodeObject[i] != undefined) {
            data_w.push({ "id": i, "w": score[i] });
        }
    }
    _.sortBy(data_w, function (d) {
        return d.w;
    });

    for (var item = 0; item < Math.min(10,data_w.length); item++) {
        var i = data_w[item].id;

        data.push({
            'id': i,
            'order': item,
            'name': nodeObject[i].name,
            'categorg': nodeObject[i].category,
            'score': score[i]
        });
        link.push({
            'source': 0,
            'target': item + 2,
            'value': left_link[i]
        });
        link.push({
            'source': item + 2,
            'target': 1,
            'value': right_link[i]
        });
    }

    return {
        'nodes': data,
        'links': link
    };
})

const nodes = computed(() => {
    return d.value.nodes;
})
const links = computed(() => {
    return d.value.links;
})
console.log(nodes)
// var data = [{
//     'id': 0,
//     'name': 'MIR17HG',
//     'categorg': 0
// }, {
//     'id': 1,
//     'name': 'DOID:1319',
//     'categorg': 1
// }, {
//     'id': 2,
//     'name': 'ESRG',
//     'categorg': 0,
//     'score': -1.91
// }, {
//     'id': 3,
//     'name': 'H19',
//     'categorg': 0,
//     'score': -0.684
// }, {
//     'id': 4,
//     'name': 'DOID:1324',
//     'categorg': 1,
//     'score': 1.14
// }, {
//     'id': 5,
//     'name': 'DOID:14566',
//     'categorg': 1,
//     'score': -1.16
// }, {
//     'id': 6,
//     'name': 'DOID:162',
//     'categorg': 1,
//     'score': 1.41
// }, {
//     'id': 7,
//     'name': 'DOID:170',
//     'categorg': 1,
//     'score': -1.32
// }, {
//     'id': 8,
//     'name': 'DOID:178',
//     'categorg': 1,
//     'score': 0.409
// }, {
//     'id': 9,
//     'name': 'DOID:1793',
//     'categorg': 1,
//     'score': 0.325
// }, {
//     'id': 10,
//     'name': 'DOID:18',
//     'categorg': 1,
//     'score': -0.324
// }, {
//     'id': 11,
//     'name': 'DOID:184',
//     'categorg': 1,
//     'score': -0.19
// }, {
//     'id': 12,
//     'name': 'DOID:201',
//     'categorg': 1,
//     'score': 1.1
// }, {
//     'id': 13,
//     'name': 'DOID:2043',
//     'categorg': 1,
//     'score': -0.458
// }, {
//     'id': 14,
//     'name': 'DOID:2174',
//     'categorg': 1,
//     'score': -1.15
// }, {
//     'id': 15,
//     'name': 'DOID:2237',
//     'categorg': 1,
//     'score': -0.59
// }, {
//     'id': 16,
//     'name': 'DOID:225',
//     'categorg': 1,
//     'score': 1.15
// }, {
//     'id': 17,
//     'name': 'DOID:2531',
//     'categorg': 1,
//     'score': 0.495
// }, {
//     'id': 18,
//     'name': 'DOID:305',
//     'categorg': 1,
//     'score': 1.06
// }, {
//     'id': 19,
//     'name': 'DOID:3070',
//     'categorg': 1,
//     'score': 0.278
// }, {
//     'id': 20,
//     'name': 'DOID:3093',
//     'categorg': 1,
//     'score': -0.0212
// }, {
//     'id': 21,
//     'name': 'DOID:3118',
//     'categorg': 1,
//     'score': -0.0228
// }, {
//     'id': 22,
//     'name': 'DOID:3119',
//     'categorg': 1,
//     'score': 0.162
// }, {
//     'id': 23,
//     'name': 'DOID:3347',
//     'categorg': 1,
//     'score': 0.944
// }, {
//     'id': 24,
//     'name': 'DOID:3393',
//     'categorg': 1,
//     'score': 0.812
// }, {
//     'id': 25,
//     'name': 'DOID:3571',
//     'categorg': 1,
//     'score': -1.34
// }, {
//     'id': 26,
//     'name': 'DOID:3620',
//     'categorg': 1,
//     'score': 0.433
// }, {
//     'id': 27,
//     'name': 'DOID:3905',
//     'categorg': 1,
//     'score': -0.631
// }, {
//     'id': 28,
//     'name': 'DOID:4',
//     'categorg': 1,
//     'score': -0.684
// }, {
//     'id': 29,
//     'name': 'DOID:409',
//     'categorg': 1,
//     'score': 0.597
// }, {
//     'id': 30,
//     'name': 'DOID:4645',
//     'categorg': 1,
//     'score': -0.142
// }, {
//     'id': 31,
//     'name': 'DOID:4706',
//     'categorg': 1,
//     'score': 0.117
// }, {
//     'id': 32,
//     'name': 'DOID:4960',
//     'categorg': 1,
//     'score': -0.0378
// }, {
//     'id': 33,
//     'name': 'DOID:5409',
//     'categorg': 1,
//     'score': -0.661
// }, {
//     'id': 34,
//     'name': 'DOID:557',
//     'categorg': 1,
//     'score': 0.876
// }, {
//     'id': 35,
//     'name': 'DOID:5844',
//     'categorg': 1,
//     'score': 1.17
// }, {
//     'id': 36,
//     'name': 'DOID:630',
//     'categorg': 1,
//     'score': 1.5
// }, {
//     'id': 37,
//     'name': 'DOID:684',
//     'categorg': 1,
//     'score': 0.455
// }, {
//     'id': 38,
//     'name': 'DOID:686',
//     'categorg': 1,
//     'score': 1.81
// }, {
//     'id': 39,
//     'name': 'DOID:7',
//     'categorg': 1,
//     'score': 0.415
// }, {
//     'id': 40,
//     'name': 'DOID:707',
//     'categorg': 1,
//     'score': 0.383
// }, {
//     'id': 41,
//     'name': 'DOID:768',
//     'categorg': 1,
//     'score': 0.591
// }, {
//     'id': 42,
//     'name': 'DOID:77',
//     'categorg': 1,
//     'score': 0.668
// }, {
//     'id': 43,
//     'name': 'DOID:771',
//     'categorg': 1,
//     'score': 1.81
// }, {
//     'id': 44,
//     'name': 'DOID:898',
//     'categorg': 1,
//     'score': 1.04
// }, {
//     'id': 45,
//     'name': 'DOID:934',
//     'categorg': 1,
//     'score': 2.27
// }, {
//     'id': 46,
//     'name': 'DOID:9538',
//     'categorg': 1,
//     'score': 1.82
// }, {
//     'id': 47,
//     'name': 'mir144',
//     'categorg': 2,
//     'score': -0.0663
// }, {
//     'id': 48,
//     'name': 'mir223',
//     'categorg': 2,
//     'score': 0.595
// }, {
//     'id': 49,
//     'name': 'mir302b',
//     'categorg': 2,
//     'score': 0.221
// }, {
//     'id': 50,
//     'name': 'mir372',
//     'categorg': 2,
//     'score': 1.49
// }, {
//     'id': 51,
//     'name': 'mir373',
//     'categorg': 2,
//     'score': -0.162
// }, {
//     'id': 52,
//     'name': 'mir153',
//     'categorg': 2,
//     'score': -0.691
// }, {
//     'id': 53,
//     'name': 'mir302d',
//     'categorg': 2,
//     'score': 0.983
// }]

// // data = data.slice(0, 30)

// var link = [{
//     'source': 0,
//     'target': 2,
//     'value': 0.362
// }, {
//     'source': 0,
//     'target': 3,
//     'value': 0.621
// }, {
//     'source': 0,
//     'target': 4,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 5,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 6,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 7,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 8,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 9,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 10,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 11,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 12,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 13,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 14,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 15,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 16,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 17,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 18,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 19,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 20,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 21,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 22,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 23,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 24,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 25,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 26,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 27,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 28,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 29,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 30,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 31,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 32,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 33,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 34,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 35,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 36,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 37,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 38,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 39,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 40,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 41,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 42,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 43,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 44,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 45,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 46,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 47,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 48,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 49,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 50,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 51,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 52,
//     'value': 1.0
// }, {
//     'source': 0,
//     'target': 53,
//     'value': 1.0
// }, {
//     'source': 2,
//     'target': 1,
//     'value': 1.0
// }, {
//     'source': 3,
//     'target': 1,
//     'value': 1.0
// }, {
//     'source': 4,
//     'target': 1,
//     'value': 0.445
// }, {
//     'source': 5,
//     'target': 1,
//     'value': 0.416
// }, {
//     'source': 6,
//     'target': 1,
//     'value': 0.538
// }, {
//     'source': 7,
//     'target': 1,
//     'value': 0.53
// }, {
//     'source': 8,
//     'target': 1,
//     'value': 0.112
// }, {
//     'source': 9,
//     'target': 1,
//     'value': 0.445
// }, {
//     'source': 10,
//     'target': 1,
//     'value': 0.141
// }, {
//     'source': 11,
//     'target': 1,
//     'value': 0.383
// }, {
//     'source': 12,
//     'target': 1,
//     'value': 0.445
// }, {
//     'source': 13,
//     'target': 1,
//     'value': 0.112
// }, {
//     'source': 14,
//     'target': 1,
//     'value': 0.544
// }, {
//     'source': 15,
//     'target': 1,
//     'value': 0.0772
// }, {
//     'source': 16,
//     'target': 1,
//     'value': 0.185
// }, {
//     'source': 17,
//     'target': 1,
//     'value': 0.445
// }, {
//     'source': 18,
//     'target': 1,
//     'value': 0.35
// }, {
//     'source': 19,
//     'target': 1,
//     'value': 0.35
// }, {
//     'source': 20,
//     'target': 1,
//     'value': 0.754
// }, {
//     'source': 21,
//     'target': 1,
//     'value': 0.112
// }, {
//     'source': 22,
//     'target': 1,
//     'value': 0.53
// }, {
//     'source': 23,
//     'target': 1,
//     'value': 0.335
// }, {
//     'source': 24,
//     'target': 1,
//     'value': 0.0772
// }, {
//     'source': 25,
//     'target': 1,
//     'value': 0.445
// }, {
//     'source': 26,
//     'target': 1,
//     'value': 0.869
// }, {
//     'source': 27,
//     'target': 1,
//     'value': 0.383
// }, {
//     'source': 28,
//     'target': 1,
//     'value': 0.255
// }, {
//     'source': 29,
//     'target': 1,
//     'value': 0.0919
// }, {
//     'source': 30,
//     'target': 1,
//     'value': 0.477
// }, {
//     'source': 31,
//     'target': 1,
//     'value': 0.877
// }, {
//     'source': 32,
//     'target': 1,
//     'value': 0.383
// }, {
//     'source': 33,
//     'target': 1,
//     'value': 0.335
// }, {
//     'source': 34,
//     'target': 1,
//     'value': 0.112
// }, {
//     'source': 35,
//     'target': 1,
//     'value': 0.0663
// }, {
//     'source': 36,
//     'target': 1,
//     'value': 0.185
// }, {
//     'source': 37,
//     'target': 1,
//     'value': 0.335
// }, {
//     'source': 38,
//     'target': 1,
//     'value': 0.383
// }, {
//     'source': 39,
//     'target': 1,
//     'value': 0.185
// }, {
//     'source': 40,
//     'target': 1,
//     'value': 0.299
// }, {
//     'source': 41,
//     'target': 1,
//     'value': 0.387
// }, {
//     'source': 42,
//     'target': 1,
//     'value': 0.141
// }, {
//     'source': 43,
//     'target': 1,
//     'value': 0.426
// }, {
//     'source': 44,
//     'target': 1,
//     'value': 0.0772
// }, {
//     'source': 45,
//     'target': 1,
//     'value': 0.141
// }, {
//     'source': 46,
//     'target': 1,
//     'value': 0.299
// }, {
//     'source': 47,
//     'target': 1,
//     'value': 1.0
// }, {
//     'source': 48,
//     'target': 1,
//     'value': 1.0
// }, {
//     'source': 49,
//     'target': 1,
//     'value': 1.0
// }, {
//     'source': 50,
//     'target': 1,
//     'value': 1.0
// }, {
//     'source': 51,
//     'target': 1,
//     'value': 1.0
// }, {
//     'source': 52,
//     'target': 1,
//     'value': 1.0
// }, {
//     'source': 53,
//     'target': 1,
//     'value': 1.0
// }]

var h = 400;
var w = 400;
// var h=document.getElementById('graph').clientHeight;
// console.log(h);


// var color_node = d3.scaleLinear().domain([mins, 0, maxs]).range(["#5151FF", "#D3D3D3", "#FF5151"]);

var color_node = d3.interpolateRdBu
var nor = d3.scaleLinear().domain([maxs, 0, mins]).range([0, 0.5, 1])

var color_link = d3.interpolateBlues;

var size = d3.scaleLinear().domain([1, 60]).range([25, 5])

const interval = computed(() => {
    return h * 0.9 / (nodes.value.length - 3);
})
const r = computed(() => {
    return h * 0.9 / (nodes.value.length - 2) / 2;
})


const option = computed(() => {
    var op = {
        // tooltip: {},
        animationDurationUpdate: function (order) {
            // 越往后的数据时长越大
            console.log(order)
            return order * 100;
        },
        animationEasingUpdate: 'quinticInOut',
        grid: {
            show: false,
            top: 0.05 * h,
            left: 0,
            right: 0,
            bottom: 0.05 * h
        },
        series: [{
            type: 'graph',
            layout: 'none',
            // symbolSize: Math.min(h * 0.9 / 15, 0.8 * h * 0.9 / (data.length - 2)),
            symbolSize: r.value * 2 / 2,
            roam: true,
            top: r.value + 0.05 * h,
            bottom: r.value + 0.05 * h,
            // label: {
            //     fontSize: 13,
            //     show: false
            // },

            edgeLabel: {
                fontSize: 10
            },
            emphasis: {
                scale: true,
                focus: "adjacency",
                blurScope: "coordinateSystem",
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    symbolSize: 15,
                },
                lineStyle: {
                    width: 5
                },
                label: {
                    show: true,
                    fontSize: 15,
                    formatter: (params) => {
                        // console.log(params)
                        if(params.data.id==props.lncRNA_id||params.data.id==props.disease_id)
                            return params.data.name;
                        return params.data.name +" : " + _.round(params.data.score,3)

                    },
                    position: 'top'
                },
                edgeLabel: {
                    show: true,
                    fontSize: 15,
                    formatter: (params) => {
                        // console.log(params)
                        return nodes.value[params.data.source].name + "--" + nodes.value[params.data.target].name + "  " + _.round(params.data.value,3)

                    }
                }
            },

            data: nodes.value.map(function (node) {
                console.log(nodeObject[props.lncRNA_id].name)
                if (node.name == nodeObject[props.lncRNA_id].name) {
                    node.x = -h * 0.45;
                    node.y = h * 0.45;
                    node.symbolSize = h * 0.9 / 15;
                    node.label = {
                        show: true,
                        position: 'top'
                    }
                    node.tooltip = {
                        formatter: () => {
                            return ""
                        }
                    }
                    node.itemStyle = {
                        color: "steelblue"
                    }
                } else if (node.name == nodeObject[props.disease_id].name) {
                    node.x = h * 0.45;
                    node.y = h * 0.45;
                    node.symbolSize = h * 0.9 / 15;
                    node.label = {
                        show: true,
                        position: 'top'
                    }
                    node.tooltip = {
                        formatter: () => {
                            return ""
                        }
                    }
                    node.itemStyle = {
                        color: "green"
                    }
                } else {
                    node.x = 0;
                    node.y = node.order * interval.value;
                    node.value = node.score;
                    // node.label = {
                    //     show: false
                    // };
                    node.tooltip = {
                        formatter: (params) => {
                            return node.name + '&nbsp&nbsp&nbsp<b>' + node.data.value + '</b>'
                        }
                    }
                    node.itemStyle = {
                        color: color_node(nor(node.score))
                    }
                }
                if (node.categorg == 0) node.symbol = "circle";
                else if (node.categorg == 1) node.symbol = "rect";
                else node.symbol = "triangle";


                return node;
            }),

            links: links.value.map(function (edge) {
                edge.lineStyle = {
                    color: color_link(edge.value)
                }
                edge.tooltip = {
                    // formatter: (params) => {
                    //         console.log(params)
                    //         return data[params.data.source].name + "--" + data[params.data.target].name + '&nbsp&nbsp&nbsp<b>' + params.data.value + '</b>'
                    //     }
                    formatter: () => {

                        return nodes.value[edge.source].name + "--" + nodes.value[edge.target].name + '&nbsp&nbsp&nbsp<b>' + edge.value + '</b>'

                    }
                    // formatter: ' {c}'
                }
                return edge;
            }),
            lineStyle: {
                opacity: 0.9,
                width: 1.2,
                curveness: 0
            }
        }]
    }
    console.log(op)
    return op;
}
);
</script>

<style scoped>
.chart {
    height: 100%;
}
</style>