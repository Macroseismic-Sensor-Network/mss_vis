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
    <div class="event-monitor-panel">
        <span id="map_info_server_state" class="event-monitor-info">state: {{ current_event_state }}</span>
        <span id="map_info_last_data"
              class="event-monitor-info"
              v-if="event_available">
            start: {{ current_event_start }} UTC
        </span>
        <span id="map_info_first_data"
              class="event-monitor-info"
              v-if="event_available">
            end: {{ current_event_end }} UTC
        </span>
        <span id="map_info_server_state"
              class="event-monitor-info"
              v-if="event_available">
            max PGV: {{ (current_event_max_pgv * 1000).toFixed(3) + ' mm/s'}}
        </span>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'EventMonitorPanel',
    props: {},
    components: {
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },
    computed: {
        current_event: function() {
            return this.$store.getters.current_event;
        },

        event_available: function() {
            if ('state' in this.current_event)
                return true;
            else
                return false;
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
                return "Waiting for event trigger.";
            }
        },
    },
}

</script>

<style scoped lang="sass">

div.event-monitor-panel
    height: 100%
    width: 100%
    overflow: auto

span.event-monitor-info
    cursor: pointer
    margin: 0px
    padding: 2px
    display: inline-block
    text-align: left
    width: 100%
    font-size: 10pt

</style>
