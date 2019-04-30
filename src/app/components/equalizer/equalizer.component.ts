import {Component, OnDestroy, OnInit} from '@angular/core';
import {PlayerService} from '../../providers/player.service';
import {Subscription} from 'rxjs';

export interface FilterTypeInterface {
  value: string;
  viewValue: string;
}

export interface SendDataEqualizerInterface {
  filterTypeSelected: BiquadFilterType;
  fValue: number;
  gValue: number;
  qValue: number;
}

@Component({
  selector: 'app-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.scss']
})
export class EqualizerComponent implements OnInit, OnDestroy {
  private biquadFilterNode: BiquadFilterNode;
  private gainNode: GainNode;

  public filterType: FilterTypeInterface[] = [
    {value: 'lowpass', viewValue: 'Lowpass'},
    {value: 'highpass', viewValue: 'Highpass'},
    {value: 'bandpass', viewValue: 'Bandpass'},
    {value: 'notch', viewValue: 'Notch'},
    {value: 'lowshelf', viewValue: 'Lowshelf'},
    {value: 'highshelf', viewValue: 'Highshelf'},
    {value: 'peaking', viewValue: 'Peaking'},
    {value: 'allpass', viewValue: 'Allpass'},
  ];
  public filterTypeSelected: BiquadFilterType = 'allpass';
  public fValue = 0;
  public qValue = 0;
  public gValue = 0;

  constructor(private _playerService: PlayerService) {

  }

  ngOnInit() {
    let audioContext = new AudioContext();
    this.biquadFilterNode = audioContext.createBiquadFilter();
    this.gainNode = audioContext.createBiquadFilter();
    this.fValue = this.biquadFilterNode.frequency.defaultValue;
    this.qValue = this.biquadFilterNode.Q.defaultValue;
    this.gValue = this.biquadFilterNode.gain.defaultValue;
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

  public update(): void {
    this.console();
  }

  console() {
    console.log(this.filterTypeSelected, this.fValue, this.qValue, this.gValue);
    console.log(this.gainNode, this.biquadFilterNode);
  }

  default() {
    this._playerService.defaultEqualizer();
    this.filterTypeSelected = 'allpass';
    this.biquadFilterNode.type = this.filterTypeSelected;
    this.biquadFilterNode.frequency.value = this.biquadFilterNode.frequency.defaultValue;
    this.biquadFilterNode.Q.value = this.biquadFilterNode.Q.defaultValue;
    this.biquadFilterNode.gain.value = this.biquadFilterNode.gain.defaultValue;

    this.gainNode.gain.value = this.gainNode.gain.defaultValue;

    this.fValue = this.biquadFilterNode.frequency.defaultValue;
    this.qValue = this.biquadFilterNode.Q.defaultValue;
    this.gValue = this.biquadFilterNode.gain.defaultValue;
  }

  send() {
    let data: SendDataEqualizerInterface = {
      filterTypeSelected: this.filterTypeSelected,
      fValue: this.fValue,
      qValue: this.qValue,
      gValue: this.gValue,
    };
    this._playerService.setEqualizer(data);
  }
}
