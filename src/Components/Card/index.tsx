import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoPower } from 'react-icons/io5'
import { FaRegLightbulb, FaLightbulb } from 'react-icons/fa';

import ThreedyContext from '../../Contexts/ThreedyContext';
import toggleEntity from '../../Utils/Toggle';

import MulticolorView from '../MulticolorView';
import PrinterView from '../PrinterView';
import Stats from '../Stats';

import styles from './styles';
import Camera from "../Camera";
import {percentComplete} from "../Stats/utils";
import {HassEntity} from '../types';


const Card = ({ }) => {

    const {
        config,
        hass
    } = useContext(ThreedyContext);

    const [
        hiddenOverride,
        setHiddenOveride
    ] = useState(false);

    const [
        showVideo,
        setShowVideo
    ] = useState(false);

    const toggleVideo = config.camera_entity ? () => {
        setShowVideo(!showVideo)
    } : () => {}

    const [
        cameraEntityId,
        setCameraEntityId
    ] = useState<string | undefined>(undefined);

    const [
        cameraEntityState,
        setCameraEntityState
    ] = useState<HassEntity | undefined>(undefined);

    const [
        lightEntityId,
        setLightEntityId
    ] = useState<string | undefined>(undefined);

    const [
        lightIsOn,
        setLightIsOn
    ] = useState<boolean>(false);

    const [
        hasColorbox,
        setHasColorbox
    ] = useState<boolean>(false);

    const [
        isHidden,
        setIsHidden
    ] = useState<boolean>(false);

    const [
        printStateEntityId,
        setPrintStateEntityId
    ] = useState<string>('');

    const [
        printStateString,
        setPrintStateString
    ] = useState<string>('unknown');

    const [
        colorBoxEntityId,
        setColorBoxEntityId
    ] = useState<string>('');

    const [
        statusColor,
        setStatusColor
    ] = useState<string>('#ffc107');

    React.useEffect(() => {
        setCameraEntityId(config.camera_entity);
    }, [config.camera_entity]);

    React.useEffect(() => {
        setCameraEntityState(hass.states[cameraEntityId]);
    }, [cameraEntityId, hass.states[cameraEntityId]]);

    React.useEffect(() => {
        setLightEntityId(config.light_entity);
    }, [config.light_entity]);

    React.useEffect(() => {
        setLightIsOn(
            lightEntityId ? (hass.states[lightEntityId] || {state: 'off'}).state === 'on' : false
        );
    }, [lightEntityId, hass.states[lightEntityId]]);

    React.useEffect(() => {
        setPrintStateEntityId(
            (config.printer_type == 'Anycubic') ?
                `${config.base_entity}_print_state`
                : (config.use_mqtt ?
                    `${config.base_entity}_print_status`
                    : `${config.base_entity}_current_state`)
        );
    }, [config.base_entity, config.printer_type, config.use_mqtt]);

    React.useEffect(() => {
        setColorBoxEntityId(
            `${config.base_entity}_multi_color_box_spools`
        );
    }, [config.base_entity]);

    React.useEffect(() => {
        setPrintStateString(
            (hass.states[printStateEntityId] || {state: 'unknown'}).state
        );
    }, [printStateEntityId, hass.states[printStateEntityId]]);

    React.useEffect(() => {
        setHasColorbox(
            (config.printer_type == 'Anycubic') ?
                (hass.states[colorBoxEntityId] || {state: 'inactive'}).state === 'active'
                : false
        );
    }, [config.printer_type, colorBoxEntityId, hass.states[colorBoxEntityId]]);

    React.useEffect(() => {
        setIsHidden(
            (!(['printing', 'preheating'].includes(printStateString.toLowerCase()))) && !hiddenOverride
        );
    }, [printStateString, hiddenOverride]);

    React.useEffect(() => {
        setStatusColor(
            (['printing', 'preheating'].includes(printStateString.toLowerCase())) ?
                "#4caf50"
                : printStateString === "unknown" ?
                    "#f44336"
                    : (printStateString === "Operational" || printStateString.toLowerCase() === 'finished') ?
                        "#00bcd4"
                        : "#ffc107"
        );
    }, [printStateString]);



    const theme = config.theme || 'Default';
    const vertical = config.vertical;
    const round = config.round;
    const percent = percentComplete(hass, config);


    const borderRadius = styles[theme] ? styles[theme].borderRadius : styles['Default'].borderRadius;

    const neumorphicShadow = hass.themes.darkMode ? '-5px -5px 8px rgba(50, 50, 50,.2),5px 5px 8px rgba(0,0,0,.08)' : '-4px -4px 8px rgba(255,255,255,.5),5px 5px 8px rgba(0,0,0,.03)'
    const defaultShadow = 'var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) )'

    return (
        <motion.div
            animate={{}}
            transition={{ ease: "easeInOut", duration: 0.25 }}
            style={{
                ...styles.Card,
                ...styles[theme],
                borderRadius: (isHidden ? borderRadius * 1 : borderRadius * 2),
                fontFamily: config.font || 'sans-serif',
                boxShadow: theme === 'Neumorphic' ? neumorphicShadow : defaultShadow
            }}
        >
            <div style={{ ...styles.Root }}>

                <div
                    style={{
                        ...styles.Header,
                        justifyContent: config.power_entity || config.light_entity ? 'space-between' : 'center'
                    }}
                >

                    {
                        config.light_entity && !config.power_entity ? (
                            <div style={{ ...styles.PowerButton }} />
                        ) : (null)
                    }

                    {
                        config.power_entity ? (
                            <button
                                style={{ ...styles.PowerButton }}
                                onClick={() => toggleEntity(hass, config.power_entity)}
                            >
                                <IoPower />
                            </button>
                        ) : (null)
                    }

                    <button
                        style={{ ...styles.NameStatus }}
                        onClick={() => setHiddenOveride(!hiddenOverride)}
                    >
                        <div
                            style={{
                                ...styles.StatusDot,
                                backgroundColor: statusColor
                            }}
                        />
                        <p style={{ ...styles.HeaderText }}>{ config.name || '(no name)' }</p>
                    </button>

                    {
                        config.light_entity ? (
                            <button
                                style={{ ...styles.PowerButton }}
                                onClick={() => toggleEntity(hass, config.light_entity)}
                            >
                                {
                                    lightIsOn ? <FaLightbulb /> : <FaRegLightbulb />
                                }
                            </button>
                        ) : (null)
                    }

                    {
                        config.power_entity && !config.light_entity ? (
                            <div style={{ ...styles.PowerButton }} />
                        ) : (null)
                    }

                </div>

                <motion.div
                    style={{ ...styles.Content, flexDirection: vertical ? 'column' : 'row' }}
                    animate={{ height: isHidden ? 0.0 : 'auto', opacity: isHidden ? 0.0 : 1.0, scale: isHidden ? 0.0 : 1.0 }}
                    transition={{ ease: "easeInOut", duration: 0.25 }}
                >
                    <div style={{ ...styles.Section, width: vertical ? '100%' : '50%', height: vertical ? 'auto' : '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingLeft: vertical ? 64 : 16, paddingRight: vertical ? 64 : 16 }}>
                        <PrinterView
                            toggleVideo={toggleVideo}
                            hasCamera={config.camera_entity !== undefined}
                            style={{width: vertical ? 'auto' : '100%', flexGrow: 1}}
                        />
                        {
                            vertical ? (
                                <p style={{ width: '50%', fontSize: 36, textAlign: 'center', fontWeight: 'bold' }}>{round ? Math.round(percent) : percent}%</p>
                            ) : null
                        }
                    </div>
                    <div
                        style={{
                            ...styles.Section,
                            paddingLeft: vertical ? 32 : 16,
                            paddingRight: vertical ? 32 : 32,
                            width: vertical ? '100%' : '50%',
                            height: vertical ? 'auto' : '100%'
                        }}
                    >
                        <Stats showPercent={!vertical} />
                    </div>
                </motion.div>

                {
                    hasColorbox ? (
                        <motion.div
                            style={{ ...styles.Content, flexDirection: vertical ? 'column' : 'row' }}
                            animate={{ height: isHidden ? 0.0 : 'auto', opacity: isHidden ? 0.0 : 1.0, scale: isHidden ? 0.0 : 1.0 }}
                            transition={{ ease: "easeInOut", duration: 0.25 }}
                        >
                            <div
                                style={{
                                    ...styles.MulticolorSection,
                                    width: '100%',
                                    height: vertical ? 'auto' : '100%'
                                }}
                            >
                                <MulticolorView />
                            </div>
                        </motion.div>
                    ) : (null)
                }

            </div>

            {
                cameraEntityState ? (
                    <Camera
                        visible={showVideo}
                        toggleVideo={() => setShowVideo(false)}
                        cameraEntity={cameraEntityState}
                    />
                ) : (null)
            }

        </motion.div>
    )

}

export default Card;
