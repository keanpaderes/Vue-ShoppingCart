import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import NProgress from 'nprogress'
import ApolloClient from "apollo-boost"
import VueApollo from "vue-apollo"

// require styles
import 'swiper/dist/css/swiper.css'
import '../node_modules/nprogress/nprogress.css'

Vue.use(VueApollo)
Vue.use(VueAwesomeSwiper)

Vue.config.productionTip = false

const apolloClient = new ApolloClient({
  uri: "https://acss-3factor-app.herokuapp.com/v1/graphql"
})
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

router.beforeResolve((to, from, next) => { if (to.name) { NProgress.start() }
next() })

router.afterEach(() => {
  NProgress.done()
})
// eslint-disable-next-line no-unused-vars
let vm = new Vue({
  router,
  store,
  apolloProvider,
  render: h => h(App)
}).$mount('#app')
