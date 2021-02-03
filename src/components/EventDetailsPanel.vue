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
    <div class="event-details-panel">
        <div class="event-details-panel"
             v-if="active_event === undefined">
            <span class="event-info">Please select an event to display.</span>
        </div>
        <div class="event-details-panel"
             v-if="active_event != undefined">
            <span class="event-info"><b>public id:</b> {{ public_id }}</span>
            <span class="event-info"><b>event start:</b> {{ event_start }}</span>
            <span class="event-info"><b>event end:</b> {{ event_end }}</span>
        </div>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'EventDetailsPanel',
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

        event_start: function() {
            if (this.active_event)
            {
                return this.active_event.start_time;
            }
            else
            {
                return undefined;
            }
        },

        event_end: function() {
            if (this.active_event)
            {
                return this.active_event.end_time;
            }
            else
            {
                return undefined;
            }
        },
    },
}

</script>

<style scoped lang="sass">

div.event-details-panel
    height: 100%
    width: 100%
    overflow: auto

span.event-info
    margin: 0px
    padding: 2px
    display: inline-block
    text-align: left
    width: 100%
    font-size: 10pt

</style>
