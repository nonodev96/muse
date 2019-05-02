import {Component, OnDestroy, OnInit} from '@angular/core';
import {PlayerService} from '../../providers/player.service';

export interface FilterTypeInterface {
  viewValue: string;
  value: string;
  frequency: {
    value: number;
    minValue: number;
    maxValue: number;
    step: number;
  };
  gain?: {
    value: number;
    minValue: number;
    maxValue: number;
    step: number;
  };
  Q?: {
    value: number;
    minValue: number;
    maxValue: number;
    step: number;
  };
}

export interface SendDataEqualizerInterface {
  filterTypeSelected: BiquadFilterType;
  fValue: number;
  gValue?: number;
  qValue?: number;
}

@Component({
  selector: 'app-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.scss']
})
export class EqualizerComponent implements OnInit, OnDestroy {

  public filterType: FilterTypeInterface[] = [
    {
      value: 'highshelf',
      viewValue: 'Highshelf',
      frequency: {
        value: 4700,
        minValue: 4700,
        maxValue: 22000,
        step: 100
      },
      gain: {
        value: 50,
        minValue: -50,
        maxValue: 50,
        step: 1
      }
    },
    {
      viewValue: 'Lowshelf',
      value: 'lowshelf',
      frequency: {
        value: 35,
        minValue: 35,
        maxValue: 220,
        step: 1
      },
      gain: {
        value: 50,
        minValue: -50,
        maxValue: 50,
        step: 1
      }
    },
    {
      viewValue: 'Highpass',
      value: 'highpass',
      frequency: {
        value: 35,
        minValue: 800,
        maxValue: 5900,
        step: 100
      },
      Q: {
        value: 0.7,
        minValue: 0.7,
        maxValue: 12,
        step: 0.1
      }
    },
    {
      viewValue: 'Lowpass',
      value: 'lowpass',
      frequency: {
        value: 880,
        minValue: 80,
        maxValue: 1600,
        step: 10
      },
      Q: {
        value: 0.7,
        minValue: 0.7,
        maxValue: 12,
        step: 0.1
      }
    },
    // {value: 'bandpass', viewValue: 'Bandpass'},
    // {value: 'notch', viewValue: 'Notch'},
    // {value: 'peaking', viewValue: 'Peaking'},
    // {value: 'allpass', viewValue: 'Allpass'},
  ];

  constructor(private _playerService: PlayerService) {

  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    /**
     * this.filterNode.disconnect(0);
     * this.gainNode.disconnect(0);
     * this.mediaElementAudioSourceNode.disconnect(0);
     *
     * this.audio_Subscription.unsubscribe();
     * this.audioContext_Subscription.unsubscribe();
     * this.mediaElementAudioSourceNodes_WeakMap_Subscription.unsubscribe();
     */
  }

  public disconnect() {
    this._playerService.disconnect();
  }

  public connect() {
    this._playerService.connect();
  }

  public debug() {
    console.log(this.filterType);
  }

  public default() {
    this.filterType[0].frequency.value = 4700;
    this.filterType[0].gain.value = 50;
    this.filterType[1].frequency.value = 35;
    this.filterType[1].gain.value = 50;
    this.filterType[2].frequency.value = 800;
    this.filterType[2].Q.value = 0.7;
    this.filterType[3].frequency.value = 880;
    this.filterType[3].Q.value = 0.7;

    this.send();
  }

  public send() {
    let data: SendDataEqualizerInterface;

    data = {
      filterTypeSelected: 'highshelf',
      fValue: this.filterType[0].frequency.value,
      gValue: this.filterType[0].gain.value
    };
    this._playerService.setEqualizer(data);

    data = {
      filterTypeSelected: 'lowshelf',
      fValue: this.filterType[1].frequency.value,
      gValue: this.filterType[1].gain.value
    };
    this._playerService.setEqualizer(data);

    data = {
      filterTypeSelected: 'highpass',
      fValue: this.filterType[2].frequency.value,
      qValue: this.filterType[2].Q.value
    };
    this._playerService.setEqualizer(data);

    data = {
      filterTypeSelected: 'lowpass',
      fValue: this.filterType[3].frequency.value,
      qValue: this.filterType[3].Q.value
    };

    this._playerService.setEqualizer(data);
  }
}
