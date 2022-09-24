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
    <w-app id="mss-display-container"
           class="cell auto">
            <div class="status-msg-container"
                 v-if="!is_operational">
              <w-alert info>
                {{ service_status_msg }}
              </w-alert>
            </div>
            <splitpanes class="default-theme"
                        horizontal
                        v-if="is_operational"
                        @resized="on_display_container_splitpanes_resized()">
                <!-- The tracks pane. --> 
                <pane :size="layout.panes.tracks.size.toString() + '%'"
                    :max-size="layout.panes.tracks.max_size"  
                    v-if="layout.panes.tracks.visible"
                    ref="tracks_pane">
                    <TracksPanel :key="tracksPanelKey"/>
                </pane>

                <!-- The main container. -->
                <pane :size="layout.panes.map_container.size.toString() + '%'"
                      ref="map_container_pane">
                  <splitpanes @resized="on_splitpanes_resized()">

                    <!-- The menu pane. -->
                    <!--
                    <pane :size="layout.panes.map_container.menu.size.toString() + '%'"
                          v-if="layout.panes.map_container.menu.visible"
                          ref="menu_pane">
                      Menu Pane
                    </pane>
                    -->

                    <!-- The diagram view pane. -->
                    <pane :size="layout.panes.map_container.diagram_view.size.toString() + '%'"
                          :max-size="layout.panes.map_container.diagram_view.max_size"
                          v-if="layout.panes.map_container.diagram_view.visible"
                          ref="diagram_view_pane">
                      <DiagramsPanel />
                    </pane>

                    <!-- The map pane. -->
                    <pane :size="layout.panes.map_container.map.size.toString() + '%'"
                          v-if="layout.panes.map_container.map.visible"
                          ref="map_pane">
                      <PGVMap :key="mapKey" 
                              v-resize:debounce="on_pgv_map_resize"/>
                    </pane>

                    <!-- The info pane for the realtime view. -->
                    <pane :size="layout.panes.map_container.info.size.toString() + '%'"
                          v-if="layout.panes.map_container.info.visible"
                          ref="map_info_pane">
                      <div style="overflow: scroll; height: 100%; background-color: white;">
                        <w-accordion :items="map_info_accordion_items"
                                     v-model="map_info_accordion_expanded" >
                          <template #item-title.supporter="">Unterstützt von</template>
                          <template #item-content.supporter=""><SupporterPanel key="supporter_panel_key"/></template>
                          <template #item-title.status="">Status</template>
                          <template #item-content.status=""><MapInfoPanel key="map_info_panel_key"/></template>
                          <template #item-title.event_monitor="">Ereignis Monitor</template>
                          <template #item-content.event_monitor=""><EventMonitorPanel key="event_monitor_panel_key"/></template>
                          <template #item-title.station_info="">Stationsdetails</template>
                          <template #item-content.station_info=""><StationInfoPanel key="station_info_panel_key"/></template>
                          <template #item-title.recent_events="">Aktuelle Ereignisse</template>
                          <template #item-content.recent_events=""><RecentEventInfoPanel key="archive_info_panel_key"/></template>
                        </w-accordion>
                      </div>
                    </pane>

                    <!-- The info pane for thearchive view.  -->
                    <pane :size="layout.panes.map_container.event_info.size.toString() + '%'"
                          v-if="layout.panes.map_container.event_info.visible"
                          ref="event_info_pane">
                      <div style="overflow: scroll; height: 100%; background-color: white;">
                        <w-accordion :items="event_info_accordion_items"
                                     v-model="event_info_accordion_expanded">
                          <template #item-title.supporter="">Unterstützt von</template>
                          <template #item-content.supporter=""><SupporterPanel key="supporter_panel_key"/></template>
                          <template #item-title.event_details="">Ereignisdetails</template>
                          <template #item-content.event_details=""><EventDetailsPanel key="event_details_panel_key"/></template>
                          <template #item-title.supplement_data="">Zusatzdaten</template>
                          <template #item-content.supplement_data=""><EventSupplementPanel key="event_supplement_panel_key"/></template>
                          <template #item-title.blast_info="">Spezifische Parameter</template>
                          <template #item-content.blast_info=""><BlastInfoPanel key="blast_info_panel_key"/></template>
                        </w-accordion>
                      </div>
                      
                    </pane>
                  </splitpanes>
                </pane>

                <!-- The table pane. -->
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

import DiagramsPanel from '../components/DiagramsPanel.vue'
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
import SupporterPanel from '../components/SupporterPanel.vue'
import BlastInfoPanel from '../components/BlastInfoPanel.vue'
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
                    diagramsPanelKey:0
            }
    },
    components: {
        // eslint-disable-next-line
        PGVMap,
        DiagramsPanel,
        MapInfoPanel,
        EventArchivePanel,
        EventMonitorPanel,
        EventDetailsPanel,
        EventSupplementPanel,
        RecentEventInfoPanel,
        StationInfoPanel,
        StationRealtimePanel,
        SupporterPanel,
        BlastInfoPanel,
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
            if (this.is_realtime) {
                payload = { mode: 'realtime',
                            map_size: 80,
                            info_size: 20 };
                payload.map_size = parseFloat(this.$refs.map_pane.style.width);
                payload.info_size = parseFloat(this.$refs.map_info_pane.style.width);
            }
            else if (this.is_archive) {
                payload = { mode: 'archive',
                            map_size: 80,
                            info_size: 20,
                            diagram_view_size: 0 };
                payload.map_size = parseFloat(this.$refs.map_pane.style.width);
                payload.info_size = parseFloat(this.$refs.event_info_pane.style.width);
                payload.diagram_view_size = parseFloat(this.$refs.diagram_view_pane.style.width);
            }
            this.logger.debug('Commit payload: ', payload);
            this.$store.commit('set_map_container_pane_size', payload);

            if (this.is_realtime) {
                this.logger.debug('map_info style: ', this.$refs.map_info_pane.style.width);
            }
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
        is_operational: function() {
            let status = this.$store.getters.service_status.status;
            if (status === 'operational') {
                return true;
            }
            else {
                return false;
            }
        },

        service_status_msg: function() {
            return this.$store.getters.service_status.msg;
        },
        
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

        event_info_accordion: function() {
            return this.$store.getters.event_info_accordion;
        },
        
        active_event: function() {
            return this.$store.getters.active_recent_event;
        },

        map_info_accordion_items: function() {
            return [{id: 'supporter'},
                    {id: 'status'},
                    {id: 'event_monitor'},
                    {id: 'station_info'},
                    {id: 'recent_events'}];
        },

        event_info_accordion_items: function() {
            let items = [{id: 'supporter'},
                         {id: 'event_details'},
                         {id: 'supplement_data'}];
            if (this.active_event) {
                if (this.active_event.event_class === 'sprengung') {
                    let duernbach_regions = ['Steinbruch Dürnbach',
                                             'Hohe Wand'];
                    if (duernbach_regions.includes(this.active_event.event_region)) {
                        items = [{id: 'supporter'},
                                 {id: 'event_details'},
                                 {id: 'blast_info'},
                                 {id: 'supplement_data'}];
                    }
                }
            }
            return items;
        },

        map_info_accordion_expanded: {
            get() {
                let ret = [];
                for (let k = 0; k < this.map_info_accordion_items.length; k++) {
                    let item = this.map_info_accordion_items[k]
                    ret.push(this.map_info_accordion[item.id].expanded)
                }
                return ret
            },

            set(value) {
                let payload = {};
                for (let k = 0; k < this.map_info_accordion_items.length; k++) {
                    let item = this.map_info_accordion_items[k]
                    payload[item.id] = value[k]
                }
                this.$store.commit('set_map_info_accordion_expanded', payload);
            },
        },

        event_info_accordion_expanded: {
            get() {
                let ret = [];
                for (let k = 0; k < this.event_info_accordion_items.length; k++) {
                    let item = this.event_info_accordion_items[k]
                    ret.push(this.event_info_accordion[item.id].expanded)
                }
                return ret
            },

            set(value) {
                let payload = {};
                for (let k = 0; k < this.event_info_accordion_items.length; k++) {
                    let item = this.event_info_accordion_items[k]
                    payload[item.id] = value[k]
                }
                this.$store.commit('set_event_info_accordion_expanded', payload);
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

    div.status-msg-container
      width: 100%
      height: 100%
      padding-top: 30px
      padding-left: 50px
      padding-right: 50px

</style>
