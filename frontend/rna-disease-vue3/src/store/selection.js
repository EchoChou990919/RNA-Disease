import { defineStore } from "pinia";

export const SelectionStore = defineStore({
    id: "selection",
    state: function () {
        return {
            locked: null,
            hovered: null,
            edge: null
        }
    }
});