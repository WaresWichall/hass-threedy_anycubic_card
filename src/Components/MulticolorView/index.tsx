import React, { useContext, useRef, useEffect } from 'react';
import ThreedyContext from '../../Contexts/ThreedyContext';

import styles from './styles';

const MulticolorView = ({ toggleVideo, hasCamera, style }) => {

    const {
        hass,
        config
    } = useContext(ThreedyContext);

    const spool_list =
        (config.printer_type == 'Anycubic') ?
            (hass.states[`${config.base_entity}_multi_color_box_spools`] || {attributes: {spool_info: []}}).attributes.spool_info
            : [];

    const ref = useRef();

    return (
        <div
            ref={ref}
            style={{
                ...styles.MulticolorView,
                ...style,
                cursor: hasCamera ? 'pointer' : 'default'
            }}
        >
            {
                spool_list.map((spool, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.SpoolInfo,
                            ...style
                        }}
                    >
                        <div
                            style={{
                                ...styles.SpoolColorRing,
                                ...style,
                                backgroundColor: (spool.spool_loaded) ? `rgb(${spool.color[0]}, ${spool.color[1]}, ${spool.color[2]})` : '#aaa'
                            }}
                        >
                            <div
                                style={{
                                    ...styles.SpoolColorNum,
                                    ...style
                                }}
                            >
                                {index + 1}
                            </div>
                        </div>
                        <div
                            style={{
                                ...styles.MaterialType,
                                ...style
                            }}
                        >
                            {(spool.spool_loaded) ? spool.material_type : '---'}
                        </div>
                    </div>
                ))
            }
        </div>
    )

}

export default MulticolorView;
