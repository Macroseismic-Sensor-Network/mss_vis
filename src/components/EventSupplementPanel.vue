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
    <w-flex column
         v-if="active_event != undefined">
            <EventSupplementButton v-for="cur_supplement in supplements"
                                   v-bind:key="cur_supplement.category + '_' + cur_supplement.name"
                                   v-bind:public_id="public_id"
                                   v-bind:category="cur_supplement.category"
                                   v-bind:name="cur_supplement.name"/>
    </w-flex>
</template>

<script>

import EventSupplementButton from '../components/EventSupplementButton'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import L from 'leaflet';

export default {
    name: 'EventSupplementPanel',
    props: {},
    components: {
        EventSupplementButton,
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },
    data() {
        return {
            supplements: [
                { category: 'eventpgv',
                  name: 'pgvstation'},
                { category: 'eventpgv',
                  name: 'pgvvoronoi'},
                { category: 'pgvsequence',
                  name: 'pgvstation'},
                { category: 'pgvsequence',
                  name: 'pgvvoronoi'},
            ],
        };
    },
    watch: {
    },
    computed: {
        public_id: function() {
            if (this.active_event)
            {
                return this.active_event.public_id;
            }
            else
            {
                return undefined;
            }
        },

        active_event: function() {
            return this.$store.getters.active_archive_event;
        },

        supplement_data: function() {
            if (this.public_id)
            {
                return this.$store.getters.get_event_supplement(this.public_id);
            }
            else
            {
                return undefined;
            }
        },

        supplement_data_state: function() {
            if (this.public_id)
            {
                return this.$store.getters.get_event_supplement_state(this.public_id);
            }
            else
            {
                return undefined;
            }

        },

        map: function() {
            return this.$store.getters.leaflet_map.map_object;
        },

        supplement_group: function() {
            return this.$store.getters.leaflet_map.layer_groups.event_supplement;
        },

        scales: function() {
            return this.$store.getters.scales;
        },
    },
    methods: {
        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },

        on_show_pgvstation: function() {
            var self = this;
            let marker_style = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            this.logger.debug("Adding pgvstation layer.");
            let pgvstation = L.geoJSON(this.supplement_data.pgvstation,
                                           {
                                               pointToLayer: function(feature, lat_lon) {
                                                    if( feature.properties.pgv) {
                                                        marker_style.fillColor = self.pgv_to_color(feature.properties.pgv);
                                                    }
                                                    else
                                                    {
                                                        marker_style.fillColor = '#777777';
                                                    }
                                                    marker_style.radius = self.scales.radius(feature.properties.pgv);
                                                    self.logger.debug("marker_style", marker_style);
                                                    return L.circleMarker(lat_lon, marker_style);
                                               },
                                           }
                                          );
            this.supplement_group.addLayer(pgvstation);
        },

        on_show_pgvvoronoi: function() {
            var self = this;
            let voronoi_style = {
                fillColor: "#ffffff",
                color: "#000000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.3,
            };
            this.logger.debug("Adding pgvvoronoi.");
            let pgvvoronoi = L.geoJSON(this.supplement_data.pgvvoronoi,
                                           {
                                                style: function(feature) {
                                                    voronoi_style.fillColor = self.pgv_to_color(feature.properties.pgv);
                                                    if (feature.properties.triggered === true)
                                                    {
                                                        voronoi_style.fillOpacity = 1;
                                                    }
                                                    else
                                                    {
                                                        voronoi_style.fillOpacity = 0.3;
                                                    }
                                                    return voronoi_style;
                                                },
                                           }
            );
            this.supplement_group.addLayer(pgvvoronoi);
        },
    },
}

</script>

<style scoped lang="sass">

div.event-supplement-panel
    height: 100%
    width: 100%
    overflow: auto

span.supplement-info
    margin: 0px
    padding: 2px
    display: inline-block
    text-align: left
    width: 100%
    font-size: 10pt

</style>
