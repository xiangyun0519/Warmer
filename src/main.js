import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
// 导入LeanCloud配置
import './utils/leancloud'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')