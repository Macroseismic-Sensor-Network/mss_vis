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
        <w-flex wrap class="text-left"
                 v-if="!event_available">
            <div class="xs12 pa1">Warte auf the Start eines Ereignisses.</div>
        </w-flex>
        <w-flex column
                 v-if="event_available">
            <w-flex wrap>
                <div class="pr2 text-bold">public id:</div>
                <div class="grow">{{ public_id }}</div>
            </w-flex>

            <w-flex wrap>
                <div class="pr2 text-bold">Start:</div>
                <div class="grow">{{ event_start }}</div>
            </w-flex>

            <w-flex wrap>
                <div class="pr2 text-bold">Ende:</div>
                <div class="grow">{{ event_end }}</div>
            </w-flex>

            <w-flex wrap>
                <div class="pr2 text-bold">PGV:</div>
                <div class="grow">{{ pgv }} mm/s</div>
            </w-flex>

            <w-flex wrap>
                <div class="pr2 text-bold">Dauer:</div>
                <div class="grow">{{ duration }} s</div>
            </w-flex>

            <w-flex wrap>
                <div class="pr2 text-bold">Anzahl der Detektionsdreiecke:</div>
                <div class="grow">{{ num_detections }}</div>
            </w-flex>

            <w-flex wrap>
                <div class="grow text-bold">getriggerte Stationen: {{ num_stations }}</div>
            </w-flex>
        </w-flex>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import * as moment from 'moment';

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
        
        public_id: function() {
            if (this.event_available)
            {
                return this.current_event.public_id;
            }
            else
            {
                return undefined;
            }
        },
        
        event_start: function() {
            if (this.event_available)
            {
                return this.get_local_time_str(moment.utc(this.current_event.start_time));
            }
            else
            {
                return undefined;
            }
        },

        event_end: function() {
            if (this.event_available)
            {
                let cur_start = moment.utc(this.current_event.end_time);
                let time_str = this.get_local_time_str(cur_start);
                this.logger.debug("cur_start: ", cur_start);
                this.logger.debug("time_str: ", time_str);
                return this.get_local_time_str(cur_start);
            }
            else
            {
                return undefined;
            }
        },
        
        pgv: function() {
            if (this.event_available)
            {
                return (this.current_event.max_pgv * 1000).toFixed(3);
            }
            else
            {
                return undefined;
            }
        },

        duration: function() {
            if (this.event_available)
            {
                return this.current_event.length.toString();
            }
            else
            {
                return undefined;
            }
        },
        
        triggered_stations: function() {
            if (this.event_available)
            {
                let triggered_stations = []
                for (let cur_nsl of this.current_event.triggered_stations)
                {
                    let comps = cur_nsl.split(':');
                    triggered_stations.push(comps[1]);
                }
                return triggered_stations;
            }
            else
            {
                return undefined;
            }
        },

        num_stations: function() {
            if (this.event_available)
            {
                return this.current_event.triggered_stations.length;
            }
            else
            {
                return undefined;
            }
        },

        num_detections: function() {
            if (this.event_available)
            {
                return this.current_event.num_detections;
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
