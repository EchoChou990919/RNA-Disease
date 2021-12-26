import { defineStore } from "pinia";

export const SelectionStore = defineStore({
    id: "selection",
    state: function () {
        return {
            locked: [],
            hovered: null,
            edge: null,
            case_i: null,
            case_j: null,
            subNet: null,
        }
    },

});