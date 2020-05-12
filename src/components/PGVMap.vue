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
        <!--
        <Settings/>
        -->

        <div id="mapid">

        </div>

        <!-- SVG templates are added to the leaflet SVG overlay in the mounted
            function. -->
        <svg id="svg_template_pgv_marker">
            <g id="current_pgv_marker">
                <PGVMapMarker v-on:open-popup="setPopUp($event)"
                              v-for="cur_station in stations"
                              v-bind:key="cur_station.id"
                              v-bind:station_id="cur_station.id"
                              v-bind:lon="cur_station.x"
                              v-bind:lat="cur_station.y"/>
            </g>
        </svg>

        <svg id="svg_template_archive_plot">
            <ArchiveEventPlot />
        </svg>

        <svg id="svg_template_event_monitor">
            <EventMonitorPlot />
        </svg>
        <!-- End of templates. -->

        <div id="popUpLayer">
            <PGVPopUp />
        </div>

        <PGVPopUpPerma v-if="show_perma"
                       v-on:close-perma="closePerma()"/>

        <svg id="svg_legend" width="300px" height="140">
            <PGVLegend name="map_legend" v-if="showLegend"/>
        </svg>


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
    </div>


</template>


<script>
import $ from 'jquery';	
import Vue from 'vue';
import PGVMapMarker from '../components/PGVMapMarker.vue';
import PGVLegend from '../components/PGVLegend.vue';
//import PGVEventVoronoi from '../components/PGVEventVoronoi.vue';
import PGVPopUpPerma from '../components/PGVPopUpPerma.vue';
import ArchiveEvent from '../components/ArchiveEvent.vue';
import ArchiveEventPlot from '../components/ArchiveEventPlot.vue';
import EventMonitorPlot from '../components/EventMonitorPlot.vue';
import PGVPopUp from "../components/PGVPopUp.vue";
import * as d3 from "d3";
import domtoimage from 'dom-to-image';
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import L from 'leaflet';
import 'leaflet-easybutton';

export default {
    name: 'PGVMap',

    props: {
        title: String,
    },

    components: {
        PGVMapMarker,
        PGVLegend,
        EventMonitorPlot,
        ArchiveEvent,
        ArchiveEventPlot,
        PGVPopUp,
        PGVPopUpPerma,
    },

    data() {
        return {
            popUp: '',
            popUpData: {
                station_id:"",
                name:"",
                network:"",
                location: "",
                coords: "",
                utm_coords: "",
                description: "",
            },
            allOptions: 'undefined',
            map_image: 'undefined',
            //map_image_url: '/assets/vue/nrt/image/mss_map_with_stations.jpg',
            map_image_url: '/assets/vue/nrt/image/mss_map_clean.jpg',
            logger: undefined,
            showLegend:false,	//toggles the visibility off the legend
            show_perma:false,	//Toggles the PGVPopUpPerma Area
        };
    },

    beforeCreate() {
    },

    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },

    mounted() {
        //Leaflet map initialisieren
        this.leaflet_map=L.map("mapid", {
            maxBounds: [[47.1, 15.2],
                        [48.5, 17.5]],
            maxBoundsViscosity: 1.0,
        });
        this.map_image = new Image;
        this.init_map();
        //window.addEventListener('resize', this.on_resize);
        //this.$watch('radius', this.plot_stations);
        this.$store.commit("LOAD_STATION_METADATA");
        const vm = this;
        var checkExist = setInterval(function() {
            if (vm.$store.getters.stations_imported == true) {
                clearInterval(checkExist);
                vm.logger.debug("Stations: " + vm.$store.getters.station_meta.length);

                // Call invalidateSize to match the map to the container.
                // This is a dirty solution. I guess it works because loading the stations
                // or the interval takes some time. 
                // invalidateSize should be called, after the site has been built, but
                // I don't know how to do that.
            }
        }, 100);


        //window.addEventListener('resize', this.on_resize);
        //this.leaflet_map.on("moveend", this.updateMarkers);
        this.leaflet_map.on("zoomend", this.handle_map_zoomend);
        this.showLegend=this.$store.getters.settings.show_legend;

        // Get the svg marker template and add it to the leaflet svg overlay.
        $('#svg_template_pgv_marker').find('#current_pgv_marker').appendTo("#svg_overlay");
	$('#svg_template_pgv_marker').remove();

        // Get the svg archive event plot and add it to the leaflet svg overlay.
        $('#svg_template_archive_plot').find('*').appendTo("#svg_overlay");
	$('#svg_template_archive_plot').remove();

        // Get the svg event monitor plot and add it to the leaflet svg overlay.
        $('#svg_template_event_monitor').find('*').appendTo("#svg_overlay");
	$('#svg_template_event_monitor').remove();

        document.onreadystatechange = () => {
            if (document.readyState == "complete") {
                // Call invalidateSize after the whole document has been loaded.
                this.logger.info('Page completed with image and files!')
                this.leaflet_map.invalidateSize();
            }
        };
    },

    updated() {
    },

    computed: {
        leaflet_map: {
            get() {
                return this.$store.getters.leaflet_map.map_object;
            },

            set(map) {
                this.$store.commit('set_leaflet_map_object', map);
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
            var oe3d = L.tileLayer('/assets/vue/nrt/data/map/oe3d/{z}/{x}/{y}.jpg', 
                {
                    minZoom: 10,
                    maxZoom: 13,
                    tms: false,
                    attribution: 'Map based on OE3D and OpenStreetMap. Generated with QGis.',
                });

            var osm=L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
                {
                    minZoom:10,
                    maxZoom: 13,
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                });


            var allOptions= {
                "MSS OE3D": oe3d,
                "Open Streetmap": osm,	
            }

            oe3d.addTo(this.leaflet_map);

            L.control.layers(allOptions, null, {position: 'topleft', autoZIndex:false }).addTo(this.leaflet_map);
            L.easyButton('<span style="width: 44px; height: 44px; display: inline-block; font-size: 44px; background-color: white;">&equiv;</span>', function(){$('#off_canvas_settings').foundation('open');}).addTo(this.leaflet_map);

            this.leaflet_map.setView([47.8972,16.3507], 10);

            var svg=L.svg();
            svg.addTo(this.leaflet_map);

            //this.logger.debug("Overlays: "+d3.select(".leaflet-overlay-pane").count());
            d3.select(".leaflet-overlay-pane")
                .select("svg")
                .attr("id","svg_overlay");


            //this.show_image();
            //this.on_resize();
        },

        handle_map_zoomend() {
            this.logger.debug('handle_map_zoomend');
            this.$store.commit('toggle_leaflet_map_redraw');
            this.leaflet_map.invalidateSize();
        },

        setPopUp(station_id) {
            this.logger.debug("setPopUp: "+station_id);

            /*
            var curStation="undefined";
            var stations=this.$store.getters.station_meta;
            for(var i=0;i<this.$store.getters.station_meta.length;i++) {
                if(stations[i].id==station_id) {
                    curStation=stations[i];
                }
            }
            this.logger.debug("Station ID: "+curStation);

            this.popUpData.popUpId="pop-"+curStation.id;
            this.popUpData.station_id=curStation.id;
            this.popUpData.name=curStation.name;
            this.popUpData.network=curStation.network;
            this.popUpData.location=curStation.location;
            this.popUpData.coords="x: "+curStation.x+" y: "+curStation.y+" z: "+curStation.z;
            this.popUpData.utm_coords="x_utm: "+curStation.x_utm+" y_utm: "+curStation.y_utm;
            this.popUpData.description=curStation.description;

            this.logger.debug("Creating the component.");
            Vue.component("popUp_1",Vue.extend(PGVPopUp.default));
            this.popUp="popUp_1";
            */
        },

        closePopUp() {
            this.popUp='';	
        },

        //Hängt das offene Popup an die Perma anzeige an
        addPopUp() {
            this.$store.commit("add_pop_up",Vue.component(this.popUp));
            this.showPerma();
            this.closePopUp();
        },

        showPerma() {
            this.show_perma=true;
        },

        closePerma() {
            this.show_perma=false;
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
                self.logger.debug("Map image loaded.")
                map_svg.append("svg:image")
                    .attr('width', 4000)
                    .attr('height', 2500)
                    .attr('id', 'map_image')
                    .attr("xlink:href", self.map_image_url);
                d3.select('#map_image').lower();
                //self.on_resize();
            }
            this.logger.debug("Loading map image: " + this.map_image_url);
            this.map_image.src = this.map_image_url;
        },

        on_resize() {
            this.logger.debug("resize");
            var map_container = d3.select("#mapcontainer").node();
            var map_svg = d3.select("#svg_template");

            //const width = map_container.clientWidth;
            //const height = map_container.clientHeight;
            //this.logger.debug("Width: "+width);

            var map_bounds = map_container.getBoundingClientRect();
            map_svg.attr("width", map_bounds.width)
                .attr("height", window.innerHeight)
                .style("left", map_bounds.left + "px")
                .style("top", map_bounds.top + "px");

            //map_svg.attr("viewBox", "0 0 "+map_bounds.width+" "+window.innerHeight)

            this.logger.debug("width attr" + map_bounds.width);

            this.updateMarkers();


            //const scale = height / this.map_image.height;

            //const map_image = d3.select("#map_image");
            //map_image
            //    .attr('width', this.map_image.width * scale)
            //    .attr('height', this.map_image.height * scale)
        },

        capture_map() {
            // TODO: SVG images are not rendered by the domtoimage export.
            this.logger.debug('Capturing the map.');
            domtoimage.toPng(document.getElementById('mapcontainer'), {height: 2000})
                .then(function (dataUrl) {
                    var link = document.createElement('a');
                    link.download = 'my-image-name.png';
                    link.href = dataUrl;
                    link.click();
                });
        },

        on_click() {
            this.logger.debug("Clicked the map.");
        },
    },
}
</script>
<style>
#svg_legend {
    background-color:rgba(181,181,181,0.62);
    position: absolute; 
    bottom:20px; 
    right:5px; 
    z-index:500;
    border-radius: 25px;
}

#map_info{
    background-color:rgba(181,181,181,0.62);
    position: absolute; 
    top:5px; 
    right:5px; 
    z-index:500;
    border-radius: 25px;
}
</style>

<style scoped lang="sass">
$breakpoint-mobile-width: 700px
$breakpoint-mobile-height: 350px

div#mapid
    height: 100%
    width: 100%
    cursor: default

div#mapcontainer
    height: 100%
    position: relative
    font-family: Helvetica, sans-serif

div#map_info
    position: absolute
    text-align: right
    font-size: 8pt
    font-family: Helvetica, sans-serif
    padding: 5px
    z-index:500

div#map_config
    position: absolute
    text-align: left
    font-size: 8pt
    font-family: Helvetica, sans-serif
    padding: 5px

svg#map
    border: none

@media (max-width: $breakpoint-mobile-width), (max-height: $breakpoint-mobile-height)
    div#map_info
        font-size: 8pt
        visibility: hidden

    #svg_legend
        visibility: hidden
</style>
