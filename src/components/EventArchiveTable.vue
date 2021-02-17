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
    <div class="event-archive-table">
        <w-table :headers="table_headers"
                 :items="table_items"
                 v-bind:select-row="true"
                 @row-select="on_row_select($event)">
        </w-table>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import * as moment from 'moment';

export default {
    name: 'EventArchiveTable',
    props: {},
    components: {
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
        moment.locale(this.$store.getters.language);
    },
    data() {
        return {
            table_headers: [
                    { label: 'public ID', key: 'public_id' },
                    { label: 'Start', key: 'start_time' },
                    { label: 'Ende', key: 'end_time' },
                    { label: 'Dauer [s]', key: 'duration' },
                    { label: 'PGV [mm/s]', key: 'pgv' },
                    { label: '#Detektionen', key: 'num_detections' },
                    { label: '#Stationen', key: 'num_stations' },
                ],
        };
    },
    computed: {
        event_archive: function() {
            let event_archive = this.$store.getters.event_archive;
            return Object.values(event_archive).sort((a, b) => (a.start_time < b.start_time) ? 1 : -1);
        },

        utc_offset: function() {
            return this.$store.getters.utc_offset;
        },

        table_items: function() {
            let items = [];
            for (let cur_key in this.event_archive)
            {
                let cur_event = this.event_archive[cur_key]
                let cur_start = moment.utc(cur_event.start_time);
                let cur_end = moment.utc(cur_event.end_time);
                items.push(
                    { 
                        public_id: cur_event.public_id,
                        start_time: this.get_local_time_str(cur_start),
                        end_time: this.get_local_time_str(cur_end),
                        duration: cur_event.length.toString(),
                        pgv: (cur_event.max_pgv * 1000).toFixed(3),
                        num_detections: cur_event.num_detections.toString(),
                        num_stations: cur_event.triggered_stations.length.toString()
                    });
            }
            return items;
        },
    },
    methods: {
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

        on_row_select(selected_row) {
            var payload = { public_id: selected_row.item.public_id };
            this.$store.dispatch('view_event_in_archive', payload);
        },
    },
}

</script>

<style scoped lang="sass">

div.event-archive-table
    width: 100%
    height: 100%
    overflow: auto

</style>
