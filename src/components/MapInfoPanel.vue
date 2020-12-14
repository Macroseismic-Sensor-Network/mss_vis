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
    <div class="map-info-panel">
        <span id="map_info_last_data" class="map-info">last data: {{ data_time_range[1] }} UTC</span>
        <span id="map_info_first_data" class="map-info">first data: {{ data_time_range[0] }} UTC</span>
        <span id="map_info_server_state" class="map-info">server state: {{ server_state }}</span>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'MapInfoPanel',
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
        data_time_range: function() {
            return this.$store.getters.data_time_range;
        },

        server_state: function() {
            return this.$store.getters.server_state;
        },
    },
}

</script>

<style scoped lang="sass">

div.map-info-panel
    height: 100%
    width: 100%
    overflow: auto

span.map-info-title
    margin: 0px
    margin-bottom: 5px
    padding: 2px
    display: inline-block
    text-align: center
    width: 100%
    font-weight: bold
    background-color: black
    color: white

span.map-info
    cursor: pointer
    margin: 0px
    padding: 2px
    display: inline-block
    text-align: left
    width: 100%

</style>
