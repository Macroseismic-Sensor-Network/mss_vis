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
    <div>
        <div v-if="!is_loaded">
            <w-spinner bounce/><w-spinner bounce/><w-spinner bounce/>Loading {{ supplement_id }}
        </div>
        <w-button class="ma1" 
                  v-if="is_loaded"
                  v-on:click="on_button_clicked">
            {{ label }}
        </w-button>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import L from 'leaflet';

export default {
    name: 'EventSupplementButton',
    props: {
        public_id: String,
        category: String,
        name: String,
    },
    components: {
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);

    },
    mounted() {
        this.logger.debug('The Component is mounted.');
        if (this.is_shown)
        {
            this.plot_layer();
        }
    },
    data() {
        return {
            layer: undefined,
        };
    },
    watch: {
        is_shown: function(new_state) {
            if (new_state)
            {
                this.plot_layer();
            }
            else
            {
                this.supplement_group.removeLayer(this.layer);
            }
        },

        public_id: function() {
            this.logger.debug('The public_id has changed.');
            this.logger.debug(this.is_shown);
            if (this.is_shown)
            {
                this.logger.debug('Removing the layer.')
                this.supplement_group.removeLayer(this.layer);
                this.logger.debug('Plotting the layer.')
                this.logger.debug(this.is_loaded);
                this.plot_layer();
            }
        },

        is_loaded: function() {
            this.logger.debug('The is_loaded state has changed.');
            this.logger.debug(this.is_shown);
            if (this.is_shown)
            {
                this.logger.debug('Removing the layer.')
                this.supplement_group.removeLayer(this.layer);
                this.logger.debug('Plotting the layer.')
                this.logger.debug(this.is_loaded);
                this.plot_layer();
            }
        },
    },
    computed: {
        is_loaded: function() {
            if (this.supplement_data === undefined) {
                return false;
            }
            else {
                return true;
            }
        },

        is_shown: function() {
            return this.$store.getters.is_event_supplement_shown(this.supplement_id)
        },

        label: function() {
            let prefix = '';
            if (this.is_shown)
            {
                prefix = 'hide ';
            }
            else
            {
                prefix = 'show ';
            }
            return prefix + this.category + '/' + this.name;
        },

        supplement_id: function() {
            return this.category + '/' + this.name;
        },

        supplement_data: function() {
            if (this.public_id)
            {
                return this.$store.getters.get_event_supplement(this.public_id,
                                                                this.category,
                                                                this.name);
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

        display_settings: function() {
            return this.$store.getters.display_settings;
        },
    },
    methods: {
        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },

        on_button_clicked: function() {
            this.logger.debug('Supplement button clicked.');
            let payload = { supplement_id: this.supplement_id };
            this.$store.commit('toggle_supplement_layer', payload);
        },

        plot_layer: function() {
            switch (this.supplement_id)
            {
                case 'eventpgv/pgvstation':
                    this.on_show_pgvstation();
                    break;

                case 'eventpgv/pgvvoronoi':
                    this.on_show_pgvvoronoi();
                    break;
            }
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
            this.layer = L.geoJSON(this.supplement_data,
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
                                                    return L.circleMarker(lat_lon, marker_style);
                                               },
                                           }
                                          );
            this.supplement_group.addLayer(this.layer);
            this.layer.bringToFront();
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
            this.layer = L.geoJSON(this.supplement_data,
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
            this.supplement_group.addLayer(this.layer);
            this.layer.bringToBack();
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
