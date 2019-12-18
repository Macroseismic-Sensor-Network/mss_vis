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

import Vuex from 'vuex'
import Vue from 'vue'
import * as d3 from "d3";

Vue.use(Vuex)

function handle_msg_soh(msg_id, payload, state) {
    switch (msg_id) {
        case 'connection':
            state.server_id = payload.server_id
            if (payload.state == 'registered')
            {
                state.server_state = 'waiting for data';
            }
            else
            {
                state.server_state = payload.state;
            }
            break
    }
}

function handle_msg_data(msg_id, payload, state) {
    switch (msg_id) {
        case 'pgv':
            console.log("Received pgv data.");
            state.server_state = 'online'
            for (var key in payload)
            {
                if (key in state.pgv_data)
                {
                    //console.log("Key found: " + key)
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
            // Trim the data to the display range.
            trim_data(state);
            console.log("Finished processing the pgv data.");
            break;

        case 'pgv_archive':
            console.log("Received pgv archive data.");
            state.server_state = 'archive received'
            // Clear the pgv_data.
            state.pgv_data = {}
            for (key in payload)
            {
                if (key in state.pgv_data)
                {
                    state.pgv_data[key].time = payload[key].time
                    state.pgv_data[key].data = payload[key].data
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
            // Trim the data to the display range.
            trim_data(state);
            break;

        case 'detection_result':
            console.log("Received a detection result");
            state.detection_result_data = payload;
            break;

        case 'event_data':
            console.log("Received event data.");
            state.event_data = payload;
            break;

        case 'event_warning':
            console.log("Received event warning.");
            state.event_warning = payload;
            break;

        case 'event_archive':
            console.log("Received an event archive.");
            state.event_archive = payload;
            break;
    }


}


function trim_data(state) {
    for (var key in state.pgv_data)
    {
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
}


function get_display_range(state) {
    var display_period = state.display_period;
    var last_dates = [];
    for (var key in state.pgv_data) {
        var last_ind = state.pgv_data[key].time.length - 1;
        var cur_date = state.pgv_data[key].time[last_ind];
        var res = cur_date.split(/[:T-]/);
        for (var k = 0; k < res.length; k++)
        {
            res[k] = parseInt(res[k]);
        }
        // Convert the month to zero-based month (January = 0).
        res[1] = res[1] - 1;
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

    // The month is zero-based (January = 0). Add 1 to the month.
    var isoformat_string  = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1).pad(2) + '-' + (date.getUTCDate()).pad(2) + 'T' + (date.getUTCHours()).pad(2) + ':' + (date.getUTCMinutes()).pad(2) + ':' + (date.getUTCSeconds()).pad(2) + '.' + (date.getUTCMilliseconds()).pad(6);
    return isoformat_string;

}



export default new Vuex.Store({
    state: {
        stations: [],
        station_meta: [],
        pgv_data: {},
        detection_result_data: {},
        event_data: {},
        event_warning: {},
        event_archive: {},
        connected: false,
        message: '',
        server_id: '',
        server_state: '',
        current_range: 60000,
        display_period: 600000,
        //display_period: 60000,

        map_config: { 
                     map_limits: {'x_min': 519685.529,
                                  'y_min': 5252085.484,
                                  'x_max': 672085.529,
                                  'y_max': 5347335.484},
                     size: {'width': 4000,
                            'height': 2500},
                     marker_radius_limits: [5, 20],
                     pgv_limits: [1e-6, 1e-2],
                     colormap: d3.interpolatePlasma,
                     legend: { values: [1e-6, 1e-5, 3e-5, 1e-4, 3e-4, 1e-3, 3e-3, 1e-2],
                               position: 'bottom-right',
                               margin: 20,
                             },
                    },

        map_control: {
                        show_event_warning: false,
                        show_event_detection: false,
                        show_event_monitor: true,
                        show_detection_result: false,
                        show_archive_event: undefined,
        },
    },

    getters: {
        server_state: state => {
            return state.server_state;
        },

        current_pgv: state => {
            var tmp = {}
            for (var key in state.pgv_data) {
                var last_ind = state.pgv_data[key].data.length - 1
                tmp[key] = state.pgv_data[key].data[last_ind]
            }
            return tmp
        },

        current_pgv_by_station: (state, getters) => (station_id) => {
            //console.log('Computing current_pgv_by_station.');
            if (station_id in state.pgv_data) {
                var last_ind = state.pgv_data[station_id].data.length - 1;
                var cur_pgv = state.pgv_data[station_id].data[last_ind];
                var cur_time = new Date(state.pgv_data[station_id].time[last_ind]);
                const cur_time_limit = new Date(new Date(getters.data_time_range[1]) - state.current_range);
                if (cur_time < cur_time_limit)
                {
                    cur_pgv = undefined;
                }
                return cur_pgv;
            }
            else {
                return undefined;
            }
        },

        pgv_by_station: (state) => (station_id) => {
            //var last_ind = state.pgv_data[station_id].data.length - 1
            console.log('Computing pgv_by_station.');
            return state.pgv_data[station_id]
        },

        // eslint-disable-next-line
        disp_range_max_pgv_by_station: (state, getters) => (station_id) => {
            console.log('Computing disp_range_max_pgv_by_station.');
            var max_pgv = undefined;
            const time_limit = new Date(new Date(getters.data_time_range[1]) - state.current_range);
            if (station_id in state.pgv_data)
            {
                var cur_data = []
                for (var k = 0; k < state.pgv_data[station_id].time.length; k++)
                {
                    var cur_time = new Date(state.pgv_data[station_id].time[k]);
                    if (cur_time >= time_limit)
                    {
                        cur_data.push(state.pgv_data[station_id].data[k]);
                    }
                }
                //max_pgv = Math.max(...state.pgv_data[station_id].data);
                max_pgv = Math.max(...cur_data);
            }
            return max_pgv;
        },

        data_length: (state) => (station_id) => {
            return state.pgv_data[station_id].data.length;
        },

        display_time_range: (state) => {
            var display_period = state.display_period;
            var last_dates = [];
            for (var key in state.pgv_data) {
                var last_ind = state.pgv_data[key].time.length - 1;
                var cur_date = state.pgv_data[key].time[last_ind];
                var res = cur_date.split(/[:T-]/);
                for (var k = 0; k < res.length; k++)
                {
                    res[k] = parseInt(res[k]);
                }
                // Convert the month to zero-based month (January = 0).
                res[1] = res[1] - 1;
                last_dates.push(Date.UTC(res[0], res[1], res[2], res[3], res[4], res[5]));
            }
            var end_timestamp = Math.max.apply(null, last_dates);
            var start_timestamp = end_timestamp - display_period;

            var start_date = new Date(start_timestamp);
            var end_date = new Date(end_timestamp);

            return [to_isoformat(start_date), to_isoformat(end_date)]
        },

        data_time_range: (state) => {
            var first_dates = [];
            var last_dates = [];
            for (var key in state.pgv_data) {
                // Get the first date of the data.
                var cur_date = state.pgv_data[key].time[0];
                var res = cur_date.split(/[:T-]/);
                for (var k = 0; k < res.length; k++)
                {
                    res[k] = parseInt(res[k]);
                }
                // Convert the month to zero-based month (January = 0).
                res[1] = res[1] - 1;
                first_dates.push(Date.UTC(res[0], res[1], res[2], res[3], res[4], res[5]));

                var last_ind = state.pgv_data[key].time.length - 1;
                cur_date = state.pgv_data[key].time[last_ind];
                res = cur_date.split(/[:T-]/);
                for (k = 0; k < res.length; k++)
                {
                    res[k] = parseInt(res[k]);
                }
                // Convert the month to zero-based month (January = 0).
                res[1] = res[1] - 1;
                last_dates.push(Date.UTC(res[0], res[1], res[2], res[3], res[4], res[5]));
            }
            var start_timestamp = Math.min.apply(null, first_dates);
            var end_timestamp = Math.max.apply(null, last_dates);

            var start_date = new Date(start_timestamp);
            var end_date = new Date(end_timestamp);

            return [to_isoformat(start_date), to_isoformat(end_date)]
        },

        station_meta: (state) => {
            return state.station_meta;
        },

        map_config: (state) => {
            return state.map_config;
        },

        scales: (state) => {
            const x = d3.scaleLinear().domain([state.map_config.map_limits.x_min, 
                                               state.map_config.map_limits.x_max])
                                       .range([0,
                                               state.map_config.size.width]);
            const y = d3.scaleLinear().domain([state.map_config.map_limits.y_min,
                                               state.map_config.map_limits.y_max])
                                       .range([state.map_config.size.height,
                                               0]);
            const radius = d3.scaleLog().domain(state.map_config.pgv_limits)
                                        .range(state.map_config.marker_radius_limits)
                                        .clamp(true);
            const color = d3.scaleLog().domain(state.map_config.pgv_limits)
                                       .range([0, 1])
                                       .clamp(true);
            return {x, y, radius, color};
        },

        detection_result: (state) => {
            return state.detection_result_data;
        },

        event_warning: (state) => {
            return state.event_warning;
        },

        current_event: (state) => {
            return state.event_data;
        },

        current_event_max_pgv: (state) => {
            var trigger_data;
            var cur_pgv;
            var max_pgv = [];
            if (state.event_data.overall_trigger_data)
            {
                trigger_data = state.event_data.overall_trigger_data;
                for (var k = 0; k < trigger_data.length; k++)
                {
                    cur_pgv = trigger_data[k].pgv;
                    for (var m = 0; m < cur_pgv.length; m++)
                    {
                         max_pgv.push(Math.max.apply(null, cur_pgv[m]));
                    }
                }
                max_pgv = Math.max.apply(null, max_pgv);
            }

            if (max_pgv.length === 0)
            {
                max_pgv = undefined;
            }
            return max_pgv;
        },

        archive_event_max_pgv: (state) => (pos) =>  {
            var trigger_data ;
            var cur_pgv;
            var max_pgv = [];
            if (state.event_archive[pos].overall_trigger_data)
            {
                trigger_data = state.event_archive[pos].overall_trigger_data;
                for (var k = 0; k < trigger_data.length; k++)
                {
                    cur_pgv = trigger_data[k].pgv;
                    for (var m = 0; m < cur_pgv.length; m++)
                    {
                         max_pgv.push(Math.max.apply(null, cur_pgv[m]));
                    }
                }
                max_pgv = Math.max.apply(null, max_pgv);
            }

            if (max_pgv.length === 0)
            {
                max_pgv = undefined;
            }
            return max_pgv;
        },

        map_control: (state) => {
            return state.map_control;
        },

        event_archive: (state) => {
            // Return the event archive sorted descending by the start time.
            if (state.event_archive.length > 1)
            {
                return state.event_archive.sort((a, b) => (a.start_time < b.start_time) ? 1 : -1);
            }
            else
            {
                return state.event_archive;
            }
        },

    },

    mutations: {
        SOCKET_ONOPEN(state, event) {
            Vue.prototype.$socket = event.currentTarget;
            state.connected = true;
            state.server_state = 'connection opened'
            console.info("Connected to websocket server.");
            //console.info("state: ", state);
            //console.info("event: ", event);
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
        },

        SOCKET_ONCLOSE(state, event) {
            state.connected = false;
            state.server_state = 'disconnected'
            console.info("Disconnected from server.");
            console.info("event: ", event);
        },

        SOCKET_ONERROR(state, event) {
            state.server_state = 'error';
            console.error("Websocket error.");
            console.error("state: ", state);
            console.error("event: ", event);
        },

        SOCKET_RECONNECT(state, count) {
            state.server_state = 'reconnecting';
            console.info("Reconnecting...");
            console.info("state: ", state);
            console.info("count: ", count);
        },

        SOCKET_RECONNECT_ERROR(state) {
            state.server_state = 'reconnection error';
            console.error("Error while reconnecting.");
            console.error(state);
        },

        LOAD_STATION_METADATA(state) {
            d3.csv("/assets/vue/data/mss_stations_2019_297.csv").then( function(data) {
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

        set_map_control(state, payload) {
            Vue.set(state.map_control, payload.property, payload.value);
        },

        set_show_archive_event(state, payload) {
            if (payload.pos === state.map_control.show_archive_event)
            {
                state.map_control.show_archive_event = undefined;
            }
            else
            {
                state.map_control.show_archive_event = payload.pos;
            }
        },
    },

    actions: {

    }
});
