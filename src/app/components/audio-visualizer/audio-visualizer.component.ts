import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlayerService } from '../../providers/player.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audio-visualizer',
  templateUrl: './audio-visualizer.component.html',
  styleUrls: [ './audio-visualizer.component.scss' ]
})
export class AudioVisualizerComponent implements OnInit, OnDestroy, AfterViewInit {
  private ANALYSER_NODES: WeakMap<HTMLAudioElement, AnalyserNode> = new WeakMap();

  @ViewChild('canvasAudioVisualizerID') canvasAudioVisualizerID: ElementRef;
  private canvasContext: CanvasRenderingContext2D;
  private audio: HTMLAudioElement;
  private readonly audioContext: AudioContext;
  private audioContextAnalyserNode: AnalyserNode;
  private sourceMediaElementContextAudio: MediaElementAudioSourceNode;

  private audioSubscription: Subscription;
  private ANALYSER_NODES_Subscription: Subscription;
  private x: number;
  private WIDTH: number;
  private HEIGHT: number;
  private barWidth: number;
  private barHeight: number;
  private innerWidth: number;
  private innerHeight: number;
  private bufferLength: number;
  private dataArray: Uint8Array;

  private _eventHostListenerWindowResize;

  @HostListener('window:resize', [ '$event' ])
  onResize(event) {
    this._eventHostListenerWindowResize = event;
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight - 200;
  }

  constructor(private _playerService: PlayerService) {
    if (this.audioContext === undefined) {
      this.audio = new Audio();
      this.audioContext = new AudioContext();
    }

    this.x = 0;
  }

  ngOnInit() {
    // console.log('ngOnInit Visualizer');
    this.audioSubscription = this._playerService.getAudioObservable()
      .subscribe((audio: HTMLAudioElement) => {
        // console.log('subscribe audio');
        this.audio = audio;
      });
    this.ANALYSER_NODES_Subscription = this._playerService.getAnalyserNodes_WeakMap_Observable()
      .subscribe((ANALYSER_NODES: WeakMap<HTMLAudioElement, AnalyserNode>) => {
        // console.log('subscribe NODES');
        this.ANALYSER_NODES = ANALYSER_NODES;
        if (this.audio.src !== '') {
          if (this.ANALYSER_NODES.has(this.audio)) {
            this.audioContextAnalyserNode = this.ANALYSER_NODES.get(this.audio);
          } else {
            this.sourceMediaElementContextAudio = this.audioContext.createMediaElementSource(this.audio);
            this.sourceMediaElementContextAudio.connect(this.audioContextAnalyserNode);
            this.audioContextAnalyserNode.connect(this.audioContext.destination);

            this.ANALYSER_NODES.set(this.audio, this.audioContextAnalyserNode);
          }
          if (this.audio.paused === false) {
            this.draw();
          }
        }
      });

  }

  ngAfterViewInit(): void {
    // console.log('ngAfterViewInit Visualizer');
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight - 200;
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight - 200;
    this.canvasContext = (<HTMLCanvasElement>this.canvasAudioVisualizerID.nativeElement).getContext('2d');
    this.canvasContext.canvas.style.width = '100%';
    this.canvasContext.canvas.style.height = '100%';
    this.canvasContext.canvas.width = this.canvasContext.canvas.offsetWidth;
    this.canvasContext.canvas.height = this.canvasContext.canvas.offsetHeight;
    this.canvasContext.fillStyle = '#222';
    this.canvasContext.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    this._playerService.updateAudioSubscription();
    this._playerService.updateAnalyserNODESSubscription();
  }


  ngOnDestroy(): void {
    // console.log('ngOnDestroy Visualizer');
    if (this.ANALYSER_NODES.has(this.audio)) {
      // console.log('ANALYSER_NODES.has Visualizer');
      // this.sourceMediaElementContextAudio.disconnect();
      // this.audioContextAnalyserNode.disconnect();
    }
    this.audioSubscription.unsubscribe();
    this.ANALYSER_NODES_Subscription.unsubscribe();
  }

  private draw() {
    // console.log('draw Visualizer');
    this.audioContextAnalyserNode.fftSize = 256;

    this.bufferLength = this.audioContextAnalyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.WIDTH = this.canvasContext.canvas.width;
    this.HEIGHT = this.canvasContext.canvas.height;

    this.barWidth = (this.WIDTH / this.bufferLength) * 2.5;
    this.x = 0;

    this.renderFrame();
  }

  renderFrame() {
    requestAnimationFrame(this.renderFrame.bind(this));
    this.x = 0;

    this.audioContextAnalyserNode.getByteFrequencyData(this.dataArray);

    this.canvasContext.fillStyle = '#222';
    this.canvasContext.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    let bufferLengthTMP = this.bufferLength;

    for (let i = 0; i < bufferLengthTMP; i++) {
      this.barHeight = this.dataArray[ i ];

      let r = this.barHeight + (25 * (i / this.bufferLength));
      let g = 170 * (i / this.bufferLength);
      let b = 190;

      this.canvasContext.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
      this.canvasContext.fillRect(this.x, this.HEIGHT - this.barHeight, this.barWidth, this.barHeight);

      this.x += this.barWidth + 1;
    }
  }
}
