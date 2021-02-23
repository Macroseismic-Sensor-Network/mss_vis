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
    <w-app id="mss-display-container" class="cell auto">
            <splitpanes class="default-theme"
                        horizontal
                        @resized="on_display_container_splitpanes_resized()">
                <pane :size="layout.panes.tracks.size.toString() + '%'"
                    :max-size="layout.panes.tracks.max_size"  
                    v-if="layout.panes.tracks.visible"
                    ref="tracks_pane">
                    <TracksPanel :key="tracksPanelKey"/>
                </pane>
                <pane :size="layout.panes.map_container.size.toString() + '%'"
                      ref="map_container_pane">
                    <splitpanes @resized="on_splitpanes_resized()">
                        <pane :size="layout.panes.map_container.menu.size"
                              v-if="layout.panes.map_container.menu.visible">
                            Menu Pane
                        </pane>
                        <pane :size="layout.panes.map_container.map.size"
                              v-if="layout.panes.map_container.map.visible">
                            <PGVMap :key="mapKey" 
                                    v-resize:debounce="on_pgv_map_resize"/>
                        </pane>
                        <pane :size="layout.panes.map_container.info.size"
                              v-if="layout.panes.map_container.info.visible"
                              ref="map_info_pane">
                            <div style="overflow: scroll; height: 100%; background-color: white;">
                                <w-accordion :items="4"
                                    v-model="map_info_accordion_expanded">
                                    <template #item-title.1="">Status</template>
                                    <template #item-content.1=""><MapInfoPanel key="map_info_panel_key"/></template>
                                    <template #item-title.2="">Ereignis Monitor</template>
                                    <template #item-content.2=""><EventMonitorPanel key="event_monitor_panel_key"/></template>
                                    <template #item-title.3="">Aktuelle Ereignisse</template>
                                    <template #item-content.3=""><RecentEventInfoPanel key="archive_info_panel_key"/></template>
                                    <template #item-title.4="">Stationsdetails</template>
                                    <template #item-content.4=""><StationInfoPanel key="station_info_panel_key"/></template>
                                </w-accordion>
                            </div>
                        </pane>
                        <pane :size="layout.panes.map_container.event_info.size"
                              v-if="layout.panes.map_container.event_info.visible"
                              ref="event_info_pane">
                            <div style="overflow: scroll; height: 100%; background-color: white;">
                                <w-accordion :items="2"
                                    v-model="map_info_accordion_expanded">
                                    <template #item-title.1="">Ereignisdetails</template>
                                    <template #item-content.1=""><EventDetailsPanel key="event_details_panel_key"/></template>
                                    <template #item-title.2="">Zusatzdaten</template>
                                    <template #item-content.2=""><EventSupplementPanel key="event_supplement_panel_key"/></template>
                                </w-accordion>
                            </div>

                        </pane>
                    </splitpanes>
                </pane>
                <pane :size="layout.panes.content.size.toString() + '%'"
                      v-if="layout.panes.content.visible"
                      :max-size="layout.panes.content.max_size"
                      ref="content_pane">
                    <EventArchivePanel key="event_archive_panel_key" 
                                       v-if="is_archive"/>
                    <StationRealtimePanel key="station_realtime_panel_key"
                                          v-if="is_realtime"/>
                </pane>
            </splitpanes>
    </w-app>
</template>

<script>

import PGVMap from '../components/PGVMap.vue'
import TracksPanel from '../components/TracksPanel.vue'
import MapInfoPanel from '../components/MapInfoPanel.vue'
import EventArchivePanel from '../components/EventArchivePanel.vue'
import EventMonitorPanel from '../components/EventMonitorPanel.vue'
import EventDetailsPanel from '../components/EventDetailsPanel.vue'
import EventSupplementPanel from '../components/EventSupplementPanel.vue'
import RecentEventInfoPanel from '../components/RecentEventInfoPanel.vue'
import StationInfoPanel from '../components/StationInfoPanel.vue'
import StationRealtimePanel from '../components/StationRealtimePanel.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import resize from 'vue-resize-directive'

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
        MapInfoPanel,
        EventArchivePanel,
        EventMonitorPanel,
        EventDetailsPanel,
        EventSupplementPanel,
        RecentEventInfoPanel,
        StationInfoPanel,
        StationRealtimePanel,
        TracksPanel,
        Splitpanes,
        Pane,
    },
    directives: {
        resize,
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);

        this.$store.dispatch("init_store");
    },
    mounted() {
    },
    beforeDestroy() {
    },
    methods: {
        on_splitpanes_resized() {
            this.logger.debug('on_splitpanes_resized()');
            let payload = undefined;
            if (this.layout.panes.map_container.info.visible === true) {
                payload = {'map_info_size': parseFloat(this.$refs.map_info_pane.style.width)};
            }
            else {
                payload = {'event_info_size': parseFloat(this.$refs.event_info_pane.style.width)};
            }
            this.$store.commit('set_map_container_right_pane_size', payload);
        },

        on_display_container_splitpanes_resized() {
            this.logger.debug('on_display_container_splitpanes_resized');
            let payload = undefined;
            if (this.is_realtime)
            {
                payload = {
                    mode: 'realtime',
                    tracks_size: undefined,
                    map_container_size: 100,
                };
                if (this.layout.panes.tracks.visible === true) {
                    payload.tracks_size = parseFloat(this.$refs.tracks_pane.style.height);
                }
                payload.map_container_size = parseFloat(this.$refs.map_container_pane.style.height);
            }
            else
            {
                payload = {
                    mode: 'archive',
                    tracks_size: undefined,
                    map_container_size: 100,
                    content_size: undefined,
                };
                if (this.layout.panes.tracks.visible === true) {
                    payload.tracks_size = parseFloat(this.$refs.tracks_pane.style.height);
                }
                if (this.layout.panes.content.visible === true) {
                    payload.content_size = parseFloat(this.$refs.content_pane.style.height);
                }
                payload.map_container_size = parseFloat(this.$refs.map_container_pane.style.height);
            }
            this.logger.debug('Commit payload: ', payload);
            this.$store.commit('set_display_container_pane_size', payload);
        },

        on_pgv_map_resize() {
            this.logger.debug('Resizing the PgvMap.');
            this.$store.getters.leaflet_map.map_object.invalidateSize();
            this.logger.debug('Map state invalidated.');
        },
    },
    computed: {
        is_realtime: function() {
            return this.$store.getters.is_realtime; 
        },

        is_archive: function() {
            return this.$store.getters.is_archive; 
        },

        stations: function() {
            return this.$store.getters.station_meta;
        },

        layout: function() {
            return this.$store.getters.layout;
        },

        map_info_accordion: function() {
            return this.$store.getters.map_info_accordion;
        },

        map_info_accordion_expanded: {
            get() {
                return [this.map_info_accordion.map_info.expanded,
                        this.map_info_accordion.event_monitor.expanded,
                        this.map_info_accordion.recent_events.expanded,
                        this.map_info_accordion.station_info.expanded];
            },

            set(value) {
                this.$store.commit('set_map_info_accordion_expanded', value);
            },
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

        ehow_event_detection: {
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
    min-height: 100%

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
