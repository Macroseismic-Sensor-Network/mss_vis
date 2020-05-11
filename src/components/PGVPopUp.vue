<template>
    <div id="popUp"
         class="ui-widget-content"
         style="position:absolute; background-color:white;"
         v-show="is_visible">
        <div style="text-align:right" id="buttonsContainer">
            <!--
            <button v-on:click="$emit('add-popup')" id="addButton">
                <img id="addIcon" v-bind:src="add_icon_path">
            </button>
            -->

            <button v-on:click="is_visible = false" id="closeButton">
                <img id="closeIcon" v-bind:src="close_icon_path">
            </button>

        </div>
        <h2 id="popup-name">{{ name }}</h2>
        <p><b>latest PGV:</b> {{ (pgv * 1000).toFixed(3) }} mm/s</p> 
        <p><b>max. PGV:</b> {{ (pgv_max * 1000).toFixed(3) }} mm/s</p> 
        <h3 style="background-color:LightGray"  id="popup-title">Stationsmetadaten</h3>
        <p id="popup-id"><b>ID:</b> {{station_id}}</p>
        <p id="popup-description"><b>Beschreibung:</b> {{description}}</p>
        <!--
        <p id="popup-network"><b>Netzwerk</b> {{network}}</p>
        <p id="popup-location"><b>Standort:</b> {{location}}</p>
        <p id="popup-coordinates"><b>Koordinaten:</b> {{coords}}</p>
        <p id="popup-utm-coordinates"><b>UTM Koordinaten:</b> {{utm_coords}}</p>
        -->

    </div>
</template>


<script>


export default {
    name: "PGVPopUp",

    props: {

    },


    data() {
        return {
            name: "PGV Popup",
            close_icon_path: "/assets/vue/nrt/image/icons/close_popup.png",
            attached: false,
        }
    },

    computed: {
        station_id: function() {
            return this.$store.getters.inspect_station;
        },

        station_meta: function() {
            return this.$store.getters.station_meta_by_id(this.station_id);
        },

        description: function() {
            let cur_meta = this.station_meta;
            if (cur_meta == undefined)
            {
                return '';
            }
            else
            {
                return cur_meta.description;
            }
        },

        is_visible: {
            get() {
                return this.$store.getters.show_inspect_station_popup;
            },

            set(value) {
                this.$store.commit('set_show_inspect_station_popup', value);
            }
        },

        add_icon_path: function() {
            if(!this.attached) {
                return "/assets/vue/nrt/image/icons/lock_closed.png";
            }
            else {
                return "/assets/vue/nrt/image/icons/lock_open.png";
            }
        },

        pgv: function() {
            return this.$store.getters.current_pgv_by_station(this.station_id);
        },

        pgv_max: function() {
            return this.$store.getters.disp_range_max_pgv_by_station(this.station_id);
        },
    },

    watch: {
    },

    methods: {
    },

}
</script>

<style scoped>
    #popUp{
        position:relative;
        display:inline-block;
        width:300px;
        height:480px;


        margin: 0px auto;
        background-color: #E87B10;
        border-radius: 25px;
    }
    #addPopUp{
        position:absolute;
    }
    #closeButton{
        position:relative;
        right:20px;
    }
    #buttonsContainer {
        width:100%;
        position:absolute;
    }
    #closeIcon{
        width:22px;
        height:22px;
    }
    #addIcon{
        width:22px;
        height:22px;
    }
    #addButton{
        position:relative;
        right:35px;
    }
</style>


<style lang="sass">
    $attached:false	

    div#popUp
            top: 200px
            padding:0.5em
            border: 2px solid black
            z-index:500


    div#addPopUp
            bottom:0
            right:0
	
</style>
