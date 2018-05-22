import qrcode from './qrcode';

console.log(qrcode, 'QRCODE loaded');
/**
 * Constructor for QCodeDecoder
 */

export default class QCodeDecoder {
  constructor() {
    if (!(this instanceof QCodeDecoder)) return new QCodeDecoder();

    this.timerCapture = null;
    this.canvasElem = null;
    this.stream = null;
    this.videoConstraints = { video: true, audio: false };
    this.qrcode = qrcode;
  }

  isCanvasSupported() {
    const elem = document.createElement('canvas');

    return !!(elem.getContext && elem.getContext('2d'));
  }

  isCanvasSupported() {
    const elem = document.createElement('canvas');

    return !!(elem.getContext && elem.getContext('2d'));
  }

  hasGetUserMedia() {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    return !!navigator.getUserMedia;
  }

  _prepareCanvas(videoElem) {
    if (!this.canvasElem) {
      this.canvasElem = document.createElement('canvas');
      this.canvasElem.style.width = `${videoElem.videoWidth}px`;
      this.canvasElem.style.height = `${videoElem.videoHeight}px`;
      this.canvasElem.width = videoElem.videoWidth;
      this.canvasElem.height = videoElem.videoHeight;
    }

    this.qrcode.setCanvasElement(this.canvasElem);

    return this;
  }

  _captureToCanvas(videoElem, cb, once) {
    if (this.timerCapture) clearTimeout(this.timerCapture);

    if (videoElem.videoWidth && videoElem.videoHeight) {
      if (!this.canvasElem) this._prepareCanvas(videoElem);

      const gCtx = this.canvasElem.getContext('2d');
      gCtx.clearRect(0, 0, videoElem.videoWidth, videoElem.videoHeight);
      gCtx.drawImage(
        videoElem,
        0,
        0,
        videoElem.videoWidth,
        videoElem.videoHeight
      );

      try {
        cb(null, this.qrcode.decode());
        if (once) return;
      } catch (err) {
        if (err !== "Couldn't find enough finder patterns") {
          console.error(err);
          cb(new Error(err));
        }
      }
    }

    this.timerCapture = window.requestAnimationFrame(() => {
      this._captureToCanvas(videoElem, cb, once);
    });
  }

  decodeFromCamera(videoElem, cb, once) {
    if (!this.hasGetUserMedia())
      cb(new Error("Couldn't get video from camera"));

    navigator.mediaDevices
      .getUserMedia(this.videoConstraints)
      .then(stream => {
        videoElem.src = window.URL.createObjectURL(stream);
        this.videoElem = videoElem;
        this.stream = stream;
        this.videoDimensions = false;

        window.requestAnimationFrame(() => {
          this._captureToCanvas(videoElem, cb, once);
        });
      })
      .catch(cb);

    return this;
  }

  decodeFromVideo(videoElem, cb, once) {
    window.requestAnimationFrame(() => {
      this._captureToCanvas(videoElem, cb, once);
    });

    return this;
  }

  decodeFromImage(img, cb) {
    if (+img.nodeType > 0 && !img.src)
      throw new Error('The ImageElement must contain a src');

    img = img.src ? img.src : img;
    this.qrcode.decode(img, cb);

    return this;
  }

  stop() {
    if (this.stream) {
      const tracks = this.stream.getTracks();

      if (tracks.length) {
        tracks.map(track => this.stream.removeTrack(track));
        this.stream = undefined;
      }
    }

    if (this.timerCapture) {
      window.cancelAnimationFrame(this.timerCapture);
      this.timerCapture = undefined;

      console.log('canceled animation frame');
    }

    return this;
  }

  setSourceId(sourceId) {
    if (sourceId) this.videoConstraints.video = { optional: [{ sourceId }] };
    else this.videoConstraints.video = true;

    return this;
  }

  getVideoSources(cb) {
    const sources = [];

    if (!(MediaStreamTrack && MediaStreamTrack.getSources)) {
      return cb(
        new Error(
          'Current browser doest not support MediaStreamTrack.getSources'
        )
      );
    }

    MediaStreamTrack.getSources(sourceInfos => {
      sourceInfos.forEach(sourceInfo => {
        if (sourceInfo.kind === 'video') sources.push(sourceInfo);
      });
      cb(null, sources);
    });

    return this;
  }
}
