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
    <div id="lwz-display-container">
        <div id="online-container" class = "grid-x">
            <div id="lwz_state" class="cell small-6" ><a href="http://www.mertl-research.at/mss-nrt-map/" target="blank"><span v-bind:style="{backgroundColor: state_color, color: state_font_color}">{{ state }}</span></a></div>
            <div id="lwz_pgv" class="cell small-6"><a href="http://www.mertl-research.at/mss-nrt-map/" target="blank"><span v-bind:style="{backgroundColor: pgv_color, color: pgv_font_color}">{{ triggered_stations }}</span></a></div>
        </div>
        <!--
        <div id="pgv-container" class = "grid-x">
            <div id="lwz_pgv" class="cell" v-bind:style="{backgroundColor: pgv_color, color: pgv_font_color}">{{ triggered_stations }}</div>
        </div>
        <div id="event-container" class = "grid-x">
            <div id="lwz_event" class="cell" v-bind:style="{backgroundColor: event_color, color: event_font_color}">{{ event_text }}</div>
        </div>
        -->
    </div>
</template>

<script>

export default {
    name: 'LWZDisplay',
    props: {
        title: String
    },

    components: {

    },

    data() {
        return {
            pgv_thr: 0.1e-3,
            online_color: "#d8ffcc",
            offline_color: "#ff5e5e",
            warning_color: "#f6973f",
            normal_color: "#d8ffcc",
            gray_color: "#838383",
            white_color: "#ffffff",
        };
    },

    mounted() {
        this.$store.commit("LOAD_STATION_METADATA");
    },

    computed: {
        stations: function() {
            return this.$store.getters.station_meta;
        },

        state_color: function() {
            if (this.state == 'online')
            {
                return this.online_color;
            }
            else
            {
                return this.offline_color;
            }
        },

        state_font_color: function() {
            if (this.state == 'online')
            {
                return this.gray_color;
            }
            else
            {
                return this.white_color;
            }
        },

        pgv_color: function() {
            if (this.state != 'online')
            {
                return this.gray_color;
            }
            else if (this.triggered_stations >= 3)
            {
                return this.warning_color;
            }
            else
            {
                return this.normal_color;
            }
        },

        pgv_font_color: function() {
            if (this.triggered_stations >= 3)
            {
                return this.white_color;
            }
            else
            {
                return this.gray_color;
            }
        },

        event_color: function() {
            if (this.event_warning)
            {
                return this.warning_color;
            }
            else
            {
                return this.normal_color;
            }
        },

        event_font_color: function() {
            if (this.event_warning)
            {
                return this.white_color;
            }
            else
            {
                return this.gray_color;
            }
        },

        state: function() {
            var state;
            const server_state = this.$store.getters.server_state;
            if (server_state == 'online')
            {
                state = 'online';
            }
            else
            {
                state = 'offline';
            }
            return state;
        },

        triggered_stations: function() {
            var stations = this.$store.getters.station_meta;
            var max_pgv;
            var trigger_stations = 0;
            for (var k = 0; k < stations.length; k++)
            {
                max_pgv = this.$store.getters.disp_range_max_pgv_by_station(stations[k].id);
                if (max_pgv > this.pgv_thr) {
                    trigger_stations++;
                }
            }
            return trigger_stations;
        },

        event_warning: function() {
            var current_event = this.$store.getters.current_event;
            var event_warning = false;
            if ('state' in current_event)
            {
                event_warning = true;
            }

            return event_warning;
        },

        event_text: function() {
            if (this.event_warning)
            {
                return "Ereignis";
            }
            else
            {
                return "normal";
            }

        }

    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

#lwz_state
    height: 30px
    text-align: center
    font-family: arial
    font-weight: bold
    padding-right: 2.5px

    span
        display: inline-block
        width: 100%
        height: 100%

#lwz_pgv
    height: 30px
    text-align: center
    font-family: arial
    font-weight: bold
    padding-left: 2.5px

    span
        display: inline-block
        width: 100%
        height: 100%


#lwz_event
    height: 30px
    text-align: center
    font-family: arial
    font-weight: bold
    margin-top: 5px

</style>
