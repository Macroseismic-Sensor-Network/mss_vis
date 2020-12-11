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
        <splitpanes class="default-theme"
                    horizontal
                    @resized="on_splitpanes_resized()">
            <pane size="0">
                <TracksPanel :key="tracksPanelKey"/>
            </pane>
            <pane size="100">
                <splitpanes @resized="on_splitpanes_resized()">
                    <pane size="0">
                        Menu Pane
                    </pane>
                    <pane size="100">
                        <PGVMap :key="mapKey" />
                    </pane>
                    <pane size="0">
                        <splitpanes horizontal>
                            <pane size="100">
                                <MapInfoPanel key="map_info_panel_key"/>
                            </pane>
                            <pane size="100">
                                <ArchiveEventInfoPanel key="archive_info_panel_key"/>
                            </pane>
                            <pane size="0">
                                <StationInfoPanel key="station_info_panel_key"/>
                            </pane>
                        </splitpanes>
                    </pane>
                </splitpanes>
            </pane>
            <pane size="0">
                Spreadsheet Pane
            </pane>
        </splitpanes>
    </div>
</template>

<script>

import PGVMap from '../components/PGVMap.vue'
import TracksPanel from '../components/TracksPanel.vue'
import StationInfoPanel from '../components/StationInfoPanel.vue'
import MapInfoPanel from '../components/MapInfoPanel.vue'
import ArchiveEventInfoPanel from '../components/ArchiveEventInfoPanel.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'MSSDisplay',
    props: {
        title: String
    },
	data() {
		return {
			mapKey: 0,
                        stationInfoPanelKey: 0,
                        tracksPanelKey: 0,
		}
	},
    components: {
        // eslint-disable-next-line
        PGVMap,
        StationInfoPanel,
        MapInfoPanel,
        ArchiveEventInfoPanel,
        TracksPanel,
        Splitpanes,
        Pane,
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },
    methods: {
        on_splitpanes_resized() {
            this.$store.getters.leaflet_map.map_object.invalidateSize();
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
