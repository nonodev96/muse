import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../providers/player.service';

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

  private highShelf: BiquadFilterNode;
  private lowShelf: BiquadFilterNode;
  private highPass: BiquadFilterNode;
  private lowPass: BiquadFilterNode;

  constructor(private _playerService: PlayerService) {
    this.audioContext = new AudioContext();
    this.highShelf = this.audioContext.createBiquadFilter();
    this.lowShelf = this.audioContext.createBiquadFilter();
    this.highPass = this.audioContext.createBiquadFilter();
    this.lowPass = this.audioContext.createBiquadFilter();
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

}
