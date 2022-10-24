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
                @resized="on_splitpanes_resized()">
      <pane>
        <DiagramPgv v-if="is_single_event_view"/>
        <DiagramOverviewMagnitude v-if="is_overview"
                                  parameter="magnitude"/>
        <DiagramOverviewMagnitude v-if="is_overview"
                                  parameter="pgv"/>
      </pane>
    </splitpanes>
</template>

<script>

import DiagramPgv from '../components/DiagramPgv.vue'
import DiagramOverviewMagnitude from '../components/DiagramOverviewMagnitude.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'DiagramsPanel',
    props: {},
    components: {
        Splitpanes,
        Pane,
        DiagramPgv,
        DiagramOverviewMagnitude
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
                         this.$store.getters.prefix_options);
    },
    computed: {
        is_realtime: function() {
            return this.$store.getters.is_realtime; 
        },

        is_single_event_view: function() {
            if (this.active_event === undefined) {
                return false;
            }
            else {
                return true;
            }
        },

        is_overview: function() {
            return !this.is_single_event_view;
        },
        
        active_event: function() {
            return this.$store.getters.active_recent_event;
        },

        

    },
    methods: {
        on_splitpanes_resized() {
            this.logger.info('DiagramPanel resized');
        },
    },
}

</script>
