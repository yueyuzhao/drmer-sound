import { Filter } from './Filter';
import { WebAudioContext } from '../webaudio/WebAudioContext';

/**
 * Creates a telephone-sound filter.
 *
 * @class
 * @memberof filters
 */
class TelephoneFilter extends Filter
{
    /**
     * @param {WebAudioContext} context - The audio context
     */
    constructor(context: WebAudioContext)
    {
        const audioContext = context.audioContext;
        const lpf1 = audioContext.createBiquadFilter();
        const lpf2 = audioContext.createBiquadFilter();
        const hpf1 = audioContext.createBiquadFilter();
        const hpf2 = audioContext.createBiquadFilter();

        lpf1.type = 'lowpass';
        context.setParamValue(lpf1.frequency, 2000.0);

        lpf2.type = 'lowpass';
        context.setParamValue(lpf2.frequency, 2000.0);

        hpf1.type = 'highpass';
        context.setParamValue(hpf1.frequency, 500.0);

        hpf2.type = 'highpass';
        context.setParamValue(hpf2.frequency, 500.0);

        lpf1.connect(lpf2);
        lpf2.connect(hpf1);
        hpf1.connect(hpf2);

        super(context, lpf1, hpf2);
    }
}

export { TelephoneFilter };
