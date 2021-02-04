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
import * as log from 'loglevel';
import * as moment from 'moment';
import proj4 from 'proj4';

Vue.use(Vuex)

function handle_msg_soh(msg_id, payload, state) {
    switch (msg_id) {
        case 'connection':
            state.server_id = payload.server_id
            state.utc_offset = payload.utc_offset
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
        case 'current_pgv':
            state.logger.debug('Received current pgv data.');
            state.server_state = 'online';
            state.mssds_data.current_pgv = payload;
            break;

        case 'pgv':
            state.logger.debug("Received pgv data.");
            state.server_state = 'online';
            for (let key in payload)
            {
                if (key in state.pgv_data)
                {
                    state.logger.debug('Replacing the existing data.')
                    state.pgv_data[key].data = state.pgv_data[key].data.concat(payload[key].data)
                    state.pgv_data[key].time = state.pgv_data[key].time.concat(payload[key].time)
                }
                else
                {
                    state.logger.debug('Creating a new pgv data key.')
                    // Use the Vue.set function to ensure, that the store
                    // tracks the changes of the object elements.
                    Vue.set(state.pgv_data, key, {})
                    Vue.set(state.pgv_data[key], "data", payload[key].data)
                    Vue.set(state.pgv_data[key], "time", payload[key].time)
                }
            }
            // Trim the data to the display range.
            trim_data(state);
            state.logger.debug("Finished processing the pgv data.");
            break;

        case 'pgv_archive':
            state.logger.debug("Received pgv archive data.");
            state.server_state = 'archive received'
            // Clear the pgv_data.
            state.pgv_data = {}
            for (let key in payload)
            {
                if (key in state.pgv_data)
                {
                    state.logger.debug('Replacing the existing data.')
                    state.pgv_data[key].data = payload[key].data
                    state.pgv_data[key].time = payload[key].time
                    //state.pgv_data[key].time = time_utc
                }
                else
                {
                    // Use the Vue.set function to ensure, that the store
                    // tracks the changes of the object elements.
                    state.logger.debug('Creating a new pgv data key.')
                    Vue.set(state.pgv_data, key, {})
                    Vue.set(state.pgv_data[key], "data", payload[key].data)
                    Vue.set(state.pgv_data[key], "time", payload[key].time)
                    //Vue.set(state.pgv_data[key], "time", time_utc)
                    state.logger.debug('Done.');
                }
            }
            // Trim the data to the display range.
            trim_data(state);
            state.logger.debug('Finished processing the pgv archive..')
            break;

        case 'detection_result':
            state.logger.debug("Received a detection result");
            state.detection_result_data = payload;
            break;

        case 'event_data':
            state.logger.debug("Received event data.");
            state.event_data = payload;
            break;

        case 'event_warning':
            state.logger.debug("Received event warning.");
            state.event_warning = payload;
            break;

        case 'event_archive':
            state.logger.debug("Received an event archive.");
            state.event_archive = payload;
            break;
    }


}

// eslint-disable-next-line
function trim_data(state) {
    // eslint-disable-next-line
    let display_range = get_display_range(state);
    let display_start = display_range[0].unix();
    state.logger.debug("display_start: ", display_start)   

    // eslint-disable-next-line
    for (let key in state.pgv_data)
    {
        // Crop the data to the needed length. Drop old data.
        var crop_ind = -1;
        for (var k = 0; k < state.pgv_data[key].time.length; k++)
        {
            if (state.pgv_data[key].time[k] >= display_start)
            {
                crop_ind = k;
                break;
            }
        }

        if (crop_ind > 0)
        {
            state.pgv_data[key].time = state.pgv_data[key].time.slice(crop_ind);
            state.pgv_data[key].data = state.pgv_data[key].data.slice(crop_ind);

            //state.logger.debug('length time: ', state.pgv_data[key].time.length);
        }
        else
        {
            state.logger.debug('No crop index definde.');
        }
    }
}


function get_display_range(state) {
    let end_date = moment.utc(state.server_time)
    let start_date = moment.utc(end_date).subtract(state.display_period, 'seconds')

    state.logger.debug('server_time: ', state.server_time.toISOString());
    state.logger.debug('start_date: ', start_date.toISOString());
    state.logger.debug('end_date: ', end_date.toISOString());

    return [start_date, end_date]
}


/*
function to_isoformat(date) {
    Number.prototype.pad = function(size) {
        var s = String(this);
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }

    if (date == null)
        return null;

    // The month is zero-based (January = 0). Add 1 to the month.
    var isoformat_string  = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1).pad(2) + '-' + (date.getUTCDate()).pad(2) + 'T' + (date.getUTCHours()).pad(2) + ':' + (date.getUTCMinutes()).pad(2) + ':' + (date.getUTCSeconds()).pad(2) + '.' + (date.getUTCMilliseconds()).pad(6);
    return isoformat_string;
}
*/



export default new Vuex.Store({
    state: {
        log_level: 'info',
        logger: log.getLogger("store"),
        language: 'de',
        stations: [],
        station_meta: [],
        stations_imported:false,
        pgv_data: {},
        detection_result_data: {},
        event_data: {},
        event_warning: {},
        event_archive: {},
        connected: false,
        message: '',
        server_id: '',
        server_state: '',
        utc_offset: undefined,
        server_time: undefined,
        transparent_period: 60,
        display_period: 600,
        settings: {
            show_settings: false,
            show_legend:true,
            show_map_info:true,
        },

        // The data received from the mss_dataserver.
        mssds_data: {
            history_period: undefined,
            current_pgv: {},
        },

        // The tracks dictionary.
        tracks: {
            realtime: {
                pgv_timeseries: []
            },
            archive: {

            },
            resize_toggle: false,
        },

        // The GUI Layout
        layout: {
            panes: {
                tracks: {
                    size: 0,
                    visible: false,
                },
                map_container: {
                    size: 100,
                    visible: true,
                    menu: {
                        size: 0,
                        visible: false,
                    },
                    map: {
                        size: 80,
                        visible: true,
                    },
                    info: {
                        size:20,
                        visible: true,
                    },
                    event_info: {
                        size: 0,
                        visible: false,
                    },
                },
                content: {
                    size: 0,
                    visible: false,
                },
            },
        },

        // The map info accordion state.
        map_info_accordion: {
            map_info: {
                expanded: true,
            },
            event_monitor: {
                expanded: true,
            },
            recent_events: {
                expanded: true,
            },
            station_info: {
                expanded: false,
            },
        },

        // The state of the display.
        display: {
            // The current mode of the display (realtime, archive)
            mode: 'realtime',
            settings: {
                realtime: {
                },
                archive: {
                    active_event: undefined,
                },
            },
        },

        // The station to inspect in the station infow.
        inspect_stations: [],

        popUpStored:[],

        // The leaflet map state.
        leaflet_map: {
            map_object: undefined,
            redraw: false,
        },

        map_config: { 
            proj_crs: "EPSG:32633",
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
            show_archive_event_cells: true,
        },

        prefix_options: {
            template: '[%t] - %l - %n:',
            levelFormatter: function (level) {
                return level.toUpperCase();
            },
            nameFormatter: function (name) {
                return name || 'root';
            },
            timestampFormatter: function (date) {
                return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
            },
            format: undefined
        },
    },

    getters: {
        log_level: state => {
            return state.log_level;
        },

        logger: state => {
            return state.logger;
        },

        prefix_options: state => {
            return state.prefix_options;
        },

        popUpStored_length: state=>{
            return state.popUpStored.length;
        },

        popUpStored: state=>{
            return state.popUpStored;
        },

        settings: state=>{
            return state.settings;
        },

        server_state: state => {
            return state.server_state;
        },

        server_time: state => {
            return moment.utc(state.server_time);
        },

        server_time_local: state => {
            return moment.utc(state.server_time).utcOffset(state.utc_offset / 60);
        },

        utc_offset: state => {
            // The UTC offset in minutes.
            return state.utc_offset / 60;
        },

        inspect_stations: state => {
            return state.inspect_stations;
        },

        layout: state => {
            return state.layout;
        },

        current_pgv: state => {
            var tmp = {}
            for (var key in state.pgv_data) {
                var last_ind = state.pgv_data[key].data.length - 1
                tmp[key] = state.pgv_data[key].data[last_ind]
            }
            return tmp
        },

        current_pgv_by_station: (state) => (station_id) => {
            if (state.mssds_data.current_pgv.pgv_data != undefined)
            {
                if (station_id in state.mssds_data.current_pgv.pgv_data) 
                {
                    return state.mssds_data.current_pgv.pgv_data[station_id];
                }
                else 
                {
                    return {'pgv_history': undefined,
                            'latest_pgv': undefined,
                            'latest_time': undefined};
                }
            }
            else
            {
                return {'pgv_history': undefined,
                        'latest_pgv': undefined,
                        'latest_time': undefined};
            }
        },

        current_pgv_by_station_old: (state, getters) => (station_id) => {
            if (station_id in state.pgv_data) 
            {
                let last_ind = state.pgv_data[station_id].data.length - 1;
                let cur_pgv = state.pgv_data[station_id].data[last_ind];
                let cur_time = state.pgv_data[station_id].time[last_ind];
                let time_range = getters.display_time_range;
                let time_limit = time_range[0].clone();
                time_limit.subtract(state.transparent_period, 'seconds');
                time_limit = time_limit.valueOf() / 1000;
                if (cur_time < time_limit)
                {
                    cur_pgv = undefined;
                }
                return cur_pgv;
            }
            else 
            {
                return undefined;
            }
        },

        pgv_by_station: (state) => (station_id) => {
            //var last_ind = state.pgv_data[station_id].data.length - 1
            state.logger.debug('Computing pgv_by_station.');
            return state.pgv_data[station_id]
        },

        // eslint-disable-next-line
        transparent_range_max_pgv_by_station: (state, getters) => (station_id) => {
            state.logger.debug('Computing transparent_range_max_pgv_by_station.');
            let max_pgv = undefined;
            let time_range = getters.display_time_range;

            if (time_range[0] != undefined)
            {
                let time_limit = time_range[0].clone();
                time_limit.subtract(state.transparent_period, 'seconds');
                time_limit = time_limit.valueOf() / 1000;
                if (station_id in state.pgv_data)
                {
                    let cur_data = []
                    // Search maximal the number of samples fitting the
                    // transparent_period. SPS of 1 second is assumed.
                    let start_index = state.pgv_data[station_id].time.length - state.transparent_period;
                    for (var k = start_index; k < state.pgv_data[station_id].time.length; k++)
                    {
                        var cur_time = state.pgv_data[station_id].time[k];
                        if (cur_time >= time_limit)
                        {
                            cur_data.push(state.pgv_data[station_id].data[k]);
                        }
                    }
                    //max_pgv = Math.max(...state.pgv_data[station_id].data);
                    max_pgv = Math.max(...cur_data);
                }
            }
            //state.logger.debug('max_pgv: ', max_pgv);

            return max_pgv;
        },

        data_length: (state) => (station_id) => {
            return state.pgv_data[station_id].data.length;
        },

        display_time_range: (state) => {
            if (state.server_time === undefined)
            {
                return [undefined, undefined];
            }
            else 
            {
                let end_date = state.server_time.clone()
                let start_date = end_date.clone().subtract(state.display_period, 'seconds')

                /*
                state.logger.debug('server_time: ', state.server_time.toISOString());
                state.logger.debug('start_date: ', start_date.toISOString());
                state.logger.debug('end_date: ', end_date.toISOString());
                */

                return [start_date, end_date]
            }
        },

        data_time_range: (state) => {
            let max_time = undefined;
            let min_time = undefined;
            if (state.mssds_data.current_pgv.pgv_data != undefined)
            {
                let pgv_data = state.mssds_data.current_pgv.pgv_data
                for (let key in pgv_data)
                {
                    let cur_time = pgv_data[key].latest_time
                    if (max_time === undefined)
                    {
                        max_time = cur_time;
                    }
                    else if (cur_time > max_time)
                    {
                        max_time = cur_time;
                    }

                    if (min_time === undefined)
                    {
                        min_time = cur_time;
                    }
                    else if (cur_time < min_time)
                    {
                        min_time = cur_time;
                    }
                }
            }
            state.logger.debug('min_time: ', min_time)
            state.logger.debug('max_time: ', max_time)

            if (min_time)
            {
                min_time = moment.unix(min_time).utc().utcOffset(state.utc_offset / 60);
            }

            if (max_time)
            {
                max_time = moment.unix(max_time).utc().utcOffset(state.utc_offset / 60);
            }

            let time_range ={'min_time': min_time,
                             'max_time': max_time};
            return time_range;
        },

        data_time_range_old: (state) => {
            var first_dates = [];
            var last_dates = [];
            for (var key in state.pgv_data) {
                // Get the first date of the data.
                var cur_date = state.pgv_data[key].time[0];
                first_dates.push(cur_date);

                var last_ind = state.pgv_data[key].time.length - 1;
                cur_date = state.pgv_data[key].time[last_ind];
                last_dates.push(cur_date);
            }
            var start_date = Math.min.apply(null, first_dates);
            var end_date = Math.max.apply(null, last_dates);
            return [start_date, end_date]
        },

        station_meta: (state) => {
            return state.station_meta;
        },

        station_meta_by_id: (state) => (station_id) => {
            let found_station = undefined;
            for(let k = 0; k < state.station_meta.length; k++) {
                if(state.station_meta[k].id === station_id) {
                    found_station = state.station_meta[k];
                }
            }
            return found_station;
        },

        stations_imported: (state) => {
            return state.stations_imported;
        },

        map_config: (state) => {
            return state.map_config;
        },

        leaflet_map: (state) => {
            return state.leaflet_map;
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
            return state.event_archive[pos].max_pgv

            /*
            var max_pgv = [];

            if (state.event_archive[pos].max_station_pgv)
            {
                max_pgv = Math.max.apply(null, Object.values(state.event_archive[pos].max_station_pgv));
            }

            if (max_pgv.length === 0)
            {
                max_pgv = undefined;
            }
            return max_pgv;
            */
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

        active_archive_event: (state) => {
            if (state.display.settings.archive.active_event != undefined)
            {
                return state.event_archive[state.display.settings.archive.active_event];
            }
            else
            {
                return undefined;
            }

        },

        // eslint-disable-next-line
        utm_to_wgs84: (state) => (coords) => {
            proj4.defs("EPSG:32633", "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs");
            state.logger.debug("coords: " + coords);
            return proj4('EPSG:32633').inverse(coords);
        },

        tracks: (state) => {
            return state.tracks;
        },

        pgv_timeseries_shown: (state) => (station_id) => {
            if (state.tracks.realtime.pgv_timeseries.includes(station_id))
            {
                return true;
            }
            else
            {
                return false;
            }
        },

        map_info_accordion(state) {
            return state.map_info_accordion;
        },

        is_realtime(state) {
            if (state.display.mode === 'realtime')
            {
                return true;
            }
            else
            {
                return false;
            }
        },
    },

    mutations: {
        SOCKET_ONOPEN(state, event) {
            state.logger.debug('SOCKET_ONOPEN event: ', event);
            Vue.prototype.$socket = event.currentTarget;
            state.connected = true;
            state.server_state = 'connection opened'
            state.logger.info("Connected to websocket server.");
            //console.info("state: ", state);
            //console.info("event: ", event);
            var msg = {'class': 'control',
                       'id': 'mode',
                       'payload': 'pgv'};
            Vue.prototype.$socket.send(JSON.stringify(msg));
        },

        SOCKET_ONMESSAGE(state, payload) {
            var msg_class = payload.class
            var msg_id = payload.id
            state.server_time = moment.utc(payload.server_time);

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
            state.logger.info("Disconnected from server.");
            state.logger.info("event: ", event);
        },

        SOCKET_ONERROR(state, event) {
            state.server_state = 'error';
            state.logger.error("Websocket error.");
            state.logger.error("state: ", state);
            state.logger.error("event: ", event);
        },

        SOCKET_RECONNECT(state, count) {
            state.server_state = 'reconnecting';
            state.logger.info("Reconnecting...");
            state.logger.debug("state: ", state);
            state.logger.info("reconnection count: ", count);
        },

        SOCKET_RECONNECT_ERROR(state) {
            state.server_state = 'reconnection error';
            state.logger.error("Error while reconnecting.");
            state.logger.debug(state);
        },

        load_station_metadata(state) {
            d3.csv("/assets/vue/nrt/data/current_mss_stations.csv").then( function(data) {
                for (var k = 0; k < data.length; k++)
                {
                    data[k].id = data[k].network + "." +  
                        data[k].name + "." + 
                        data[k].location + "." +
                        "pgv";
                    // Convert numbers from string to float.
                    data[k].x = parseFloat(data[k].x);
                    data[k].y = parseFloat(data[k].y);
                    data[k].z = parseFloat(data[k].z);
                    data[k].x_utm = parseFloat(data[k].x_utm);
                    data[k].y_utm = parseFloat(data[k].y_utm);
                }
                state.station_meta = data;
                state.stations_imported = true;
                state.logger.debug("Station metadata loaded.");
                //self.plot_stations();
            });
        },

        reset_stations(state) {
            state.stations_imported=false;
            for(var i=0;state.station_meta.length>i;i++){
                state.stations[i]=state.station_meta.slice();
            }
        },

        set_map_control(state, payload) {
            Vue.set(state.map_control, payload.property, payload.value);
        },

        set_show_archive_event(state, payload) {
            state.display.settings.archive.active_event = payload.public_id;
        },

        set_settings(state,payload) {
            state.settings = payload;
        },

        add_pop_up(state,payload) {
            state.popUpStored.push(payload);
        },

        show_settings(state,payload) {
            state.settings.show_settings = payload;
        },

        add_inspect_station(state, payload) {
            if (!state.inspect_stations.includes(payload))
            {
                state.inspect_stations.push(payload);
                if (state.inspect_stations.length == 1)
                {
                    state.map_info_accordion.station_info.expanded = true;
                }
            }
        },

        remove_inspect_station(state, payload) {
            if (state.inspect_stations.includes(payload))
            {
                state.inspect_stations.splice(state.inspect_stations.indexOf(payload), 1);
            }
        },

        add_track_pgv_timeseries(state, payload) {
            state.tracks.realtime.pgv_timeseries.push(payload);
            let n_realtime_tracks = state.tracks.realtime.pgv_timeseries.length
            if (n_realtime_tracks == 1)
            {
                state.layout.panes.tracks.visible = true;
                state.layout.panes.tracks.size = 15;
                state.layout.panes.map_container.size = 100 - state.layout.panes.tracks.size - state.layout.panes.content.size;
            }
        },

        remove_track_pgv_timeseries(state, payload) {
            state.tracks.realtime.pgv_timeseries.splice(state.tracks.realtime.pgv_timeseries.indexOf(payload), 1);
            let n_realtime_tracks = state.tracks.realtime.pgv_timeseries.length
            if (n_realtime_tracks == 0)
            {
                state.layout.panes.tracks.visible = false;
                state.layout.panes.tracks.size = 0;
                state.layout.panes.map_container.size = 100 - state.layout.panes.tracks.size - state.layout.panes.content.size;
            }
        },

        set_leaflet_map_object(state, payload) {
            state.leaflet_map.map_object = payload;
        },

        toggle_leaflet_map_redraw(state) {
            state.leaflet_map.redraw = !state.leaflet_map.redraw;
        },

        toggle_tracks_resize(state) {
            state.tracks.resize_toggle = !state.tracks.resize_toggle;
        },

        update_map_container_info_layout(state, payload) {
            state.layout.panes.map_container.info.map_info.size = payload[0].size
            state.layout.panes.map_container.info.archive_event_info.size = payload[1].size
            if (payload.lengh == 3)
            {
                state.layout.panes.map_container.info.station_info.size = payload[2].size
            }
        },

        set_map_container_right_pane_size(state, payload) {
            state.layout.panes.map_container.info.size = payload['map_info_size']
            state.layout.panes.map_container.event_info.size = payload['map_info_size']
        },

        set_map_info_accordion_expanded(state, payload) {
            state.map_info_accordion.map_info.expanded = payload[0];
            state.map_info_accordion.event_monitor.expanded = payload[1];
            state.map_info_accordion.recent_events.expanded = payload[2];
            state.map_info_accordion.station_info.expanded = payload[3];
        },


        activate_realtime_mode(state) {
            state.layout.panes.map_container.info.visible = true
            state.display.mode = 'realtime'
        },

        deactivate_realtime_mode(state) {
            state.layout.panes.map_container.info.visible = false
        },

        activate_archive_mode(state) {
            state.layout.panes.map_container.event_info.visible = true
            state.display.mode = 'archive'
        },

        deactivate_archive_mode(state) {
            state.layout.panes.map_container.event_info.visible = false
        },

        load_event_supplement(state) {
            state.logger.debug('before');
            setTimeout(function() {
                state.logger.debug('after');
                }, 2000);
        },



    },

    actions: {
        init_store({commit, state}) {
            state.logger.debug('Initializing the store.');
            commit('load_station_metadata');
            moment.locale(state.language);
        },

        set_display_mode({ commit, state }, payload) {
            if (payload.mode != state.display.mode)
            {
                switch(payload.mode)
                {
                    case 'realtime':
                        commit('deactivate_archive_mode');
                        commit('activate_realtime_mode');
                        break;

                    case 'archive':
                        commit('deactivate_realtime_mode');
                        commit('activate_archive_mode');
                        break;

                }
            }
        },

        view_event_in_archive({dispatch, commit}, payload) {
            
            let action_payload = { mode: 'archive' }
            dispatch('set_display_mode', action_payload)

            let mutation_payload = { public_id: payload.public_id };
            commit('set_show_archive_event', mutation_payload);
            
            dispatch('request_event_supplement', payload)
        },

        request_event_supplement({state}, payload) {

            
            let msg_payload = {'public_id': payload.public_id}
            let msg = {'class': 'request',
                       'id': 'event_supplement',
                       'payload': msg_payload};

            Vue.prototype.$socket.send(JSON.stringify(msg));
            state.logger.debug("Sent websocket message: ", msg);
        },
    }
});
