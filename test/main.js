import Vue from 'vue'
import Docker from '../src/components/Docker.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(Docker),
}).$mount('#app')
