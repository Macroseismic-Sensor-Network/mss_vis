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
    <div class="archive-event-panel">
        <RecentEvent v-for="cur_event in event_archive"
                     v-bind:key="cur_event.public_id"
                     v-bind:public_id = "cur_event.public_id"
                     v-bind:db_id="cur_event.db_id"
                     v-bind:start_time="cur_event.start_time"
                     v-bind:end_time="cur_event.end_time"
                     v-bind:max_pgv="cur_event.max_pgv"/>
    </div>
</template>

<script>

import RecentEvent from '../components/RecentEvent.vue';
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'RecentEventInfoPanel',
    props: {},
    components: {
        RecentEvent
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },
    computed: {
        event_archive: function() {
            return this.$store.getters.event_archive;
        },
    },
}

</script>

<style scoped lang="sass">

span.event-info-title
    margin: 0px
    margin-bottom: 5px
    padding: 2px
    display: inline-block
    text-align: center
    width: 100%
    font-weight: bold
    background-color: black
    color: white

div.archive-event-panel
    height: 100%
    width: 100%
    overflow: auto

</style>