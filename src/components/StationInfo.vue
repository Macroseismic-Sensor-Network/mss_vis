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
    <div class="grid-container" style="overflow: auto; height: 100%; width: 100%;">
        <div class="grid-x grid-margin-x">
            <div class="cell small-12"><b>{{ station_id }}</b></div>
            <div class="cell small-12"><i>{{ description }}</i></div>
        </div>
        <div class="grid-x grid-margin-x">
            <div class="cell shrink"><span class="float-right text-right" style="min-width: 9rem;">latest PGV [mm/s]:</span></div>
            <div class="cell auto">{{ (pgv * 1000).toFixed(3) }}</div>
        </div>
        <div class="grid-x grid-margin-x">
            <div class="cell shrink"><span class="float-right text-right" style="min-width: 9rem;">  max. PGV [mm/s]:</span></div>
            <div class="cell auto">{{ (pgv_max * 1000).toFixed(3) }}</div>
        </div>
        <div class="grid-x grid-margin-x">
            <div class="cell small-12">
                <a v-on:click="on_show_pgv_timeseries" class="button tiny float-right">show pgv track</a>
                <a v-on:click="on_remove_from_inspect" class="button tiny float-right">close</a>
            </div>
        </div>
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
            return this.$store.getters.disp_range_max_pgv_by_station(this.station_id);
        },

        station_meta: function() {
            return this.$store.getters.station_meta_by_id(this.station_id);
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
    },
    methods: {
        on_remove_from_inspect: function() {
            this.$store.commit('remove_inspect_station', this.station_id);
        },

        on_show_pgv_timeseries: function() {
            this.$store.commit('add_track_pgv_timeseries', this.station_id);
        },

    },
}

</script>
