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
    <div class="supporter-panel">
      <w-flex wrap>
        <div v-for="cur_supporter in supporter"
             v-bind:key="cur_supporter.name"
             class="supporter-logo-container">
          <a v-bind:href="cur_supporter.url"
             target="_blank">
            <img v-bind:src="'/assets/vue/nrt/image/supporter/' + cur_supporter.logo"
                 v-bind:alt="'Logo von ' + cur_supporter.name"/>
          </a>
        </div>
      </w-flex>
    </div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'SupporterPanel',
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
        supporter: function() {
            return this.$store.getters.supporter;
        },
      
    },
}

</script>

<style scoped lang="sass">

div.supporter-panel
  height: 100%
  width: 100%
  overflow: auto

  div.supporter-logo-container
    padding-left: 5px
    padding-right: 5px
    padding-top: 0px
    padding-bottom: 5px
    
    img
      max-height: 50px
      max-width: 80px
</style>
