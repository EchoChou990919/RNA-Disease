import {ref} from "vue";
const z=ref(0);

export function useTooltip(){
    z.value++;
    return z;
}