<template>
    <div>
        <svg
            v-if="showLine"
            class="absolute pointer-events-none"
            :style="{
                left: `${x}px`,
                top: `${y}px`,
                transform: `scale(${(offsetX + boxOffset.x)/Math.abs(offsetX + boxOffset.x)},${(offsetY + boxOffset.y)/Math.abs(offsetY + boxOffset.y)}) translate(${(offsetX + boxOffset.x)>0?0:-(offsetX+boxOffset.x)}px,${(offsetY + boxOffset.y)>0?0:-(offsetY+boxOffset.y)}px)`,
                'z-index': `${z_index}`,
            }"
            :viewBox="`0 0 ${Math.abs(offsetX + boxOffset.x)} ${Math.abs(offsetY + boxOffset.y)}`"
            preserveAspectRatio ="none"
            :width='Math.abs(offsetX + boxOffset.x)'
            :height='Math.abs(offsetY + boxOffset.y)'
        >
            <line 
                :x1="0" 
                :y1="0" 
                :x2="Math.abs(offsetX + boxOffset.x)" 
                :y2="Math.abs(offsetY + boxOffset.y)" 
                stroke="black">
            </line>
        </svg>

        <div
            class="p-1 rounded border bg-white shadow"
            :style="{
                position: 'absolute',
                left: `${x + offsetX + boxOffset.x}px`,
                top: `${y + offsetY + boxOffset.y}px`,
                'z-index': `${z_index}`,
                ...style,
            }"
            ref="el"
        >
            <div
                @dragstart="onDragStart"
                @dragend="onDragEnd"
                :class="{ 'cursor-move': drag }"
                draggable="true"
            >
                <slot name="header"></slot>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useTooltip } from '@/utils/tooltip';
import linkHorizontalVue from './linkHorizontal.vue';
import linkVerticalVue from './linkVertical.vue';
const props = defineProps({
    x: {},
    y: {},
    style: {},
    offsetX: {
        default: 10
    },
    offsetY: {
        default: 10
    },
    drag: {
        default: false
    },
    showLine:{
        default:false
    }
});
const el = ref(null);
const emits = defineEmits(["pan_begin", "pan_end"]);
const panning = ref(false);
const startPox = reactive({ x: 0, y: 0 });
// const mouseOffset = reactive({ x: 0, y: 0 });
const boxOffset = reactive({ x: 0, y: 0 });
const z = useTooltip();

let z_index = ref(z.value);

async function onDragStart(e) {
    if (!props.drag) return;
    emits("pan_begin");
    z_index.value = z.value++;
    panning.value = true;
    startPox.x = e.clientX;
    startPox.y = e.clientY;
    e.dataTransfer.setDragImage(el.value, e.layerX, e.layerY);
}

function onDragEnd(e) {
    if (!props.drag) return;
    emits("pan_end");
    panning.value = false;
    boxOffset.x += e.clientX - startPox.x;
    boxOffset.y += e.clientY - startPox.y;
}

const yPosition = computed(() => {
    if (el.value == null) return 0;

    const height = el.value.offsetHeight;
    const offset = props.offsetY + boxOffset.y;
    console.log("yPos", height, offset);
    if (offset > 0) {
        return 1;
    }
    else if (-offset < height) {
        return 0;
    }
    else {
        return -1;
    }
})

const ArrowHeight = computed(() => {
    if (yPosition.value == 1) {
        return `calc(100% + ${props.offsetY + boxOffset.y}px)`
    }
    else if (yPosition.value == 0) {
        return "100%"
    }
    else {
        return `calc(100% + ${Math.abs(props.offsetY + boxOffset.y)}px)`
    }
})


const tooltipHeight = computed(() => {
    props.offsetY + boxOffset.y;
    return el.value.offsetHeight;
})
</script>

