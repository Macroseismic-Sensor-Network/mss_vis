/*****************************************************************************
 * LICENSE
 *
 * This file is part of mss_vis.
 * 
 * If you use mss_vis in any program or publication, please inform and
 * acknowledge its authors.
 * 
 * mss_vis is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * mss_vis is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with mss_vis. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2019 Stefan Mertl
 *****************************************************************************/

import Vue from 'vue'
import MSSDisplay from './components/MSSDisplay.vue'
import MSSTimeSeriesDisplay from './components/MSSTimeSeriesDisplay.vue'
import LWZDisplay from './components/LWZDisplay.vue'
import store from './store/store.js'
import VueNativeSock from 'vue-native-websocket'

Vue.config.productionTip = false

Vue.use(VueNativeSock,
        'ws://mss.mertl-research.at:80/ws_vis/', 
        //'ws://localhost:8100', 
        {store: store,
         format: 'json',
         reconnection: true,
         reconnectionDelay: 3000});


Vue.component('mss-display', MSSDisplay);
Vue.component('mss-time-series-display', MSSTimeSeriesDisplay);
Vue.component('lwz-display', LWZDisplay);

new Vue({
    store,
    el: '#app',
});
