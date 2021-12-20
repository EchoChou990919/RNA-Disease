import { createApp } from 'vue'
import App from './App.vue'

const app=createApp(App);

// UI import and config
import {create,NButton,NCard,NSpace,NIcon} from "naive-ui";
const naive=create({
    components:[NButton,NCard,NSpace,NIcon]
});
app.use(naive);

// Pinia import and config
import {createPinia} from "pinia";
const pinia=createPinia();
app.use(pinia);

// load windicss and config
import 'virtual:windi.css';

app.mount('#app')
