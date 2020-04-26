<!--
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
-->

<template>
    <div id="mss-display-container" class="cell auto">
        <div class="off-canvas-wrapper">
            <div class="off-canvas-content" data-off-canvas-content>
                <PGVMap :key="mapKey" v-on:reload-map-2="forceReloadMap()"/>
            </div>

            <div class="off-canvas-absolute position-left"
                 id="off_canvas_settings"
                 data-off-canvas
                 data-transition="overlap">
                <!-- Your menu or Off-canvas content goes here -->
                <button class="close-button" aria-label="Close menu" type="button" data-close>
                    <span aria-hidden="true">&times;</span>
                </button>
                <br>
                <ul class="accordion" data-accordion>
                    <li class="accordion-item is-active" data-accordion-item>
                        <!-- Accordion tab title -->
                        <a href="#" class="accordion-title">Display</a>

                        <!-- Accordion tab content: it would start in the open state due to using the `is-active` state class. -->
                        <div class="accordion-content" data-tab-content>
                            <div>
                                <label>Show event monitor</label>
                            </div>
                            <div class="switch">
                                <input class="switch-input" id="exampleSwitch" type="checkbox" name="exampleSwitch" v-model="show_event_monitor">
                                <label class="switch-paddle" for="exampleSwitch">
                                    <span class="show-for-sr">Show event monitor</span>
                                </label>
                            </div>
                        </div>
                    </li>
                    <li class="accordion-item" data-accordion-item>
                        <!-- Accordion tab title -->
                        <a href="#" class="accordion-title">Other</a>

                        <!-- Accordion tab content: it would start in the open state due to using the `is-active` state class. -->
                        <div class="accordion-content" data-tab-content>
                            Content Other
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>

import PGVMap from '../components/PGVMap.vue'

export default {
    name: 'MSSDisplay',
    props: {
        title: String
    },
	data() {
		return {
			mapKey:0,
		}
	},
    components: {
        // eslint-disable-next-line
        PGVMap,
    },
	methods: {
		forceReloadMap() {
			//this.mapKey+=1;
			//$('#app').load();
		},
	},
    computed: {
        stations: function() {
            return this.$store.getters.station_meta;
        },
        
        show_event_monitor: {
            get() {
                return this.$store.getters.map_control.show_event_monitor;
            },

            set(value) {
                var payload = {property: 'show_event_monitor',
                    value: value}
                this.$store.commit('set_map_control', payload);
            }
        },

        show_event_warning: {
            get() {
                return this.$store.getters.map_control.show_event_warning;
            },

            set(value) {
                var payload = {property: 'show_event_warning',
                    value: value}
                this.$store.commit('set_map_control', payload);
            }
        },

        show_event_detection: {
            get() {
                return this.$store.getters.map_control.show_event_detection;
            },

            set(value) {
                var payload = {property: 'show_event_detection',
                    value: value}
                this.$store.commit('set_map_control', payload);
            }
        },


        show_detection_result: {
            get() {
                return this.$store.getters.map_control.show_detection_result;
            },

            set(value) {
                var payload = {property: 'show_detection_result',
                    value: value}
                this.$store.commit('set_map_control', payload);
            }
        },

    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

#mss-display-container
    height: 100%
    width: 100%

    //The z-index is needed to raise the offCanvas item above the map.
    #off_canvas_settings
        z-index: 1000

    .off-canvas-wrapper
        height: 100%
        width: 100%

        .off-canvas-content
            height: 100%
            width: 100%

</style>
