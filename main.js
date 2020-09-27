'use strict';

/*
 * Created with @iobroker/create-adapter v1.27.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const axios = require('axios').default;

class Traccar extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'traccar',
        });

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));

        this.queryTimeout = null;
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Reset adapter connection
        this.setState('info.connection', false, true);

        // Log configuration
        this.log.debug('Server IP: ' + this.config.traccarIp);
        this.log.debug('Port: ' + this.config.traccarPort);
        this.log.debug('Username: ' + this.config.traccarUsername);
        this.log.debug('Password: ' + (this.config.traccarPassword !== '' ? '**********' : 'no password configured'));
        this.log.debug('Update interval: ' + this.config.updateInterval);

        // Adapter is up and running
        this.log.debug('Adapter is up and running');
        this.setState('info.connection', true, true);

        this.updateTraccarData();
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Reset adapter connection
            this.setState('info.connection', false, true);

            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called to update Traccar data
     */
    async updateTraccarData() {
        const baseUrl = 'http://' + this.config.traccarIp + ':' + this.config.traccarPort + '/api';
        const axiosOptions = {
            auth: {
                username: this.config.traccarUsername,
                password: this.config.traccarPassword
            }
        };

        const getDevices = axios.get(baseUrl + '/devices', axiosOptions);
        const getPosiions = axios.get(baseUrl + '/positions', axiosOptions);
        const getGeofences = axios.get(baseUrl + '/geofences', axiosOptions);

        await axios.all([getDevices, getPosiions, getGeofences])
            .then(async responses => {
                const devices = responses[0].data;
                const positions = responses[1].data;
                const geofences = responses[2].data;

                // Process geofences
                await this.setObjectNotExistsAsync('devices', {
                    type: 'channel',
                    common: {
                        name: 'Devices'
                    },
                    native: {}
                });

                for (const device of devices) {
                    const position = positions.find(p => p.id === device.positionId);

                    await this.setObjectNotExistsAsync('devices.' + device.id, {
                        type: 'channel',
                        common: {
                            name: device.name
                        },
                        native: {}
                    });

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.unique_id', {
                        type: 'state',
                        common: {
                            'name': 'Unique ID',
                            'role': 'state',
                            'type': 'string',
                            'write': false,
                            'read': true
                        },
                        native: {}
                    });

                    this.setStateChanged('devices.' + device.id + '.unique_id', device.uniqueId);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.device_name', {
                        type: 'state',
                        common: {
                            'name': 'Device name',
                            'role': 'info.name',
                            'type': 'string',
                            'write': false,
                            'read': true
                        },
                        native: {}
                    });

                    this.setStateChanged('devices.' + device.id + '.device_name', device.name);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.geofence_ids', {
                        type: 'state',
                        common: {
                            'name': 'Geofence IDs',
                            'role': 'json',
                            'type': 'string',
                            'write': false,
                            'read': true
                        },
                        native: {}
                    });

                    this.setStateChanged('devices.' + device.id + '.geofence_ids', JSON.stringify(device.geofenceIds));

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.geofences', {
                        type: 'state',
                        common: {
                            'name': 'Geofences',
                            'role': 'json',
                            'type': 'string',
                            'write': false,
                            'read': true
                        },
                        native: {}
                    });

                    const geofencesState = [];
                    for (const geofenceId of device.geofenceIds) {
                        const geofence = geofences.find(element => element.id === geofenceId);
                        geofencesState.push(geofence.name);
                    }
                    this.setStateChanged('devices.' + device.id + '.geofences', JSON.stringify(geofencesState));

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.battery_level', {
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
                    });

                    this.setStateChanged('devices.' + device.id + '.battery_level', position.attributes.batteryLevel);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.distance', {
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
                    });

                    this.setStateChanged('devices.' + device.id + '.distance', position.attributes.distance);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.total_distance', {
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
                    });

                    this.setStateChanged('devices.' + device.id + '.total_distance', position.attributes.totalDistance);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.speed', {
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
                    });

                    this.setStateChanged('devices.' + device.id + '.speed', position.speed);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.motion', {
                        type: 'state',
                        common: {
                            'name': 'Motion',
                            'role': 'sensor.motion',
                            'type': 'boolean',
                            'write': false,
                            'read': true
                        },
                        native: {}
                    });

                    this.setStateChanged('devices.' + device.id + '.motion', position.attributes.motion);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.latitude', {
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
                    });

                    this.setStateChanged('devices.' + device.id + '.latitude', position.latitude);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.longitude', {
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
                    });

                    this.setStateChanged('devices.' + device.id + '.longitude', position.longitude);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.altitude', {
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
                    });

                    this.setStateChanged('devices.' + device.id + '.altitude', position.altitude);

                    await this.setObjectNotExistsAsync('devices.' + device.id + '.course', {
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
                    });

                    this.setStateChanged('devices.' + device.id + '.course', position.course);
                }
            })
            .catch(async errors => {
                this.log.error(errors);
            });

        this.queryTimeout = setTimeout(() => {
            this.updateTraccarData();
        }, this.config.updateInterval * 1000);
    }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Traccar(options);
} else {
    // otherwise start the instance directly
    new Traccar();
}