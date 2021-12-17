import Vue from 'vue'
import App from './App'
import store from './store'
import settings from './settings'
import vuexStore from '@/store/$u.mixin.js'
import WxLogin from './utils/login'
// 引入全局uView
import uView from '@/uni_modules/uview-ui'

Vue.use(uView);

Vue.mixin(vuexStore);

Vue.config.productionTip = false

Vue.prototype.$static = settings.STATIC
Vue.prototype.$store = store
Vue.prototype.$settings = settings
Vue.prototype.$LOGIN = new WxLogin()

App.mpType = 'app'

const app = new Vue({
	store,
	...App,
})
app.$mount()

