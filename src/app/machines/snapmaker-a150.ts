import type { Machine } from '@snapmaker/luban-platform';
import { MachineType } from '@snapmaker/luban-platform';

import {
    dualExtrusionPrintToolHead,
    highPower10WLaserToolHead,
    printToolHead,
    standardLaserToolHead,
    standardCNCToolHead,
    highPower200WCNCToolHead,
    L20WLaserToolModule,
    L2WLaserToolModule,
} from './snapmaker-2-toolheads';
import { JobOffsetMode } from '../constants/coordinate';

/*
    {
        value: 'A150',
        alias: ['SM2-S', 'Snapmaker 2.0 A150'],
    },
*/

export const machine: Machine = {
    identifier: 'Snapmaker 2.0 A150',

    fullName: 'Snapmaker 2.0 A150',
    machineType: MachineType.MultiFuncionPrinter,

    img: '/resources/images/machine/size-2.0-A150.png',

    metadata: {
        size: { x: 160, y: 160, z: 140 },

        toolHeads: [
            {
                identifier: printToolHead.identifier,
                configPath: 'printing/a150_single',
            },
            {
                identifier: dualExtrusionPrintToolHead.identifier,
                configPath: 'printing/a150_dual',
                workRange: {
                    min: [0, 0, 0],
                    max: [145, 145, 105],
                },
            },
            {
                identifier: standardLaserToolHead.identifier,
                configPath: 'laser/a150_1600mw',
                workRange: {
                    min: [0, 0, 0],
                    max: [167, 165, 150],
                },
                supportCameraCapture: true,
                runBoundaryModeOptions: [
                    {
                        label: 'Laser Spot',
                        value: JobOffsetMode.LaserSpot,
                    },
                ]
            },
            {
                identifier: highPower10WLaserToolHead.identifier,
                configPath: 'laser/a150_10w',
                workRange: {
                    min: [0, 0, 0],
                    max: [167, 165, 120], // TODO: check data
                },
                supportCameraCapture: true,
                runBoundaryModeOptions: [
                    {
                        label: 'Laser Spot',
                        value: JobOffsetMode.LaserSpot,
                    },
                ]
            },
            {
                identifier: L20WLaserToolModule.identifier,
                configPath: 'laser/a150_20w',
                workRange: {
                    min: [0, 0, 0],
                    max: [160, 155, 0], // Correct this later
                },
                disableRemoteStartPrint: true,
                runBoundaryModeOptions: [
                    // {
                    //     label: 'Laser Spot',
                    //     value: JobOffsetMode.LaserSpot,
                    // },
                ]
            },
            {
                identifier: L2WLaserToolModule.identifier,
                configPath: 'laser/a150_2w',
                workRange: {
                    min: [0, 0, 0],
                    max: [155, 150, 0], // Correct this later
                },
                disableRemoteStartPrint: false,
                runBoundaryModeOptions: [
                    {
                        label: 'Crosshair',
                        value: JobOffsetMode.Crosshair,
                    }
                ]
            },
            {
                identifier: standardCNCToolHead.identifier,
                configPath: 'cnc/a150_standard',
            },
            {
                identifier: highPower200WCNCToolHead.identifier,
                configPath: 'cnc/200W',
            }
        ],

        slicerVersion: 0,
    },

    series: 'Snapmaker 2.0',
    seriesLabel: 'key-Luban/Machine/MachineSeries-A150',
    label: 'key-Luban/Machine/MachineSeries-Snapmaker 2.0 A150',
};
