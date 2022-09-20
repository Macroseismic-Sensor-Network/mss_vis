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
    <div>
        <w-flex wrap class="text-left"
                 v-if="active_event === undefined">
            <div class="xs12 pa1">Bitte wähle ein Ereignis in der Tabelle.</div>
        </w-flex>
        <w-flex column
                 v-if="active_event != undefined">
            <w-flex wrap>
                <div class="xs12 pa1">Spezifische Daten für die Sprengung Klasse.</div>
            </w-flex>
            <w-flex wrap>
                <div class="pr2 text-bold">PGV DUBA:</div>
                <div class="grow"></div>
            </w-flex>
            <w-flex wrap>
                <div class="pr2 text-bold">PGV DUBAM:</div>
                <div class="grow"></div>
            </w-flex>
            <w-flex wrap>
                <div class="pr2 text-bold">f dom. DUBA:</div>
                <div class="grow"></div>
            </w-flex>
            <w-flex wrap>
                <div class="pr2 text-bold">f dom. DUBAM:</div>
                <div class="grow"></div>
            </w-flex>
        </w-flex>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import * as moment from 'moment';

export default {
    name: 'BlastInfoPanel',
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
    computed: {
        public_id: function() {
            if (this.active_event)
            {
                return this.active_event.public_id;
            }
            else
            {
                return undefined;
            }
        },

        utc_offset: function() {
            return this.$store.getters.utc_offset;
        },

        active_event: function() {
            return this.$store.getters.active_recent_event;
        },

        pgv: function() {
            if (this.active_event)
            {
                return (this.active_event.max_pgv * 1000).toFixed(3);
            }
            else
            {
                return undefined;
            }
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
    },
}

</script>

<style scoped lang="sass">

</style>
