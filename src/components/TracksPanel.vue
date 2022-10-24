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
    <splitpanes horizontal
                @resized="on_splitpanes_resized('resized splitpanes')">
        <pane v-for="cur_nsl in track_pgv_stations"
              :key="cur_nsl">
            <TrackPgv :nsl_code="cur_nsl"/>
        </pane>
        <pane v-if="is_archive">
          <TrackTimeline />
        </pane>
    </splitpanes>
</template>

<script>

import TrackPgv from '../components/TrackPgv.vue'
import TrackTimeline from '../components/TrackTimeline.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'TracksPanel',
    props: {},
    components: {
        Splitpanes,
        Pane,
        TrackPgv,
        TrackTimeline
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },
    computed: {
        track_pgv_stations: function() {
            if (this.is_realtime)
            {
                return this.$store.getters.tracks.realtime.pgv_timeseries;
            }
            else
            {
                return [];
            }
        },
        
        is_realtime: function() {
            return this.$store.getters.is_realtime; 
        },

        is_archive: function() {
            return this.$store.getters.is_archive; 
        },

    },
    methods: {
        on_splitpanes_resized() {
            this.logger.info('TrackPanel resized');
            this.$store.commit('toggle_tracks_resize');
        },
    },
}

</script>
