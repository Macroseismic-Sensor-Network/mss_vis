import Vuex from 'vuex'
import Vue from 'vue'

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
        pgv_data: {},
        connected: 'no',
        message: '',
        server_id: '',
        server_state: ''
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

        current_pgv_by_station: (state) => (station_name) => {
            var last_ind = state.pgv_data[station_name].data.length - 1
            return state.pgv_data[station_name].data[last_ind]
        },

        pgv_by_station: (state) => (station_name) => {
            var last_ind = state.pgv_data[station_name].data.length - 1
            return state.pgv_data[station_name]
        },

        display_range: (state) => {
            var display_period = 1800000;
            var last_dates = [];
            for (var key in state.pgv_data) {
                var last_ind = state.pgv_data[key].time.length - 1;
                var cur_date = state.pgv_data[key].time[last_ind];
                var res = cur_date.split(/[\:T-]/);
                last_dates.push(Date.UTC(res[0], res[1], res[2], res[3], res[4], res[5]));
            }
            var end_timestamp = Math.max.apply(null, last_dates);
            var start_timestamp = end_timestamp - display_period;

            var start_date = new Date(start_timestamp);
            var end_date = new Date(end_timestamp);

            return [to_isoformat(start_date), to_isoformat(end_date)]
        }

    },

    mutations: {
        SOCKET_ONOPEN(state, event) {
            Vue.prototype.$socket = event.currentTarget
            state.connected = 'yes'
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
        }
    },

    actions: {

    }
});
