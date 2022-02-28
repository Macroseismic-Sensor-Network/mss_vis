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
    <w-table :headers="table_headers"
             :items="table_items"
             :fixed-headers="true"
             v-bind:select-row="true"
             style="height: 100%;"
             @row-select="on_row_select($event)">
    </w-table>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import * as moment from 'moment';

export default {
    name: 'StationPgvTable',
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
                    { label: 'NSL Code', key: 'nsl_code' },
                    { label: 'Name', key: 'name' },
                    { label: 'Beschreibung', key: 'description' },
                    { label: 'MSS Seriennummer', key: 'mss_serial'},
                    { label: 'Länge', key: 'lon' },
                    { label: 'Breite', key: 'lat' },
                    { label: 'Höhe', key: 'height' },
                    { label: 'PGV [mm/s]', key: 'pgv'},
                    { label: 'max. PGV letzte 60 s [mm/s]', key: 'pgv_history'},
                    { label: 'Verzögerung [s]', key: 'delay'},
                ],
        };
    },
    computed: {
        stations: function() {
            return this.$store.getters.station_meta;
        },

        mssds_data: function() {
            return this.$store.getters.mssds_data;
        },

        utc_offset: function() {
            return this.$store.getters.utc_offset;
        },

        server_time_local: function() {
            return this.$store.getters.server_time_local;
        },

        table_items: function() {
            let items = [];
            for (let cur_nsl in this.stations)
            {
                let cur_station = this.stations[cur_nsl];
                let cur_pgv = undefined;
                let cur_pgv_history = undefined;
                let cur_delay = undefined;
                let cur_pgv_str = '';
                let cur_pgv_history_str = '';
                let cur_delay_str = '';
                if (this.mssds_data.current_pgv.pgv_data)
                {
                    if (cur_nsl in this.mssds_data.current_pgv.pgv_data)
                    {
                        cur_pgv = this.mssds_data.current_pgv.pgv_data[cur_nsl].latest_pgv;
                        cur_pgv_history = this.mssds_data.current_pgv.pgv_data[cur_nsl].pgv_history;
                        let cur_latest_time = this.mssds_data.current_pgv.pgv_data[cur_nsl].latest_time;
                        cur_latest_time = moment.unix(cur_latest_time).utc();
                        cur_delay = this.server_time_local.diff(cur_latest_time, 'seconds');
                    }
                }

                if (cur_pgv != undefined)
                {
                    cur_pgv_str = (cur_pgv * 1000).toFixed(6);
                }
                else
                {
                    cur_pgv_str = 'keine Daten';
                }
                
                if (cur_pgv_history != undefined)
                {
                    cur_pgv_history_str = (cur_pgv_history * 1000).toFixed(6);
                }
                else
                {
                    cur_pgv_history_str = 'keine Daten';
                }

                if (cur_delay != undefined)
                {
                    cur_delay_str = cur_delay.toString();
                }
                else
                {
                    cur_delay_str = 'keine Daten';
                }

                items.push(
                    { 
                        nsl_code: cur_nsl,
                        name: cur_station.name,
                        description: cur_station.description,
                        mss_serial: cur_station.recorder_serials,
                        lon: cur_station.lon,
                        lat: cur_station.lat,
                        height: cur_station.height,
                        pgv: cur_pgv_str,
                        pgv_history: cur_pgv_history_str,
                        delay: cur_delay_str,
                    });
            }
            return items;
        },
    },
    methods: {
        on_row_select(selected_row) {
            this.logger.debug('Selected row: ', selected_row);
        },
    },
}

</script>

<style scoped lang="sass">

</style>
