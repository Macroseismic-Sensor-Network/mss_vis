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
import LWZDisplay from './components/LWZDisplay.vue'
import store from './store/store.js'
import VueNativeSock from 'vue-native-websocket'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import WaveUI from 'wave-ui'
import 'wave-ui/dist/wave-ui.css'
import '@mdi/font/css/materialdesignicons.min.css'
import pako from 'pako';

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'development') {
    store.state.log_level = 'debug';
}
else
{
    store.state.log_level = 'info';
}

Vue.use(VueNativeSock,
        //'wss://mss.mertl-research.at/ws_vis/', 
        'ws://localhost:8100', 
        {
            store: store,
            format: 'json',
            reconnection: true,
            reconnectionDelay: 3000,
            passToStoreHandler: function (event_name, event) {
                let logger = log.getLogger("websocket")
                logger.setLevel(this.store.getters.log_level)
                log_prefix.apply(logger,
                                 this.store.getters.prefix_options)
                logger.debug('Preprocessing the websocket data.')
                logger.debug('event data:', event.data);
                let method = 'commit';
                let target = event_name.toUpperCase();
                let msg = event;

                if (event.data) {
                    logger.debug('Handling an event with data.');
                    //let self = this;
                    if (typeof event.data === 'string')
                    {
                        logger.debug('Handling uncompressed data.');
                        msg = JSON.parse(event.data);
                        this.store[method](target, msg);
                    }
                    else {
                        logger.debug('Handling compressed data.');
                        let self = this;
                        new Response(event.data).arrayBuffer().then(function(buffer) {
                            let inflate_msg = pako.inflate(buffer, {to: 'string'});
                            logger.debug('uncompressed:', inflate_msg);
                            inflate_msg = JSON.parse(inflate_msg);
                            logger.debug('json parsed message:', inflate_msg);
                            self.store[method](target, inflate_msg);
                        });
                    }
                }
                else {
                    logger.debug('Handling a NO DATA event.');
                    this.store[method](target, msg);
                }
            },
        }
);

Vue.component('mss-display', MSSDisplay);
Vue.component('lwz-display', LWZDisplay);

Vue.use(WaveUI)
const waveui = new WaveUI(
    {
        // Some Wave UI options.
    }
);

new Vue({
    store,
    waveui,
    el: '#app',
    created: function() {
        log.setLevel(this.$store.getters.log_level);
        this.$store.getters.logger.setLevel(this.$store.getters.log_level);
        //this.$store.getters.logger.setLevel('debug');

        log_prefix.reg(log);
        log_prefix.apply(this.$store.getters.logger,
                         this.$store.getters.prefix_options);
    },

});
