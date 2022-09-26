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
    <w-flex wrap>
            <w-button round 
                class="ma1"
                :outline="!filter_no_filter"
                v-on:click="filter = 'no'">
                Kein Filter
            </w-button>
            
            <w-button round
                class="ma1"
                :outline="!filter_felt"
                v-on:click="filter = 'felt'">
                Wahrnehmbar
            </w-button>

            <w-button round
                class="ma1"
                :outline="!filter_earthquake"
                v-on:click="filter = 'earthquake'">
                Erdbeben
            </w-button>

            <w-button round
                class="ma1"
                :outline="!filter_blast_duernbach"
                v-on:click="filter = 'blast_duernbach'">
                Sprengung Dürnbach
            </w-button>

            <w-button round
                class="ma1"
                :outline="!filter_blast_hainburg"
                v-on:click="filter = 'blast_hainburg'">
                Sprengung Hainburg
            </w-button>
    </w-flex>
    <w-table :headers="table_header"
             :items="table_items"
             :fixed-headers="true"
             :selectable-rows="1"
             v-bind:select-row="true"
             style="height: 100%;"
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
            filter: 'felt',
        };
    },
    computed: {
        filter_no_filter: function() {
            if (this.filter === 'no')
                return true;
            else
                return false;
        },
        
        filter_felt: function() {
            if (this.filter === 'felt')
                return true;
            else
                return false;
        },

        filter_blast_duernbach: function() {
            if (this.filter === 'blast_duernbach')
                return true;
            else
                return false;
        },

        filter_blast_hainburg: function() {
            if (this.filter === 'blast_hainburg')
                return true;
            else
                return false;
        },

        filter_earthquake: function() {
            if (this.filter === 'earthquake')
                return true;
            else
                return false;
        },

        active_event: function() {
            return this.$store.getters.active_recent_event;
        },
        
        archive_events: function() {
            let archive_events = this.$store.getters.archive_events;
            archive_events = Object.values(archive_events);
            let duernbach_regions = ['steinbruch dürnbach',
                                             'hohe wand'];
            switch (this.filter)
            {
                case 'felt':
                    archive_events = archive_events.filter(cur_event => cur_event.max_pgv >= 0.0001);
                    break;
                case 'blast_duernbach':
                    archive_events = archive_events.filter(cur_event => (cur_event.event_class.toLowerCase() === 'sprengung' && duernbach_regions.includes(cur_event.event_region.toLowerCase())));
                    break;
                case 'blast_hainburg':
                    archive_events = archive_events.filter(cur_event => (cur_event.event_class.toLowerCase() === 'sprengung' && cur_event.event_region.toLowerCase() == 'steinbruch pfaffenberg'));
                    break;
                case 'earthquake':
                    archive_events = archive_events.filter(cur_event => (cur_event.event_class.toLowerCase() === 'erdbeben'));
                    break;
            }
            
            return archive_events.sort((a, b) => (a.start_time < b.start_time) ? 1 : -1)
        },

        utc_offset: function() {
            return this.$store.getters.utc_offset;
        },


        table_header: function() {
            let header = [];

            if (this.filter_blast_duernbach) {
                header = [{ label: 'public ID', key: 'public_id' },
                          { label: 'Start', key: 'start_time' },
                          { label: 'Dauer [s]', key: 'duration' },
                          { label: 'PGV [mm/s]', key: 'pgv' },
                          { label: 'Magnitude', key: 'magnitude'},
                          { label: 'f dom. [Hz]', key: 'f_dom'},
                          { label: 'Klasse', key: 'event_class'},
                          { label: 'Region', key: 'event_region'},
                          { label: 'Modus', key: 'event_class_mode'},
                          { label: 'Sprengnr.', key: 'foreign_id'},
                          { label: '#Detektionen', key: 'num_detections' },
                          { label: '#Stationen', key: 'num_stations' }];
                
            }
            else {
                header = [{ label: 'public ID', key: 'public_id' },
                          { label: 'Start', key: 'start_time' },
                          //{ label: 'Ende', key: 'end_time' },
                          { label: 'Dauer [s]', key: 'duration' },
                          { label: 'PGV [mm/s]', key: 'pgv' },
                          { label: 'Magnitude', key: 'magnitude'},
                          { label: 'Klasse', key: 'event_class'},
                          { label: 'Region', key: 'event_region'},
                          { label: 'Modus', key: 'event_class_mode'},
                          { label: '#Detektionen', key: 'num_detections' },
                          { label: '#Stationen', key: 'num_stations' }];
            }
            return header;
        },

        table_items: function() {
            let items = [];
            for (let cur_key in this.archive_events)
            {
                let cur_event = this.archive_events[cur_key]
                let cur_start = moment.utc(cur_event.start_time);
                let cur_end = moment.utc(cur_event.end_time);
                let cur_magnitude = cur_event.magnitude;
                let cur_f_dom = undefined;
                if (cur_magnitude) {
                    cur_magnitude = cur_magnitude.toFixed(2)
                }
                if (cur_event.f_dom) {
                    if (cur_event.f_dom.hasOwnProperty('MSSNet:DUBA:00')) {
                        cur_f_dom = cur_event.f_dom['MSSNet:DUBA:00']
                        cur_f_dom = cur_f_dom.toFixed(1);
                    }
                }
                items.push(
                    { 
                        public_id: cur_event.public_id,
                        start_time: this.get_local_time_str(cur_start),
                        end_time: this.get_local_time_str(cur_end),
                        duration: cur_event.length.toString(),
                        event_class: cur_event.event_class,
                        event_class_mode: cur_event.event_class_mode,
                        event_region: cur_event.event_region,
                        f_dom: cur_f_dom,
                        foreign_id: cur_event.foreign_id,
                        pgv: (cur_event.max_pgv * 1000).toFixed(3),
                        magnitude: cur_magnitude,
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
  background-color: white
  

</style>
