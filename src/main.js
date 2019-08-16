import Vue from 'vue'
import App from './App.vue'
import store from './store/store.js'
import VueNativeSock from 'vue-native-websocket'
import 'fullpage.js/vendors/scrolloverflow'
//import './fullpage.scrollHorizontally.min'
import VueFullPage from 'vue-fullpage.js'

Vue.config.productionTip = false

/*
export const socket_instance = socketio('ws://127.0.0.1:3333');
Vue.use(new VueSocketIO({
            debug: true,
            connection: socket_instance
            vuex: {
                    store,
                    actionPrefix: 'SOCKET_',
                    mutationPrefix: 'SOCKET_'
            }
            }))
*/

Vue.use(VueNativeSock,
        'ws://mss.mertl-research.at:8100', 
        {store: store,
         format: 'json',
         reconnection: true,
         reconnectionDelay: 3000});

Vue.use(VueFullPage);

//Vue.use(VueNativeSock, 'ws://localhost:8100', {store: store, format: 'json'})

new Vue({
    store,
    render: h => h(App),
}).$mount('#app')
