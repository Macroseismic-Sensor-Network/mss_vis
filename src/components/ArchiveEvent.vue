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
    <div class="archive_event"><span class="archive_event" v-bind:class="{ active: is_active }" v-bind:style="{backgroundColor: color}" v-on:click="show_event">{{ event_id }} ({{ (max_pgv * 1000).toFixed(3) }} mm/s)</span><br></div>
</template>


<script>
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'ArchiveEvent',

    props: {
        id: String,
        pos: Number,
    },

    data() {
        return {
            logger: undefined,
        };
    },

    created() {
        this.logger = log.getLogger(this.$options.name);
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
                         this.$store.getters.prefix_options);
    },


    computed: {
        event_id: function() {
            return this.id.slice(0, -7);
        },

        max_pgv: function() {
            return this.$store.getters.archive_event_max_pgv(this.pos);
        },

        color: function() {
            return this.pgv_to_color(this.max_pgv);
        },

        current_event: function() {
            return this.$store.getters.event_archive[this.pos];
        },

        scales: function() {
            return this.$store.getters.scales;
        },

        is_active: function() {
            var active_event_pos = this.$store.getters.map_control.show_archive_event;

            if (this.pos === active_event_pos)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    },

    methods: {
        show_event()
        {
            this.logger.debug("Showing event: " + this.pos);
            var payload = { pos: this.pos };
            this.$store.commit('set_show_archive_event', payload);
        },

        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },
    },
}
</script>


<style scoped lang="sass">

div.archive_event
    margin-bottom: 5px

span.archive_event
    cursor: pointer
    margin-bottom: 5px
    padding: 2px
    border-radius: 4px

span.archive_event:hover
    background-color: LightBlue !important

span.active
    background-color: LightGreen !important


</style>
