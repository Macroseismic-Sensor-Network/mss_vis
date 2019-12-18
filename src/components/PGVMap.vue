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
    <!--<div id="mapcontainer" @click.ctrl="capture_map">-->
    <div id="mapcontainer">
        <!--<svg id="map" viewBox="0 0 4000 2500" preserveAspectRatio="xMidYMid slice">-->
        <div id="map_info">last data: {{ data_time_range[1] }} UTC<br>
                           first data: {{ data_time_range[0] }} UTC<br>
                           server state: {{ server_state }}<br><br>
                           <b>event monitor</b><br>
                           <div id="current_event">
                               start: {{ current_event_start }}<br>
                               end: {{ current_event_end }}<br>
                               state: {{ current_event_state }}<br>
                               max PGV: {{ (current_event_max_pgv * 1000).toFixed(3) + ' mm/s'}}<br><br>
                           </div>

                           <b>archived events</b><br>
                           <ArchiveEvent v-for="(cur_event, index) in event_archive"
                                         v-bind:key="cur_event.start_time"
                                         v-bind:id="cur_event.start_time"
                                         v-bind:pos="index"/>

        </div>

        <div id="map_config">
            <input type='checkbox' v-model='show_event_monitor' />show event monitor<br>
            <input type='checkbox' v-model='show_event_warning' />show event warning<br>
            <!--<label><input type='checkbox' v-model='show_event_detection'/>show event detection</label><br>-->
            <input type='checkbox' v-model='show_detection_result' />show detection data<br>
        </div>

        <svg id="map"
             width="100%"
             height="100%"
             viewBox="0 0 4000 2500"
             preserveAspectRatio="xMidYMid meet">
            <PGVEventVoronoi event_id="mss_event_20191031T155000"/>
            <PGVMapMarker v-for="cur_station in stations" 
                          v-bind:key="cur_station.id"
                          v-bind:station_id="cur_station.id"
                          v-bind:x_utm="cur_station.x_utm"
                          v-bind:y_utm="cur_station.y_utm"/>

            <PGVLegend name="map_legend"/>
        </svg>
    </div>
</template>


<script>
import PGVMapMarker from '../components/PGVMapMarker.vue';
import PGVLegend from '../components/PGVLegend.vue';
import PGVEventVoronoi from '../components/PGVEventVoronoi.vue';
import ArchiveEvent from '../components/ArchiveEvent.vue';
import * as d3 from "d3";
import domtoimage from 'dom-to-image';

export default {
    name: 'PGVMap',

    props: {
        title: String,
    },

    components: {
        PGVMapMarker,
        PGVLegend,
        PGVEventVoronoi,
        ArchiveEvent,
    },

    data() {
        return {
            map_image: 'undefined',
            map_image_url: '/assets/vue/image/mss_map_with_stations.jpg',
        };
    },

    created() {
    },

    mounted() {
        this.map_image = new Image;
        this.init_map();
        //window.addEventListener('resize', this.on_resize);
        //this.$watch('radius', this.plot_stations);
        this.$store.commit("LOAD_STATION_METADATA");
    },

    computed: {
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

        data_time_range: function() {
            return this.$store.getters.data_time_range;
        },

        server_state: function() {
            return this.$store.getters.server_state;
        },

        stations: function() {
            return this.$store.getters.station_meta;
        },

        scales: function() {
            return this.$store.getters.scales;
        },

        current_event: function() {
            return this.$store.getters.current_event;
        },

        current_event_max_pgv: function() {
            var max_pgv = this.$store.getters.current_event_max_pgv;
            if (max_pgv)
            {
                return max_pgv;
            }
            else
            {
                return 0;
            }
        },

        current_event_start: function() {
            if ('start_time' in this.current_event)
            {
                return this.current_event.start_time;
            }
            else
            {
                return "";
            }
        },

        current_event_end: function() {
            if ('end_time' in this.current_event)
            {
                return this.current_event.end_time;
            }
            else
            {
                return "";
            }
        },
        
        current_event_state: function() {
            if ('state' in this.current_event)
            {
                return this.current_event.state;
            }
            else
            {
                return "No active event.";
            }
        },

        event_archive: function() {
            return this.$store.getters.event_archive;
        },
    },

    methods: {
        init_map() {
            this.show_image();
            //this.on_resize();
        },

        calculate_path() {
            const scale = this.get_scales();
            const path = d3.line()
                .x((d, i) => scale.x(i))
                .y(d => scale.y(d));
            this.line = path(this.data)
        },

        show_image() {
            let self = this;
            var map_svg = d3.select("#map");
            this.map_image.onload = function()
            {
                console.log("Image loaded.")
                map_svg.append("svg:image")
                    .attr('width', 4000)
                    .attr('height', 2500)
                    .attr('id', 'map_image')
                    .attr("xlink:href", self.map_image_url);
                d3.select('#map_image').lower();
            }
            console.log("Loading map image: " + this.map_image_url);
            this.map_image.src = this.map_image_url;
        },

        on_resize() {
            var map_container = d3.select("#mapcontainer").node();
            var map_svg = d3.select("#map");
            const width = map_container.clientWidth;
            const height = map_container.clientHeight;
            map_svg.attr("width", width)
                   .attr("height", height);
            //const scale = height / this.map_image.height;

            //const map_image = d3.select("#map_image");
            //map_image
            //    .attr('width', this.map_image.width * scale)
            //    .attr('height', this.map_image.height * scale)
        },

        capture_map() {
            // TODO: SVG images are not rendered by the domtoimage export.
            console.log('Capturing the map.');
            domtoimage.toPng(document.getElementById('mapcontainer'), {height: 2000})
                .then(function (dataUrl) {
                     var link = document.createElement('a');
                     link.download = 'my-image-name.png';
                     link.href = dataUrl;
                     link.click();
                });
        },

        on_click() {
            console.log("Clicked the map.");
        },
    },
}
</script>


<style scoped lang="sass">
$breakpoint-mobile-width: 700px
$breakpoint-mobile-height: 350px

div#mapcontainer
    height: 100%
    position: relative
    min-width: 500px
    min-height: 300px
    font-family: Helvetica, sans-serif

div#map_info
    position: absolute
    text-align: right
    font-size: 10pt
    font-family: Helvetica, sans-serif
    padding: 5px

div#map_config
    position: absolute
    text-align: left
    font-size: 10pt
    font-family: Helvetica, sans-serif
    padding: 5px

svg#map
    border: none

@media (max-width: $breakpoint-mobile-width), (max-height: $breakpoint-mobile-height)
    div#map_info
        font-size: 8pt
</style>
