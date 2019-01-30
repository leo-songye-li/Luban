import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
    BOUND_SIZE
} from '../../constants';
import i18n from '../../lib/i18n';
// import { toFixed } from '../../lib/numeric-utils';
import { NumberInput as Input } from '../../components/Input';
import Space from '../../components/Space';
import TipTrigger from '../../components/TipTrigger';
import { actions } from '../../reducers/cnc';
import styles from '../styles.styl';

class ConfigRasterGreyscale extends PureComponent {
    static propTypes = {
        model: PropTypes.object,
        targetDepth: PropTypes.number,
        stepDown: PropTypes.number,
        safetyHeight: PropTypes.number,
        stopHeight: PropTypes.number,
        isInvert: PropTypes.bool,
        updateConfig: PropTypes.func.isRequired
    };

    actions = {
        onChangeTargetDepth: (targetDepth) => {
            if (targetDepth > BOUND_SIZE) {
                return;
            }
            this.props.updateConfig({ targetDepth: targetDepth });
            if (targetDepth < this.props.stepDown) {
                this.props.updateConfig({ stepDown: targetDepth });
            }
        },
        onChangeStepDown: (stepDown) => {
            this.props.updateConfig({ stepDown: stepDown });
        },
        onChangeSafetyHeight: (safetyHeight) => {
            this.props.updateConfig({ safetyHeight: safetyHeight });
        },
        onChangeStopHeight: (stopHeight) => {
            this.props.updateConfig({ stopHeight: stopHeight });
        },
        onToggleInvert: () => {
            const isInvert = !this.props.isInvert;
            this.props.updateConfig({ isInvert: isInvert });
        }
    };

    render() {
        if (!this.props.model) {
            return null;
        }

        const actions = this.actions;
        const { targetDepth, stepDown, safetyHeight, stopHeight, isInvert } = this.props;

        return (
            <React.Fragment>
                <table className={styles['parameter-table']} style={{ marginBottom: '10px' }}>
                    <tbody>
                        <tr>
                            <td>
                                {i18n._('Target Depth')}
                            </td>
                            <td>
                                <TipTrigger
                                    title={i18n._('Target Depth')}
                                    content={i18n._('Enter the depth of the carved image. The depth cannot be deeper than the flute length.')}
                                >
                                    <div className="input-group input-group-sm" style={{ width: '100%', zIndex: '0' }}>
                                        <Input
                                            style={{ width: '45%' }}
                                            value={targetDepth}
                                            min={0.01}
                                            max={BOUND_SIZE}
                                            step={0.1}
                                            onChange={actions.onChangeTargetDepth}
                                        />
                                        <span className={styles['description-text']} style={{ margin: '8px 0 6px 4px' }}>mm</span>
                                    </div>
                                </TipTrigger>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {i18n._('Step Down')}
                            </td>
                            <td>
                                <TipTrigger
                                    title={i18n._('Step Down')}
                                    content={i18n._('Enter the depth of each carving step.')}
                                >
                                    <div className="input-group input-group-sm" style={{ width: '100%', zIndex: '0' }}>
                                        <Input
                                            style={{ width: '45%' }}
                                            value={stepDown}
                                            min={0.01}
                                            max={targetDepth}
                                            step={0.1}
                                            onChange={actions.onChangeStepDown}
                                        />
                                        <span className={styles['description-text']} style={{ margin: '8px 0 6px 4px' }}>mm</span>
                                    </div>
                                </TipTrigger>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {i18n._('Jog Height')}
                            </td>
                            <td>
                                <TipTrigger
                                    title={i18n._('Jog Height')}
                                    content={i18n._('The distance between the tool and the material when it’s not carving.')}
                                >
                                    <div className="input-group input-group-sm" style={{ width: '100%', zIndex: '0' }}>
                                        <Input
                                            style={{ width: '45%' }}
                                            value={safetyHeight}
                                            min={0.1}
                                            max={BOUND_SIZE}
                                            step={1}
                                            onChange={actions.onChangeSafetyHeight}
                                        />
                                        <span className={styles['description-text']} style={{ margin: '8px 0 6px 4px' }}>mm</span>
                                    </div>
                                </TipTrigger>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {i18n._('Stop Height')}
                            </td>
                            <td>
                                <TipTrigger
                                    title={i18n._('Stop Height')}
                                    content={i18n._('The distance between the tool and the material when the machine stops.')}
                                >
                                    <div className="input-group input-group-sm" style={{ width: '100%', zIndex: '0' }}>
                                        <Input
                                            style={{ width: '45%' }}
                                            value={stopHeight}
                                            min={0.1}
                                            max={BOUND_SIZE}
                                            step={1}
                                            onChange={actions.onChangeStopHeight}
                                        />
                                        <span className={styles['description-text']} style={{ margin: '8px 0 6px 4px' }}>mm</span>
                                    </div>
                                </TipTrigger>
                            </td>
                        </tr>
                        <tr>
                            <td />
                            <td>
                                <input
                                    type="checkbox"
                                    defaultChecked={isInvert}
                                    onChange={actions.onToggleInvert}
                                />
                                <Space width={4} />
                                <span>{i18n._('Invert')}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { model, config } = state.cnc;
    const { targetDepth, stepDown, safetyHeight, stopHeight, isInvert } = config;
    return {
        model,
        targetDepth,
        stepDown,
        safetyHeight,
        stopHeight,
        isInvert
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfig: (params) => dispatch(actions.updateConfig(params))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigRasterGreyscale);
