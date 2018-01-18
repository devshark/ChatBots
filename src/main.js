import Vue from 'vue'
import App from './App'
import router from './router'
import VueLogger from 'vuejs-logger'

import LoggerOptions from '@/options/logger-options'

Vue.config.productionTip = false

Vue.use(VueLogger, LoggerOptions)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
