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
    <div style="width: 100%; overflow: auto;">
        <StationInfo v-for="cur_station_id in inspect_stations"
                     :key="cur_station_id"
                     :station_id="cur_station_id"/>
    </div>
</template>

<script>

import StationInfo from '../components/StationInfo.vue'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'StationInfoPanel',
    props: {},
    components: {
        StationInfo,
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },
    computed: {
        inspect_stations: function() {
            return this.$store.getters.inspect_stations;
        },
    },
}

</script>

<style scoped lang="sass">

span.station-info-title
    margin: 0px
    margin-bottom: 5px
    padding: 2px
    display: inline-block
    text-align: center
    width: 100%
    font-weight: bold
    background-color: black
    color: white

</style>
