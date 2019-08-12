import Vuex from 'vuex'
import Vue from 'vue'
import * as d3 from "d3";

Vue.use(Vuex)

function handle_msg_soh(msg_id, payload, state) {
    switch (msg_id) {
        case 'connection':
            state.server_id = payload.server_id
            state.server_state = payload.state
            break
    }
}

function handle_msg_data(msg_id, payload, state) {
    switch (msg_id) {
        case 'pgv':
            for (var key in payload)
            {
                if (key in state.pgv_data)
                {
                    //console.log("Key found: " + key)
                    //console.log(payload[key].data)
                    state.pgv_data[key].data = state.pgv_data[key].data.concat(payload[key].data)
                    state.pgv_data[key].time = state.pgv_data[key].time.concat(payload[key].time)

                    //console.log("display_range: " + display_range);
                    var display_range = get_display_range(state);
                    var display_start = new Date(new Date(display_range[0]) - 1000 * 10);

                    // Crop the data to the needed length. Drop old data.
                    var crop_ind = -1;
                    for (var k = 0; k < state.pgv_data[key].time.length; k++)
                    {
                        var cur_time = new Date(state.pgv_data[key].time[k]);
                        if (cur_time >= display_start)
                        {
                            crop_ind = k;
                            break;
                        }
                    }

                    if (crop_ind > 0)
                    {
                        //console.log("First value in display range: " + state.pgv_data[key].time[crop_ind])
                        //console.log("crop_index: " + crop_ind)
                        state.pgv_data[key].time = state.pgv_data[key].time.slice(crop_ind);
                        state.pgv_data[key].data = state.pgv_data[key].data.slice(crop_ind);
                    }
                }
                else
                {
                    // Use the Vue.set function to ensure, that the store
                    // tracks the changes of the object elements.
                    Vue.set(state.pgv_data, key, {})
                    Vue.set(state.pgv_data[key], "data", payload[key].data)
                    Vue.set(state.pgv_data[key], "time", payload[key].time)
                }
            }
            break
    }

}


function get_display_range(state) {
    var display_period = state.display_period;
    var last_dates = [];
    for (var key in state.pgv_data) {
        var last_ind = state.pgv_data[key].time.length - 1;
        var cur_date = state.pgv_data[key].time[last_ind];
        var res = cur_date.split(/[:T-]/);
        last_dates.push(Date.UTC(res[0], res[1], res[2], res[3], res[4], res[5]));
    }
    var end_timestamp = Math.max.apply(null, last_dates);
    var start_timestamp = end_timestamp - display_period;

    var start_date = new Date(start_timestamp);
    var end_date = new Date(end_timestamp);

    return [to_isoformat(start_date), to_isoformat(end_date)]
}


function to_isoformat(date) {
    Number.prototype.pad = function(size) {
      var s = String(this);
      while (s.length < (size || 2)) {s = "0" + s;}
      return s;
    }

    var isoformat_string  = date.getUTCFullYear() + '-' + (date.getUTCMonth()).pad(2) + '-' + (date.getUTCDate()).pad(2) + 'T' + (date.getUTCHours()).pad(2) + ':' + (date.getUTCMinutes()).pad(2) + ':' + (date.getUTCSeconds()).pad(2) + '.' + (date.getUTCMilliseconds()).pad(6);
    return isoformat_string;

}



export default new Vuex.Store({
    state: {
        stations: [],
        station_meta: [],
        pgv_data: {},
        connected: false,
        message: '',
        server_id: '',
        server_state: '',
        display_period: 1800000,
        //display_period: 60000,
    },

    getters: {
        current_pgv: state => {
            var tmp = {}
            for (var key in state.pgv_data) {
                var last_ind = state.pgv_data[key].data.length - 1
                tmp[key] = state.pgv_data[key].data[last_ind]
            }
            return tmp
        },

        current_pgv_by_station: (state) => (station_id) => {
            if (station_id in state.pgv_data) {
                var last_ind = state.pgv_data[station_id].data.length - 1
                return state.pgv_data[station_id].data[last_ind]
            }
            else {
                return undefined;
            }
        },

        pgv_by_station: (state) => (station_id) => {
            //var last_ind = state.pgv_data[station_id].data.length - 1
            return state.pgv_data[station_id]
        },

        disp_range_max_pgv_by_station: (state) => (station_id) => {
            var max_pgv = undefined;
            if (station_id in state.pgv_data)
            {
                max_pgv = Math.max(...state.pgv_data[station_id].data);
            }
            return max_pgv;
        },

        data_length: (state) => (station_id) => {
            return state.pgv_data[station_id].data.length;
        },

        display_range: (state) => {
            var display_period = state.display_period;
            var last_dates = [];
            for (var key in state.pgv_data) {
                var last_ind = state.pgv_data[key].time.length - 1;
                var cur_date = state.pgv_data[key].time[last_ind];
                var res = cur_date.split(/[:T-]/);
                last_dates.push(Date.UTC(res[0], res[1], res[2], res[3], res[4], res[5]));
            }
            var end_timestamp = Math.max.apply(null, last_dates);
            var start_timestamp = end_timestamp - display_period;

            var start_date = new Date(start_timestamp);
            var end_date = new Date(end_timestamp);

            return [to_isoformat(start_date), to_isoformat(end_date)]
        },

        station_meta: (state) => {
            return state.station_meta;
        },


    },

    mutations: {
        SOCKET_ONOPEN(state, event) {
            Vue.prototype.$socket = event.currentTarget;
            state.connected = true;
            console.info("Connected to websocket server.");
            console.info("state: ", state);
            console.info("event: ", event);
        },

        SOCKET_ONMESSAGE(state, payload) {
            var msg_class = payload.class
            var msg_id = payload.id

            switch (msg_class) {
                case 'soh':
                    handle_msg_soh(msg_id, payload.payload, state)
                    break;
                case 'data':
                    handle_msg_data(msg_id, payload.payload, state)
                    break;
            }
            //state.stations = Object.keys(payload)
            //state.pgv_data = {}
            //for (var key in payload)
            //{
            //    state.pgv_data[key] = {time: payload[key].time,
            //                           data: payload[key].data}
            //}
            //state.pgv_time = payload.time
            //state.pgv_value = payload.pgv
        },

        SOCKET_ONCLOSE(state, event) {
            state.connected = false;
            console.info("Disconnected from server.");
            console.info("event: ", event);
        },

        SOCKET_ONERROR(state, event) {
            console.error("Websocket error.");
            console.error("state: ", state);
            console.error("event: ", event);
        },

        SOCKET_RECONNECT(state, count) {
            console.info("Reconnecting...");
            console.info("state: ", state);
            console.info("count: ", count);
        },

        SOCKET_RECONNECT_ERROR(state) {
            console.error("Error while reconnecting.");
            console.error(state);
        },

        LOAD_STATION_METADATA(state) {
            d3.csv("/data/mss_stations_2019_147.csv").then( function(data) {
                for (var k = 0; k < data.length; k++)
                {
                    data[k].id = data[k].network + "." +  
                                 data[k].name + "." + 
                                 data[k].location + "." +
                                 "pgv";
                }
                state.station_meta = data;
                console.log("Store :: Station metadata loaded.");
                //self.plot_stations();
            });
        },
    },

    actions: {

    }
});
