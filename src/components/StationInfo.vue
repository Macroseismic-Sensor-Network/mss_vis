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
    <!--
    <div class="grid-container" style="overflow: auto;">
        <div class="grid-x grid-margin-x">
            <div class="cell small-12"><b>{{ station_id }}</b></div>
            <div class="cell small-12"><i>{{ description }}</i></div>
            <div class="cell small-6"><span class="float-right text-right" style="min-width: 9rem;">latest PGV [mm/s]:</span></div>
            <div class="cell small-6">{{ (pgv * 1000).toFixed(3) }}</div>
            <div class="cell small-6"><span class="float-right text-right" style="min-width: 9rem;">  max. PGV [mm/s]:</span></div>
            <div class="cell small-6">{{ (pgv_max * 1000).toFixed(3) }}</div>
            <div class="cell auto"></div>
            <div class="cell shrink">
                <a v-on:click="on_show_pgv_timeseries" class="button tiny float-right">{{ pgv_track_label }}</a>
            </div>
            <div class="cell shrink">
                <a v-on:click="on_remove_from_inspect" class="button tiny float-right">close</a>
            </div>
        </div>
    </div>
    -->
    <div style="width: 100%;">
        <div class="station-info-item"><b>{{ name }}</b></div>
        <div class="station-info-item"><i>{{ description }}</i></div>
        <div class="station-info-item"><i>{{ station_id }}</i></div>
        <div class="station-info-item"><span class="text-right station-info-attribute">latest PGV [mm/s]:</span>{{ (pgv * 1000).toFixed(3) }}</div>
        <div class="station-info-item"><span class="text-right station-info-attribute">  max. PGV [mm/s]:</span>{{ (pgv_max * 1000).toFixed(3) }}</div>
        <w-flex class="wrap">
            <w-button class="ma1" 
                      v-on:click="on_show_pgv_timeseries">
                {{ pgv_track_label }}
            </w-button>
            <w-button class="ma1"
                      v-on:click="on_remove_from_inspect">
                close
            </w-button>
        </w-flex>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'StationInfo',
    props: {
        station_id: String,
    },
    components: {},
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },
    computed: {
        pgv: function() {
            return this.$store.getters.current_pgv_by_station(this.station_id);
        },

        pgv_max: function() {
            return this.$store.getters.transparent_range_max_pgv_by_station(this.station_id);
        },

        station_meta: function() {
            return this.$store.getters.station_meta_by_id(this.station_id);
        },

        name: function() {
            let cur_meta = this.station_meta;
            if (cur_meta == undefined)
            {
                return '';
            }
            else
            {
                return cur_meta.name;
            }

        },

        description: function() {
            let cur_meta = this.station_meta;
            if (cur_meta == undefined)
            {
                return '';
            }
            else
            {
                return cur_meta.description;
            }
        },

        tracks: function() {
            return this.$store.getters.tracks;
        },

        pgv_track_shown: function() {
            return this.$store.getters.pgv_timeseries_shown(this.station_id);
        },

        pgv_track_label: function() {
            if (this.pgv_track_shown)
            {
                return "hide pgv track";  
            }
            else
            {
                return "show pgv track";  
            }
        },
    },
    methods: {
        on_remove_from_inspect: function() {
            this.$store.commit('remove_inspect_station', this.station_id);

            if (this.pgv_track_shown)
            {
                this.$store.commit('remove_track_pgv_timeseries', this.station_id);
            }
        },

        on_show_pgv_timeseries: function() {
            if (this.pgv_track_shown)
            {
                this.$store.commit('remove_track_pgv_timeseries', this.station_id);
            }
            else
            {
                this.$store.commit('add_track_pgv_timeseries', this.station_id);
            }

        },

    },
}

</script>

<style scoped lang="sass">

div.station-info-item
    width: 100%
    font-size: 10pt

    a
        margin-left: 5px
        margin-top: 2px

span.station-info-attribute
    min-width: 9rem
    margin-right: 4px
    font-size: 10pt
    display: inline-block

</style>
