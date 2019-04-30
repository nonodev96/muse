import {Component, OnDestroy, OnInit} from '@angular/core';
import {PlayerService} from '../../providers/player.service';
import {Subscription} from 'rxjs';

export interface FilterTypeInterface {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.scss']
})
export class EqualizerComponent implements OnInit, OnDestroy {

  private audio_Subscription: Subscription;
  private audioContext_Subscription: Subscription;
  private mediaElementAudioSourceNodes_WeakMap_Subscription: Subscription;

  private audio: HTMLAudioElement;
  private audioContext: AudioContext;
  private mediaElementAudioSourceNode: MediaElementAudioSourceNode;

  public filterNode: BiquadFilterNode;
  public gainNode: GainNode;

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
  public filterTypeSelected: BiquadFilterType = 'lowpass';
  public frequencyValue = 0;
  public qValue = 0;

  constructor(private _playerService: PlayerService) {

  }

  ngOnInit() {
    this.audioContext = new AudioContext();

    this.filterNode = this.audioContext.createBiquadFilter();
    this.gainNode = this.audioContext.createGain();

    this.audio_Subscription = this._playerService.getAudioObservable()
      .subscribe((audio) => {
        this.audio = audio;
      });

    this.mediaElementAudioSourceNodes_WeakMap_Subscription = this._playerService.getMediaElementAudioSourceNodes_WeakMap_Observable()
      .subscribe((mediaElementAudioSource_NODES) => {
        this._playerService.getAudioContext_Observable()
          .subscribe(audioContext => {

            if (mediaElementAudioSource_NODES.has(this.audio)) {
              this.mediaElementAudioSourceNode = mediaElementAudioSource_NODES.get(this.audio);

            } else {
              console.log('Error media element audio source node');
            }

            this.filterNode.type = this.filterTypeSelected;
            this.filterNode.gain.value = this.filterNode.gain.defaultValue;
            this.filterNode.Q.value = this.qValue;
            this.filterNode.frequency.value = this.frequencyValue;
            console.log(this.mediaElementAudioSourceNode);


            this.mediaElementAudioSourceNode.connect(this.filterNode);
            this.filterNode.connect(this.gainNode);
            this.gainNode.connect(audioContext.destination);


            this.console();
          });
      });
  }

  ngOnDestroy(): void {
    /**
     * this.filterNode.disconnect(0);
     * this.gainNode.disconnect(0);
     * this.mediaElementAudioSourceNode.disconnect(0);
     */

    this.audio_Subscription.unsubscribe();
    this.audioContext_Subscription.unsubscribe();
    this.mediaElementAudioSourceNodes_WeakMap_Subscription.unsubscribe();
  }

  public update(): void {
    this.console();
  }

  console() {
    console.log(this.filterTypeSelected);
    console.log(this.mediaElementAudioSourceNode, this.filterNode, this.gainNode);
  }

  default() {
    this.filterTypeSelected = 'lowpass';

    this.filterNode.type = this.filterTypeSelected;
    this.filterNode.gain.value = this.filterNode.gain.defaultValue;
    this.filterNode.Q.value = this.filterNode.Q.defaultValue;
    this.filterNode.frequency.value = this.filterNode.frequency.defaultValue;

    this.gainNode.gain.value = this.gainNode.gain.defaultValue;
  }

}
