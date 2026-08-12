import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { inject } from '@vercel/analytics'
import { SpeedInsights } from "@vercel/speed-insights/vue"

inject()

const app = createApp(App)
app.use(router)
app.mount('#app')