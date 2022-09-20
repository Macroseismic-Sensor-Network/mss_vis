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
    <div id="mapcontainer">

        <!--
        <Settings/>
        -->

        <div id="mapid">
          <w-menu v-model="show_display_menu"
                  z-index="600"
                  align-right="align-right">

                <template #activator="{ on }">
                  <w-button v-on="on"
                            color="black"
                            lg="lg"
                            bg-color="white"
                            class="display-menu">
                    {{ display_mode_label }}
                  </w-button>
                </template>

                <p>Anzeigemodus</p>
                <w-radios v-model="display_mode_selection"
                          :items="display_menu_items"
                          @input="on_select_display_mode"></w-radios>

            </w-menu>

        </div>
        <EventSupplementLayer v-for="cur_supplement in supported_supplements"
                              v-bind:key="cur_supplement.category + '_' + cur_supplement.name"
                              v-bind:category="cur_supplement.category"
                              v-bind:name="cur_supplement.name"/>

        <!-- SVG templates are added to the leaflet SVG overlay in the mounted
            function. -->
        <svg id="svg_template_pgv_marker">
            <g id="current_pgv_marker">
                <PGVMapMarker v-for="(cur_station, cur_nsl) in stations"
                              v-bind:key="cur_nsl"
                              v-bind:nsl_code="cur_nsl"
                              v-bind:lon="cur_station.lon"
                              v-bind:lat="cur_station.lat"/>
            </g>
        </svg>

        <!--
        <svg id="svg_template_archive_plot">
            <ArchiveEventPlot />
        </svg>
        -->

        <!--
        <svg id="svg_template_event_monitor">
            <EventMonitorPlot />
        </svg>
        -->
        <!-- End of templates. -->

        <svg id="svg_legend" width="300px" height="140">
            <PGVLegend name="map_legend" v-if="showLegend"/>
        </svg>
    </div>


</template>


<script>
import $ from 'jquery';	
import PGVMapMarker from '../components/PGVMapMarker.vue';
import PGVLegend from '../components/PGVLegend.vue';
import EventSupplementLayer from '../components/EventSupplementLayer.vue';
//import ArchiveEventPlot from '../components/ArchiveEventPlot.vue';
//import EventMonitorPlot from '../components/EventMonitorPlot.vue';
import * as d3 from "d3";
import domtoimage from 'dom-to-image';
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import L from 'leaflet';
import 'leaflet-easybutton';
import leafletImage from "leaflet-image";
import 'leaflet-timedimension';
import 'leaflet.tilelayer.colorfilter';

/**
 * @component components/PGVMap
 * @desc The map component holding the Leaflet map, the PGV markers, 
 * the legend and the event supplement layers.
 * @vue-prop {String} title The title of the map.
 * @vue-data {Object} logger=undefined The logger instance.
 * @vue-data {Boolean} showLegend=false The visibility of the legend.
 * @vue-data {Object} display_menu_items - The items of the display mode menu.
 * @vue-data {Boolean} show_display_menu=false The visibility of the display mode menu.
 * @vue-data {Object} leaflet_baselayers=undefined The base layers of the leaflet map.
 * @vue-computed {Object} leaflet_map - The Leaflet map object.
 * @vue-computed {Object} leaflet_time_dimension - The Leaflet Time Dimension object.
 * @vue-computed {Object} leaflet_time_dimension_player - The Leaflet Time Dimension player object.
 * @vue-computed {Object} leaflet_time_dimension_control - The Leaflet Time Dimension control object.
 * @vue-computed {String[]} leaflet_layer_filter - The Leaflet layer filter options. Handles the reduced saturation of the map in archive display mode.
 * @vue-computed {String} display_mode_selection - The display mode.
 * @vue-computed {String} display_mode_label - The label of the display mode.
 * @vue-computed {Object} data_time_range - The start- and end time of the available PGV data.
 */
export default {
    name: 'PGVMap',

    props: {
        title: String,
    },

    components: {
        PGVMapMarker,
        PGVLegend,
        EventSupplementLayer,
        //EventMonitorPlot,
        //ArchiveEventPlot,
    },

    data() {
        return {
            logger: undefined,
            showLegend:false,	//toggles the visibility off the legend
            display_menu_items: [
                    { label: 'Aktuell', value: 'realtime'},
                    { label: 'Archiv', value: 'archive'},
                ],
            show_display_menu: false,
            test_model: undefined,
            leaflet_baselayers: {},
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
            },
        );
        this.init_map();
        //this.$watch('radius', this.plot_stations);
        //this.$store.commit("LOAD_STATION_METADATA");
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
    watch: {
        is_realtime: function(new_state) {
            if (new_state)
            {
                this.logger.debug('Removing the timedimension control.');
                this.leaflet_map.removeControl(this.leaflet_time_dimension_control);
                let filter = [];
                this.leaflet_base_layers.mss_oe3d.updateFilter(filter);
                this.leaflet_base_layers.osm_osmde.updateFilter(filter);
                this.leaflet_base_layers.stamen_toner.updateFilter(filter);
                this.leaflet_base_layers.stamen_terrain.updateFilter(filter);
            }
            else
            {
                this.logger.debug('Adding the timedimension control.');
                this.leaflet_map.addControl(this.leaflet_time_dimension_control);
                let filter = ['saturate:10%'];
                this.leaflet_base_layers.mss_oe3d.updateFilter(filter);
                this.leaflet_base_layers.osm_osmde.updateFilter(filter);
                this.leaflet_base_layers.stamen_toner.updateFilter(filter);
                this.leaflet_base_layers.stamen_terrain.updateFilter(filter);
            }
        },
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

        leaflet_time_dimension: {
            get() {
                return this.$store.getters.leaflet_map.time_dimension.dimension;
            },
            set(time_dimension) {
                this.$store.commit('set_leaflet_time_dimension', time_dimension);
            }
        },

        leaflet_time_dimension_player: {
            get() {
                return this.$store.getters.leaflet_map.time_dimension.player;
            },
            set(player) {
                this.$store.commit('set_leaflet_time_dimension_player', player);
            }
        },

        leaflet_time_dimension_control: {
            get() {
                return this.$store.getters.leaflet_map.time_dimension.control;
            },
            set(control) {
                this.$store.commit('set_leaflet_time_dimension_control', control);
            }
        },

        leaflet_layer_filter: function() {
            let filter = [];
            if (!this.is_realtime)
                filter = ['saturate: 20%',];

            return filter
        },

        display_mode_selection: {
            get() {
                return this.$store.getters.display_mode; 
            },

            set(mode) {
                this.logger.debug('Setting display mode: ', mode);
                let payload = { mode: mode }
                this.$store.dispatch('set_display_mode', payload);
            },
        },

        display_mode_label: function() {
            let result = this.display_menu_items.filter(item => item.value === this.display_mode_selection);
            return result[0].label;
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

        is_realtime: function() {
            return this.$store.getters.is_realtime; 
        },

        supported_supplements: function() {
            return this.$store.getters.supported_supplements;
        },
    },

    methods: {
        init_map() {
            var oe3d = L.tileLayer.colorFilter('/assets/vue/nrt/data/map/oe3d/{z}/{x}/{y}.jpg', 
                {
                    minZoom: 10,
                    maxZoom: 13,
                    tms: false,
                    filter: [],
                    attribution: 'Map based on data from <a href="http://www.oe3d.at/">OE3D</a> and <a href="http://openstreetmap.org">OpenStreetMap</a>. Generated with <a href="https://www.qgis.org">QGis</a>.',
                    id: 'mss/oe3d',
                });

            var osm = L.tileLayer.colorFilter('https://tile.openstreetmap.de/{z}/{x}/{y}.png',
                {
                    minZoom: 10,
                    maxZoom: 13,
                    filter: [],
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                    id: 'osm/osm_de',
                });

            var stamen_toner = L.tileLayer.colorFilter('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
                {
                    minZoom: 10,
                    maxZoom: 13,
                    filter: [],
                    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.' + 
                    'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
                    id: 'stamen/toner',
                });

            var stamen_terrain = L.tileLayer.colorFilter('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
                {
                    minZoom: 10,
                    maxZoom: 13,
                    filter: [],
                    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.' + 
                    'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
                    id: 'stamen/terrain',
                });

            this.leaflet_base_layers = {
                mss_oe3d: oe3d,
                osm_osmde: osm,
                stamen_toner: stamen_toner,
                stamen_terrain: stamen_terrain,
            };

            var layer_options = {
                "MSS OE3D": oe3d,
                "OpenStreetMap": osm,
                "Stamen Terrain": stamen_terrain,
                "Stamen Toner": stamen_toner,
            }

            oe3d.addTo(this.leaflet_map);

            // Add the timecontrol stuff.
            this.leaflet_time_dimension = new L.TimeDimension({ period: 'PT0S',});
            this.leaflet_map.timeDimension = this.leaflet_time_dimension;
            this.leaflet_time_dimension_player = new L.TimeDimension.Player(
                {
                    transitionTime: 500,
                    loop: false,
                    startOver: true,
                },
                this.leaflet_time_dimension
            );

            let control_options ={
                timeSliderDragUpdate: true,
                loopButton: true,
                autoPlay: false,
                minSpeed: 1,
                maxSpeed: 5,
                speedStep: 1,
                player: this.leaflet_time_dimension_player,
            };
            this.leaflet_time_dimension_control = new L.Control.TimeDimension(control_options);

            //var on_export_image_click = this.map_to_image;
            L.control.layers(layer_options, null, {position: 'topleft', autoZIndex:false }).addTo(this.leaflet_map);

            /* Custom buttons */
            /*
            L.easyButton('<span style="width: 44px; height: 44px; display: inline-block; font-size: 44px; background-color: white;">&equiv;</span>', function(){$('#off_canvas_settings').foundation('open');}).addTo(this.leaflet_map);
            L.easyButton('<span style="width: 44px; height: 44px; display: inline-block; font-size: 44px; background-color: white;">&equiv;</span>', function(){on_export_image_click();}).addTo(this.leaflet_map);
            */

            this.leaflet_map.setView([47.8972,16.3507], 10);

            /* Remove the flag from the attribution prefix. */
            this.leaflet_map.attributionControl.setPrefix('<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>');

            var svg=L.svg();
            svg.addTo(this.leaflet_map);

            //this.logger.debug("Overlays: "+d3.select(".leaflet-overlay-pane").count());
            d3.select(".leaflet-overlay-pane")
                .select("svg")
                .attr("id","svg_overlay");
        },

        handle_map_zoomend() {
            this.logger.debug('handle_map_zoomend');
            this.$store.commit('toggle_leaflet_map_redraw');
            this.leaflet_map.invalidateSize();
        },

        calculate_path() {
            const scale = this.get_scales();
            const path = d3.line()
                .x((d, i) => scale.x(i))
                .y(d => scale.y(d));
            this.line = path(this.data)
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

        map_to_image() {
            this.logger.debug("Exporting the map to image.");

            this.save_svg($('#svg_overlay')[0], 'svg_overlay.svg');
            this.save_svg($('#svg_legend')[0], 'svg_legend.svg');

            let self = this;
            leafletImage(this.leaflet_map, function(err, canvas) {
                // now you have canvas
                // example thing to do with that canvas:
                var link = document.createElement('a');
                var img = document.createElement('img');
                var dimensions = self.leaflet_map.getSize();
                img.width = dimensions.x;
                img.height = dimensions.y;
                img.src = canvas.toDataURL();
                link.download = 'leaflet_map.png';
                link.href = canvas.toDataURL();
                link.click();
                //document.getElementById('images').innerHTML = '';
                //document.getElementById('images').appendChild(img);
            });
        },

        save_svg(svgEl, name) {
            svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            var svgData = svgEl.outerHTML;
            var preface = '<?xml version="1.0" standalone="no"?>\r\n';
            var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
            var svgUrl = URL.createObjectURL(svgBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = name;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },

        on_select_display_mode() {
            this.show_display_menu = false;
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

.display-menu
    position: relative
    float: right
    z-index: 500
    font-size: 14pt
    font-weight: bold
    margin-top: 10px
    margin-right: 10px

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
