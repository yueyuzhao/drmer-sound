import { Filter } from './Filter';

/**
 * Creates a telephone-sound filter.
 *
 * @class
 * @memberof filters
 */
class TelephoneFilter extends Filter
{
    setup(): void
    {
        const audioContext = this.context.audioContext;
        const lpf1 = audioContext.createBiquadFilter();
        const lpf2 = audioContext.createBiquadFilter();
        const hpf1 = audioContext.createBiquadFilter();
        const hpf2 = audioContext.createBiquadFilter();

        lpf1.type = 'lowpass';
        this.context.setParamValue(lpf1.frequency, 2000.0);

        lpf2.type = 'lowpass';
        this.context.setParamValue(lpf2.frequency, 2000.0);

        hpf1.type = 'highpass';
        this.context.setParamValue(hpf1.frequency, 500.0);

        hpf2.type = 'highpass';
        this.context.setParamValue(hpf2.frequency, 500.0);

        lpf1.connect(lpf2);
        lpf2.connect(hpf1);
        hpf1.connect(hpf2);

        this.init(lpf1, hpf2);
    }
}

export { TelephoneFilter };
