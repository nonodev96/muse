import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlayerService } from '../../providers/player.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audio-visualizer',
  templateUrl: './audio-visualizer.component.html',
  styleUrls: [ './audio-visualizer.component.scss' ]
})
export class AudioVisualizerComponent implements OnInit, OnDestroy, AfterViewInit {
  MEDIA_ELEMENT_NODES = new WeakMap();

  @ViewChild('canvasAudioVisualizerID') canvasAudioVisualizerID: ElementRef;
  private canvasContext: CanvasRenderingContext2D;
  private audio: HTMLAudioElement;
  private audioSubscription: Subscription;
  private audioContext: AudioContext;
  private audioContextAnalyser: AnalyserNode;
  private sourceMediaElementContextAudio: MediaElementAudioSourceNode;

  private HEIGHT: number;
  private WIDTH: number;
  private barWidth: number;
  private barHeight: number;
  private innerWidth: number;
  private dataArray: Uint8Array;
  private bufferLength: number;
  private x: number;
  private innerHeight: number;

  private _eventHostListenerWindowResize;

  @HostListener('window:resize', [ '$event' ])
  onResize(event) {
    this._eventHostListenerWindowResize = event;
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight - 200;
  }

  constructor(private _playerService: PlayerService) {
    if (this.audioContext === undefined) {
      this.audioContext = new AudioContext();
    }
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight - 200;

    this.x = 0;
  }

  ngOnInit() {
    console.log('ngOnInit Visualizer');
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit Visualizer');


    // BUG RARO
    this.audioContextAnalyser = this.audioContext.createAnalyser();

    this.audioSubscription = this._playerService.getAudioObservable().subscribe((audio: HTMLAudioElement) => {
      console.log('subscribe Visualizer');
      this.audio = audio;
      this.canvasContext = (<HTMLCanvasElement>this.canvasAudioVisualizerID.nativeElement).getContext('2d');
      // this.canvasContext.canvas.width = this.innerWidth;
      // this.canvasContext.canvas.height = this.innerHeight;

      this.canvasContext.canvas.style.width = '100%';
      this.canvasContext.canvas.style.height = '100%';
      this.canvasContext.canvas.width = this.canvasContext.canvas.offsetWidth;
      this.canvasContext.canvas.height = this.canvasContext.canvas.offsetHeight;

      this.canvasContext.fillStyle = '#222';
      if (this.MEDIA_ELEMENT_NODES.has(this.audio)) {
        this.sourceMediaElementContextAudio = this.MEDIA_ELEMENT_NODES.get(this.audio);

        this.sourceMediaElementContextAudio.connect(this.audioContextAnalyser);
        this.audioContextAnalyser.connect(this.audioContext.destination);

      } else {
        this.sourceMediaElementContextAudio = this.audioContext.createMediaElementSource(this.audio);
        this.MEDIA_ELEMENT_NODES.set(this.audio, this.sourceMediaElementContextAudio);

        this.sourceMediaElementContextAudio.connect(this.audioContextAnalyser);
        this.audioContextAnalyser.connect(this.audioContext.destination);
      }
      console.log(this.MEDIA_ELEMENT_NODES);

      this.audio = new Audio();

      this.draw();
    });
  }


  ngOnDestroy(): void {
    console.log('ngOnDestroy Visualizer');
    if (this.MEDIA_ELEMENT_NODES.has(this.audio)) {
      this.audioContext = new AudioContext();
      console.log('MEDIA_ELEMENT_NODES.has Visualizer');
      this.sourceMediaElementContextAudio.disconnect();
      this.audioContextAnalyser.disconnect();
    }
  }

  private draw() {
    console.log('draw Visualizer');
    this.audioContextAnalyser.fftSize = 256;

    this.bufferLength = this.audioContextAnalyser.frequencyBinCount;
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

    this.audioContextAnalyser.getByteFrequencyData(this.dataArray);

    this.canvasContext.fillStyle = '#222';
    this.canvasContext.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    let bufferLengthTMP = this.bufferLength;

    for (let i = 0; i < bufferLengthTMP; i++) {
      this.barHeight = this.dataArray[ i ];

      let r = this.barHeight + (25 * (i / this.bufferLength));
      let g = 250 * (i / this.bufferLength);
      let b = 150;

      this.canvasContext.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
      this.canvasContext.fillRect(this.x, this.HEIGHT - this.barHeight, this.barWidth, this.barHeight);

      this.x += this.barWidth + 1;
    }
  }
}
