import React from 'react';
import {HomeAssistant, ThreedyCondition, ThreedyConfig} from "../../types";
import TemperatureStat from "./TemperatureStat";
import { getEntity } from '../../Utils/HomeAssistant';
import Stat from "./Stat";
import TimeStat from "./TimeStat";


/*


    const entityEnding = (() => {
        switch (condition) {
            case 'Status':
                return config.use_mqtt ? '_print_status' : '_current_state'
            case 'ETA':
                return config.use_mqtt ? '_print_time_left' : '_time_remaining'
            case 'Elapsed':
                return config.use_mqtt ? '_print_time' : '_time_elapsed'
            case 'Hotend':
                return config.use_mqtt ? '_tool_0_temperature' : '_actual_tool0_temp'
            case 'Bed':
                return config.use_mqtt ? '_bed_temperature' : '_actual_bed_temp'
            default:
                return undefined
        }
    })();


 */

const toTitleCase = (str: any) => {
        return str.toLowerCase().split(' ').map((word: any) => {
          return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
      }


/**
 * Function to dynamically render a stat by determining what type of stat it is
 * @param hass
 * @param config
 * @param condition
 */
const renderCondition = (
    hass: HomeAssistant,
    config: ThreedyConfig,
    condition: ThreedyCondition | string
) => {

    const entity = (suffix: string) => {
        return getEntity(hass, `${config.base_entity}${suffix}`) || {state: 'unavailable', attributes: {}};
    }
    const mqtt = config.use_mqtt;
    const anycubic = (config.printer_type == 'Anycubic');

    switch (condition) {
        case ThreedyCondition.Status:
            return (
                <Stat
                    key={"status"}
                    name={"Status"}
                    value={ toTitleCase(entity( anycubic ? '_print_state' : mqtt ? '_print_status' : '_current_state').state) }
                />
            )
        case ThreedyCondition.ETA:
            return (
                <TimeStat
                    key={"eta"}
                    timeEntity={ entity( anycubic ? '_project_time_remaining' : mqtt ? '_print_time_left' : '_time_remaining' ) }
                    condition={condition}
                    config={config}
                    direction={0}
                />
            )
        case ThreedyCondition.Elapsed:
            return (
                <TimeStat
                    key={"elapsed"}
                    timeEntity={ entity( anycubic ? '_project_time_elapsed' : mqtt ? '_print_time' : '_time_elapsed' ) }
                    condition={condition}
                    config={config}
                    direction={1}
                />
            )

        case ThreedyCondition.Remaining:
            return (
                <TimeStat
                    key={"remaining"}
                    timeEntity={ entity( anycubic ? '_project_time_remaining' : mqtt ? '_print_time_left' : '_time_remaining' ) }
                    condition={condition}
                    config={config}
                    direction={-1}
                />
            )

        case ThreedyCondition.Bed:
            return (
                <TemperatureStat
                    key={"bed"}
                    name={"Bed"}
                    temperatureEntity={ entity( anycubic ? '_hotbed_temperature' : mqtt ? '_bed_temperature' : '_actual_bed_temp' ) }
                    config={config}
                />
            )

        case ThreedyCondition.Hotend:
            return (
                <TemperatureStat
                    key={"hotend"}
                    name={"Hotend"}
                    temperatureEntity={ entity( anycubic ? '_nozzle_temperature' : mqtt ? '_tool_0_temperature' : '_actual_tool0_temp' ) }
                    config={config}
                />
            )


        default:
            return (
                <Stat
                    key={"unknown"}
                    name={"Unknown"}
                    value={"<unknown>"}
                />
            )

    }

}

/**
 * Function to render all stats
 * @param hass
 * @param config
 */
const renderStats = (
    hass: HomeAssistant,
    config: ThreedyConfig
) => {

    return config.monitored.map(
        condition => renderCondition( hass, config, condition )
    )

}

const percentComplete = (
    hass: HomeAssistant,
    config: ThreedyConfig
) => {
    return (hass.states[(config.printer_type == 'Anycubic') ? `${config.base_entity}_project_progress` : config.use_mqtt ? `${config.base_entity}_print_progress` : `${config.base_entity}_job_percentage`] || { state: -1.0 }).state;
}

export {
    renderStats,
    percentComplete
}
