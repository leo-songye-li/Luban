import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';
import potrace from 'potrace';
import { APP_CACHE_IMAGE } from '../constants';
import { pathWithRandomSuffix } from './random-utils';

const bit = function (x) {
    if (x >= 128) {
        return 255;
    } else {
        return 0;
    }
};

const normailize = function (x) {
    if (x < 0) {
        return 0;
    } else if (x > 255) {
        return 255;
    }
    return x;
};


const algorithms = {
    Atkinson: [
        [0, 0, 1 / 8, 1 / 8],
        [1 / 8, 1 / 8, 1 / 8, 0],
        [0, 1 / 8, 0, 0]
    ],
    Burks: [
        [0, 0, 0, 8 / 32, 4 / 32],
        [2 / 32, 4 / 32, 8 / 32, 4 / 32, 2 / 32]
    ],
    FloyedSteinburg: [
        [0, 0, 7 / 16],
        [3 / 16, 5 / 16, 1 / 16]
    ],
    JarvisJudiceNinke: [
        [0, 0, 0, 7 / 18, 5 / 48],
        [3 / 48, 5 / 48, 7 / 48, 5 / 48, 3 / 48],
        [1 / 48, 3 / 48, 5 / 48, 3 / 48, 1 / 48]
    ],
    Sierra2: [
        [0, 0, 0, 4 / 16, 3 / 16],
        [1 / 16, 2 / 16, 3 / 16, 2 / 16, 1 / 16]
    ],
    Sierra3: [
        [0, 0, 0, 5 / 32, 3 / 32],
        [2 / 32, 4 / 32, 5 / 32, 4 / 32, 2 / 32],
        [0, 2 / 32, 3 / 32, 2 / 32, 0]
    ],
    SierraLite: [
        [0, 0, 2 / 4],
        [1 / 4, 1 / 4, 0]
    ],
    Stucki: [
        [0, 0, 0, 8 / 42, 4 / 42],
        [2 / 42, 4 / 42, 8 / 42, 4 / 42, 2 / 42],
        [1 / 42, 2 / 42, 4 / 42, 2 / 42, 1 / 42]
    ]
};

function processGreyscale(param) {
    const filename = path.basename(param.originSrc);
    const outputFilename = pathWithRandomSuffix(filename);

    const { sizeWidth, sizeHeight, whiteClip, algorithm, density } = param;

    const matrix = algorithms[algorithm];
    const _matrixHeight = matrix.length;
    const _matrixWidth = matrix[0].length;


    let _startingOffset = 0;
    for (let k = 1; k < _matrixWidth; k++) {
        if (matrix[0][k] > 0) {
            _startingOffset = k - 1;
            break;
        }
    }

    return Jimp.read(`${APP_CACHE_IMAGE}/${filename}`)
        .then(img => new Promise(resolve => {
            img
                .resize(sizeWidth * density, sizeHeight * density)
                .brightness((param.brightness - 50.0) / 50)
                .contrast((param.contrast - 50.0) / 50)
                .quality(100)
                .greyscale()
                .scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
                    for (let k = 0; k < 3; ++k) {
                        if (img.bitmap.data[idx + k] >= whiteClip) {
                            img.bitmap.data[idx + k] = 255;
                        }
                    }
                })
                .scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
                    for (let k = 0; k < 3; ++k) {
                        let _idx = idx + k;
                        const origin = img.bitmap.data[_idx];
                        img.bitmap.data[_idx] = bit(origin);

                        const err = -img.bitmap.data[_idx] + origin;

                        for (let i = 0; i < _matrixWidth; i++) {
                            for (let j = 0; j < _matrixHeight; j++) {
                                if (matrix[j][i] > 0) {
                                    let _x = x + i - _startingOffset;
                                    let _y = y + j;

                                    if (_x >= 0 && _x < img.bitmap.width && _y < img.bitmap.height) {
                                        let _idx2 = _idx + (_x - x) * 4 + (_y - y) * img.bitmap.width * 4;
                                        img.bitmap.data[_idx2] = normailize(img.bitmap.data[_idx2] + matrix[j][i] * err);
                                    }
                                }
                            }
                        }
                    }
                })
                .write(`${APP_CACHE_IMAGE}/${outputFilename}`, () => {
                    resolve(outputFilename);
                });
        }));
}

function processBw(param) {
    const { originSrc, sizeWidth, sizeHeight, density, bwThreshold } = param;

    const filename = path.basename(originSrc);
    const outputFilename = pathWithRandomSuffix(filename);

    return Jimp.read(`${APP_CACHE_IMAGE}/${filename}`)
        .then(img => new Promise(resolve => {
            img.resize(sizeWidth * density, sizeHeight * density)
                .greyscale()
                .scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
                    for (let k = 0; k < 3; ++k) {
                        let value = img.bitmap.data[idx + k];
                        if (value <= bwThreshold) {
                            img.bitmap.data[idx + k] = 0;
                        } else {
                            img.bitmap.data[idx + k] = 255;
                        }
                    }
                    // whitenize transparent
                    if (img.bitmap.data[idx + 3] === 0) {
                        for (let k = 0; k < 3; ++k) {
                            img.bitmap.data[idx + k] = 255;
                        }
                        img.bitmap.data[idx + 3] = 255;
                    }
                })
                .write(`${APP_CACHE_IMAGE}/${outputFilename}`, () => {
                    resolve(outputFilename);
                });
        }));
}

function processVector(param) {
    const { originSrc, vectorThreshold, isInvert, turdSize } = param;

    const pathInfo = path.parse(originSrc);
    const filename = pathInfo.base;
    const outputFilename = pathWithRandomSuffix(pathInfo.name + '.svg');

    let params = {
        threshold: vectorThreshold,
        color: 'black',
        background: 'white',
        blackOnWhite: !isInvert,
        turdSize: turdSize
    };

    return new Promise((resolve, reject) => {
        potrace.trace(`${APP_CACHE_IMAGE}/${filename}`, params, (err, svg) => {
            if (err) {
                reject(err);
                return;
            }
            fs.writeFile(`${APP_CACHE_IMAGE}/${outputFilename}`, svg, () => {
                resolve(outputFilename);
            });
        });
    });
}

function process(param) {
    const mode = param.mode;
    if (mode === 'greyscale') {
        return processGreyscale(param);
    } else if (mode === 'bw') {
        return processBw(param);
    } else {
        return processVector(param);
    }
}

export default process;