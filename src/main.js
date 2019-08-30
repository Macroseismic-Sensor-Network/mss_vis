import Vue from 'vue'
import PGVMap from './components/PGVMap.vue'
import store from './store/store.js'
import VueNativeSock from 'vue-native-websocket'

Vue.config.productionTip = false

Vue.use(VueNativeSock,
        'ws://mss.mertl-research.at:8100', 
        //'ws://localhost:8100', 
        {store: store,
         format: 'json',
         reconnection: true,
         reconnectionDelay: 3000});

Vue.component('pgv-map', PGVMap);

new Vue({
    store,
    el: '#app',
});
