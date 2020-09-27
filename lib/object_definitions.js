const object_definitions = {
    'devices': {
        type: 'channel',
        common: {
            name: 'Devices'
        },
        native: {}
    },
    'devices.device': {
        type: 'channel',
        common: {
            name: 'Device'
        },
        native: {}
    },
    'devices.device.altitude': {
        type: 'state',
        common: {
            'name': 'Altitude',
            'role': 'value.gps.elevation',
            'type': 'number',
            'unit': '°',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.battery_level': {
        type: 'state',
        common: {
            'name': 'Battery level',
            'role': 'value.battery',
            'type': 'number',
            'unit': '%',
            'write': false,
            'read': true
        },
        native: {}
    },

    'devices.device.course': {
        type: 'state',
        common: {
            'name': 'Course',
            'role': 'state',
            'type': 'number',
            'unit': '°',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.device_name': {
        type: 'state',
        common: {
            'name': 'Device name',
            'role': 'info.name',
            'type': 'string',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.distance': {
        type: 'state',
        common: {
            'name': 'Distance',
            'role': 'value.distance',
            'type': 'number',
            'unit': 'm',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.geofence_ids': {
        type: 'state',
        common: {
            'name': 'Geofence IDs',
            'role': 'json',
            'type': 'string',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.geofences': {
        type: 'state',
        common: {
            'name': 'Geofences',
            'role': 'json',
            'type': 'string',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.latitude': {
        type: 'state',
        common: {
            'name': 'Latitude',
            'role': 'value.gps.latitude',
            'type': 'number',
            'unit': '°',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.longitude': {
        type: 'state',
        common: {
            'name': 'Longitude',
            'role': 'value.gps.longitude',
            'unit': '°',
            'type': 'number',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.motion': {
        type: 'state',
        common: {
            'name': 'Motion',
            'role': 'sensor.motion',
            'type': 'boolean',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.speed': {
        type: 'state',
        common: {
            'name': 'Speed',
            'role': 'value.speed',
            'type': 'number',
            'unit': 'km/h',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.total_distance': {
        type: 'state',
        common: {
            'name': 'Total distance',
            'role': 'value.distance',
            'type': 'number',
            'unit': 'm',
            'write': false,
            'read': true
        },
        native: {}
    },
    'devices.device.unique_id': {
        type: 'state',
        common: {
            'name': 'Unique ID',
            'role': 'state',
            'type': 'string',
            'write': false,
            'read': true
        },
        native: {}
    }
};

module.exports = { defObj: object_definitions };