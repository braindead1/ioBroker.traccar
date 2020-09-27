'use strict';

/*
 * Created with @iobroker/create-adapter v1.27.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const axios = require('axios').default;
const defObj = require('./lib/object_definitions').defObj;

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

                // Process devices
                this.setObjectAndState('devices', 'devices');

                for (const device of devices) {
                    const position = positions.find(p => p.id === device.positionId);

                    this.setObjectAndState('devices.device', 'devices.' + device.id, device.name);

                    this.setObjectAndState('devices.device.altitude', 'devices.' + device.id + '.altitude', null, position.altitude);

                    this.setObjectAndState('devices.device.battery_level', 'devices.' + device.id + '.battery_level', null, position.attributes.batteryLevel);

                    this.setObjectAndState('devices.device.course', 'devices.' + device.id + '.course', null, position.course);

                    this.setObjectAndState('devices.device.device_name', 'devices.' + device.id + '.device_name', null, device.name);

                    this.setObjectAndState('devices.device.distance', 'devices.' + device.id + '.distance', null, position.attributes.distance);

                    this.setObjectAndState('devices.device.geofence_ids', 'devices.' + device.id + '.geofence_ids', null, JSON.stringify(device.geofenceIds));

                    const geofencesState = [];
                    for (const geofenceId of device.geofenceIds) {
                        const geofence = geofences.find(element => element.id === geofenceId);
                        geofencesState.push(geofence.name);
                    }
                    this.setObjectAndState('devices.device.geofences', 'devices.' + device.id + '.geofences', null, JSON.stringify(geofencesState));

                    this.setObjectAndState('devices.device.latitude', 'devices.' + device.id + '.latitude', null, position.latitude);

                    this.setObjectAndState('devices.device.longitude', 'devices.' + device.id + '.longitude', null, position.longitude);

                    this.setObjectAndState('devices.device.motion', 'devices.' + device.id + '.motion', null, position.attributes.motion);

                    this.setObjectAndState('devices.device.speed', 'devices.' + device.id + '.speed', null, position.speed);

                    this.setObjectAndState('devices.device.total_distance', 'devices.' + device.id + '.total_distance', null, position.attributes.totalDistance);

                    this.setObjectAndState('devices.device.unique_id', 'devices.' + device.id + '.unique_id', null, device.uniqueId);
                }
            })
            .catch(async errors => {
                this.log.error(errors);
            });

        this.queryTimeout = setTimeout(() => {
            this.updateTraccarData();
        }, this.config.updateInterval * 1000);
    }

    /**
     * Is used to create and object and set the value
     * @param {string} objectId
     * @param {string} stateId
     * @param {string | null} stateName
     * @param {*} value
     */
    async setObjectAndState(objectId, stateId, stateName = null, value = null) {
        let obj;

        if (defObj[objectId]) {
            obj = defObj[objectId];
        } else {
            obj = {
                type: 'state',
                common: {
                    name: stateName,
                    type: 'mixed',
                    role: 'state',
                    read: true,
                    write: true
                },
                native: {}
            };
        }

        if (stateName !== null) {
            obj.common.name = stateName;
        }

        await this.setObjectNotExistsAsync(stateId, obj);

        if (value !== null) {
            await this.setStateChangedAsync(stateId, {
                val: value,
                ack: true
            });
        }
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