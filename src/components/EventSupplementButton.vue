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
        <w-toolbar>
            <div class="title3">{{ title }}</div>
            <div class="spacer"></div>
            <w-tooltip left>
                <template #activator="{ on }">
                    <w-button :icon="download_icon"
                              :loading="!is_loaded"
                              :disabled="!is_available"
                              v-on="on"
                              v-on:click="on_download_clicked"
                              text
                              lg
                              class="ml3"></w-button>
                </template>{{ download_tooltip }}
            </w-tooltip>
            <w-tooltip left>
                <template #activator="{ on }">
                    <w-button :icon="show_icon"
                              :loading="!is_loaded"
                              :disabled="!is_available"
                              v-on="on"
                              v-on:click="on_show_clicked"
                              text
                              lg
                              class="ml3"></w-button>
                </template>{{ show_tooltip }}
            </w-tooltip>
        </w-toolbar>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
//import L from 'leaflet';
//import 'leaflet-timedimension';

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
    },
    data() {
        return {
            layer: undefined,
            lang_title: {
                eventpgv: {
                    pgvstation: 'PGV Stationsmaker',
                    pgvvoronoi: 'PGV Voronoizellen',
                    isoseismalfilledcontour: 'Isoseisten',
                },
                pgvsequence: {
                    pgvstation: 'PGV Stationsmarker Zeitreihe',
                    pgvvoronoi: 'PGV Voronoizellen Zeitreihe',
                }
            },
        };
    },
    watch: {
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

        active_event: function() {
            return this.$store.getters.active_recent_event;
        },


        is_available: function() {
            if (this.is_loaded)
            {
                if (Object.keys(this.supplement_data).length === 0)
                    return false;
                else
                    return true;
            }
            else
                return false;
        },


        show_icon: function() {
            if (this.is_shown)
                return 'mdi mdi-eye';
            else
                return 'mdi mdi-eye-off';
        },

        show_tooltip: function() {
            if (this.is_available)
            {
                if (this.is_shown)
                    return 'verstecke';
                else
                    return 'zeige';
            }
            else
                return 'nicht verfügbar';
        },

        download_icon: function() {
            return 'mdi mdi-download-circle';
        },

        download_tooltip: function() {
            if (this.is_available)
            {
                return 'download GeoJSON';
            }
            else
                return 'nicht verfügbar';
        },


        title: function() {
            return this.lang_title[this.category][this.name];
        },

        is_shown: function() {
            return this.$store.getters.is_event_supplement_shown(this.category, this.name)
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
    },
    methods: {
        on_show_clicked: function() {
            let payload = { category: this.category,
                            name: this.name };
            this.$store.commit('toggle_supplement_layer', payload);
        },

        on_download_clicked: function() {
            this.logger.debug('Download the GeoJSON data.');
            let supplement_data = this.supplement_data;
            supplement_data.properties = { public_id: this.public_id,
                                           event_start: this.active_event.start_time,
                                           event_end: this.active_event.end_time,
                                           license: 'CC-BY-SA 4.0'}
            let json_data = JSON.stringify(this.supplement_data);
            let data_blob = new Blob([json_data], {type: "text/json"});
            let data_url = URL.createObjectURL(data_blob);
            let download_link = document.createElement("a");
            download_link.href = data_url;
            download_link.download = this.public_id + '_' + this.category + '_' + this.name + '.geojson';
            document.body.appendChild(download_link);
            download_link.click();
            document.body.removeChild(download_link);
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
