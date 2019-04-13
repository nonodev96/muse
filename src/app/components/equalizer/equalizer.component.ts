import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../providers/player.service';

interface SectionSliderInterface {
  min: number;
  max: number;
  step: number;
  value: any;
  data_filter: string;
  data_param: string;
  scope_min: string;
  scope_max: string;
  param: string;
}

interface SectionInterface {
  title: string;
  slider: SectionSliderInterface[];
}

interface SectionsInterface {
  data: SectionInterface[];
}

@Component({
  selector: 'app-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.scss']
})
export class EqualizerComponent implements OnInit {
  private audio: HTMLAudioElement;
  private audioContext: AudioContext;
  private mediaElementAudioSourceNode: MediaElementAudioSourceNode;
  private audioContextAnalyserNode: AnalyserNode;

  public sections: SectionsInterface = {data: []};

  public highShelf: BiquadFilterNode;
  public lowShelf: BiquadFilterNode;
  public highPass: BiquadFilterNode;
  public lowPass: BiquadFilterNode;

  constructor(private _playerService: PlayerService) {
    this.audioContext = new AudioContext();
    this.highShelf = this.audioContext.createBiquadFilter();
    this.lowShelf = this.audioContext.createBiquadFilter();
    this.highPass = this.audioContext.createBiquadFilter();
    this.lowPass = this.audioContext.createBiquadFilter();
    this.sections.data = [
      {
        title: 'High Frequency',
        slider: [{
          min: 4700,
          max: 22000,
          step: 100,
          value: this.highShelf.frequency.value,
          data_filter: 'highShelf',
          data_param: 'frequency',
          scope_min: '22',
          scope_max: '4.7',
          param: 'kHz'
        }, {
          min: -50,
          max: 50,
          step: 1,
          value: this.highPass.gain.value,
          data_filter: 'highShelf',
          data_param: 'gain',
          scope_min: '-50',
          scope_max: '50',
          param: 'dB'
        }]
      }, {
        title: 'Low Frequency',
        slider: [{
          min: 35,
          max: 220,
          step: 1,
          value: this.lowShelf.frequency.value,
          data_filter: 'lowShelf',
          data_param: 'frequency',
          scope_min: '35',
          scope_max: '220',
          param: 'Hz'
        }, {
          min: -50,
          max: 50,
          step: 1,
          value: this.lowShelf.gain.value,
          data_filter: 'highShelf',
          data_param: 'gain',
          scope_min: '-50',
          scope_max: '50',
          param: 'dB'
        }]
      }, {
        title: 'High Mid Frequencies',
        slider: [{
          min: 800,
          max: 5900,
          step: 1,
          value: this.highPass.frequency.value,
          data_filter: 'lowShelf',
          data_param: 'frequency',
          scope_min: '0.8',
          scope_max: '.9',
          param: 'KHz'
        }, {
          min: 0.7,
          max: 12,
          step: 0.1,
          value: this.highPass.Q.value,
          data_filter: 'highShelf',
          data_param: 'Q',
          scope_min: '0.7',
          scope_max: '12',
          param: 'Q'
        }]
      }, {
        title: 'Low Mid Frequencies',
        slider: [{
          min: 80,
          max: 1600,
          step: 10,
          value: this.lowPass.frequency.value,
          data_filter: 'lowShelf',
          data_param: 'frequency',
          scope_min: '80',
          scope_max: '1600',
          param: 'KHz'
        }, {
          min: 0.7,
          max: 12,
          step: 0.1,
          value: this.lowPass.Q.value,
          data_filter: 'lowPass',
          data_param: 'Q',
          scope_min: '0.7',
          scope_max: '12',
          param: 'Q'
        }]
      },
    ];
  }

  ngOnInit() {
    this._playerService.getAudioObservable()
      .subscribe((audio) => {
        this.audio = audio;
      });
    this._playerService.getContextNODESObservable()
      .subscribe((contextNODES) => {

        if (contextNODES.has(this.audio)) {
          this.mediaElementAudioSourceNode = contextNODES.get(this.audio);
        } else {
          console.log('Error media element audio source node');
        }

        this.mediaElementAudioSourceNode.connect(this.highShelf);
        this.highShelf.connect(this.lowShelf);
        this.lowShelf.connect(this.highPass);
        this.highPass.connect(this.lowPass);
        this.lowPass.connect(this.audioContext.destination);

        this.highShelf.type = 'highshelf';
        this.highShelf.frequency.value = 4700;
        this.highShelf.gain.value = 50;

        this.lowShelf.type = 'lowshelf';
        this.lowShelf.frequency.value = 35;
        this.lowShelf.gain.value = 50;

        this.highPass.type = 'highpass';
        this.highPass.frequency.value = 800;
        this.highPass.Q.value = 0.7;

        this.lowPass.type = 'lowpass';
        this.lowPass.frequency.value = 880;
        this.lowPass.Q.value = 0.7;
      });
  }

  console() {
    console.log(this.highShelf);
    console.log(this.lowShelf);
    console.log(this.highPass);
    console.log(this.lowPass);
  }

}
