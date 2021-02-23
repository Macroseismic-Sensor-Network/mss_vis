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
    <div class="archive_event">
        <span class="archive_event"
              v-bind:class="{ active: is_active }"
              v-bind:style="{backgroundColor: color}"
              v-on:click="show_event">
                {{ event_time }} ({{ (max_pgv * 1000).toFixed(3) }} mm/s)
        </span>
        <br>
    </div>
</template>


<script>
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import * as moment from 'moment';

export default {
    name: 'RecentEvent',

    props: {
        public_id: String,
        db_id: Number,
        start_time: String,
        end_time: String,
        max_pgv: Number,
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
        event_time: function() {
            return this.get_local_time_str(moment.utc(this.start_time))
        },

        color: function() {
            return this.pgv_to_color(this.max_pgv);
        },

        current_event: function() {
            return this.$store.getters.recent_events[this.pos];
        },

        scales: function() {
            return this.$store.getters.scales;
        },

        is_active: function() {
            var active_event_pos = this.$store.getters.map_control.show_archive_event;

            if (this.public_id === active_event_pos)
            {
                return true;
            }
            else
            {
                return false;
            }
        },

        utc_offset: function() {
            return this.$store.getters.utc_offset;
        },
    },

    methods: {
        show_event()
        {
            this.logger.debug("Showing event: " + this.public_id);
            var payload = { public_id: this.public_id };
            this.$store.dispatch('view_recent_event_in_archive', payload);
            //payload = { mode: 'archive' }
            //this.$store.dispatch('set_display_mode', payload);
            //this.$store.dispatch('load_event_supplement');
            //this.$store.getters.utm_to_wgs84;
        },

        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },
        
        get_local_time_str(time_utc) {
            let local_time = this.utc_to_local_time(time_utc);
            return this.format_time(local_time);
        },

        utc_to_local_time(time_utc) {
            let time_local = time_utc.utcOffset(this.utc_offset / 60);
            return time_local;
        },

        format_time(time) {
            let time_format = this.$store.getters.time_format;
            return time.format(time_format);
        },
    },
}
</script>


<style scoped lang="sass">

div.archive_event
    margin-bottom: 5px
    width: 100%

span.archive_event
    cursor: pointer
    margin: 0px
    padding: 2px
    border-radius: 4px
    display: inline-block
    text-align: center
    width: 100%
    font-size: 10pt


span.archive_event:hover
    background-color: LightBlue !important

span.active
    background-color: LightGreen !important


</style>
