import Detector from './qrcode/Detector';

const qrcode = {};
qrcode.imagedata = null;
qrcode.width = 0;
qrcode.height = 0;
qrcode.qrCodeSymbol = null;
qrcode.debug = false;
qrcode.maxImgSize = 1024 * 1024;
qrcode.canvasElement = null;

qrcode.sizeOfDataLengthInfo = [
  [10, 9, 8, 8],
  [12, 11, 16, 10],
  [14, 13, 16, 12],
];

qrcode.callback = null;

qrcode.setCanvasElement = function(element) {
  qrcode.canvasElement = element;
};

qrcode.decode = function(src, cb) {
  if (arguments.length == 0) {
    var canvas_qr = qrcode.canvasElement;
    var context = canvas_qr.getContext('2d');
    qrcode.width = canvas_qr.width;
    qrcode.height = canvas_qr.height;
    qrcode.imagedata = context.getImageData(0, 0, qrcode.width, qrcode.height);
    qrcode.result = qrcode.process(context);
    if (qrcode.callback != null) qrcode.callback(qrcode.result);
    return qrcode.result;
  } else {
    var image = new Image();
    image.onload = function() {
      var canvas_qr = document.createElement('canvas');
      var context = canvas_qr.getContext('2d');
      var nheight = image.height;
      var nwidth = image.width;
      if (image.width * image.height > qrcode.maxImgSize) {
        var ir = image.width / image.height;
        nheight = Math.sqrt(qrcode.maxImgSize / ir);
        nwidth = ir * nheight;
      }

      canvas_qr.width = nwidth;
      canvas_qr.height = nheight;

      context.drawImage(image, 0, 0, canvas_qr.width, canvas_qr.height);
      qrcode.width = canvas_qr.width;
      qrcode.height = canvas_qr.height;
      try {
        qrcode.imagedata = context.getImageData(
          0,
          0,
          canvas_qr.width,
          canvas_qr.height
        );
      } catch (e) {
        qrcode.result = 'Cross domain Error';
        if (qrcode.callback != null) qrcode.callback(qrcode.result);
        return;
      }

      try {
        qrcode.result = qrcode.process(context);
        cb(null, qrcode.result);
      } catch (e) {
        // console.log(e);
        qrcode.result = 'Error decoding QR Code from Image';
        cb(new Error('Error decoding QR Code from Image'));
      }
      if (qrcode.callback != null) qrcode.callback(qrcode.result);
    };
    image.src = src;
  }
};

qrcode.isUrl = function(s) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(s);
};

qrcode.decode_url = function(s) {
  var escaped = '';
  try {
    escaped = escape(s);
  } catch (e) {
    // console.log(e);
    escaped = s;
  }
  var ret = '';
  try {
    ret = decodeURIComponent(escaped);
  } catch (e) {
    // console.log(e);
    ret = escaped;
  }
  return ret;
};

qrcode.decode_utf8 = function(s) {
  if (qrcode.isUrl(s)) return qrcode.decode_url(s);
  else return s;
};

qrcode.process = function(ctx) {
  var start = new Date().getTime();

  var image = qrcode.grayScaleToBitmap(qrcode.grayscale());
  //var image = qrcode.binarize(128);

  if (qrcode.debug) {
    for (var y = 0; y < qrcode.height; y++) {
      for (var x = 0; x < qrcode.width; x++) {
        var point = x * 4 + y * qrcode.width * 4;
        qrcode.imagedata.data[point] = image[x + y * qrcode.width] ? 0 : 0;
        qrcode.imagedata.data[point + 1] = image[x + y * qrcode.width] ? 0 : 0;
        qrcode.imagedata.data[point + 2] = image[x + y * qrcode.width]
          ? 255
          : 0;
      }
    }
    ctx.putImageData(qrcode.imagedata, 0, 0);
  }

  //var finderPatternInfo = new FinderPatternFinder().findFinderPattern(image);

  var detector = new Detector(image);

  var qRCodeMatrix = detector.detect();

  /*for (var y = 0; y < qRCodeMatrix.bits.Height; y++)
  {
      for (var x = 0; x < qRCodeMatrix.bits.Width; x++)
      {
          var point = (x * 4*2) + (y*2 * qrcode.width * 4);
          qrcode.imagedata.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
          qrcode.imagedata.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
          qrcode.imagedata.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
      }
  }*/
  if (qrcode.debug) ctx.putImageData(qrcode.imagedata, 0, 0);

  var reader = Decoder.decode(qRCodeMatrix.bits);
  var data = reader.DataByte;
  var str = '';
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++)
      str += String.fromCharCode(data[i][j]);
  }

  var end = new Date().getTime();
  var time = end - start;
  // console.log(time);

  return qrcode.decode_utf8(str);
  //alert("Time:" + time + " Code: "+str);
};

qrcode.getPixel = function(x, y) {
  if (qrcode.width < x) {
    throw 'point error';
  }
  if (qrcode.height < y) {
    throw 'point error';
  }
  point = x * 4 + y * qrcode.width * 4;
  p =
    (qrcode.imagedata.data[point] * 33 +
      qrcode.imagedata.data[point + 1] * 34 +
      qrcode.imagedata.data[point + 2] * 33) /
    100;
  return p;
};

qrcode.binarize = function(th) {
  var ret = new Array(qrcode.width * qrcode.height);
  for (var y = 0; y < qrcode.height; y++) {
    for (var x = 0; x < qrcode.width; x++) {
      var gray = qrcode.getPixel(x, y);

      ret[x + y * qrcode.width] = gray <= th ? true : false;
    }
  }
  return ret;
};

qrcode.getMiddleBrightnessPerArea = function(image) {
  var numSqrtArea = 4;
  //obtain middle brightness((min + max) / 2) per area
  var areaWidth = Math.floor(qrcode.width / numSqrtArea);
  var areaHeight = Math.floor(qrcode.height / numSqrtArea);
  var minmax = new Array(numSqrtArea);
  for (var i = 0; i < numSqrtArea; i++) {
    minmax[i] = new Array(numSqrtArea);
    for (var i2 = 0; i2 < numSqrtArea; i2++) {
      minmax[i][i2] = new Array(0, 0);
    }
  }
  for (var ay = 0; ay < numSqrtArea; ay++) {
    for (var ax = 0; ax < numSqrtArea; ax++) {
      minmax[ax][ay][0] = 0xff;
      for (var dy = 0; dy < areaHeight; dy++) {
        for (var dx = 0; dx < areaWidth; dx++) {
          var target =
            image[areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width];
          if (target < minmax[ax][ay][0]) minmax[ax][ay][0] = target;
          if (target > minmax[ax][ay][1]) minmax[ax][ay][1] = target;
        }
      }
      //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
    }
  }
  var middle = new Array(numSqrtArea);
  for (var i3 = 0; i3 < numSqrtArea; i3++) {
    middle[i3] = new Array(numSqrtArea);
  }
  for (var ay = 0; ay < numSqrtArea; ay++) {
    for (var ax = 0; ax < numSqrtArea; ax++) {
      middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
      //Console.out.print(middle[ax][ay] + ",");
    }
    //Console.out.println("");
  }
  //Console.out.println("");

  return middle;
};

qrcode.grayScaleToBitmap = function(grayScale) {
  var middle = qrcode.getMiddleBrightnessPerArea(grayScale);
  var sqrtNumArea = middle.length;
  var areaWidth = Math.floor(qrcode.width / sqrtNumArea);
  var areaHeight = Math.floor(qrcode.height / sqrtNumArea);
  var bitmap = new Array(qrcode.height * qrcode.width);

  for (var ay = 0; ay < sqrtNumArea; ay++) {
    for (var ax = 0; ax < sqrtNumArea; ax++) {
      for (var dy = 0; dy < areaHeight; dy++) {
        for (var dx = 0; dx < areaWidth; dx++) {
          bitmap[areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width] =
            grayScale[
              areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width
            ] < middle[ax][ay]
              ? true
              : false;
        }
      }
    }
  }
  return bitmap;
};

qrcode.grayscale = function() {
  var ret = new Array(qrcode.width * qrcode.height);
  for (var y = 0; y < qrcode.height; y++) {
    for (var x = 0; x < qrcode.width; x++) {
      var gray = qrcode.getPixel(x, y);

      ret[x + y * qrcode.width] = gray;
    }
  }
  return ret;
};

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

qrcode.orderBestPatterns = function(patterns) {
  function distance(pattern1, pattern2) {
    xDiff = pattern1.X - pattern2.X;
    yDiff = pattern1.Y - pattern2.Y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  /// <summary> Returns the z component of the cross product between vectors BC and BA.</summary>
  function crossProductZ(pointA, pointB, pointC) {
    var bX = pointB.x;
    var bY = pointB.y;
    return (
      (pointC.x - bX) * (pointA.y - bY) - (pointC.y - bY) * (pointA.x - bX)
    );
  }

  // Find distances between pattern centers
  var zeroOneDistance = distance(patterns[0], patterns[1]);
  var oneTwoDistance = distance(patterns[1], patterns[2]);
  var zeroTwoDistance = distance(patterns[0], patterns[2]);

  var pointA, pointB, pointC;
  // Assume one closest to other two is B; A and C will just be guesses at first
  if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
    pointB = patterns[0];
    pointA = patterns[1];
    pointC = patterns[2];
  } else if (
    zeroTwoDistance >= oneTwoDistance &&
    zeroTwoDistance >= zeroOneDistance
  ) {
    pointB = patterns[1];
    pointA = patterns[0];
    pointC = patterns[2];
  } else {
    pointB = patterns[2];
    pointA = patterns[0];
    pointC = patterns[1];
  }

  // Use cross product to figure out whether A and C are correct or flipped.
  // This asks whether BC x BA has a positive z component, which is the arrangement
  // we want for A, B, C. If it's negative, then we've got it flipped around and
  // should swap A and C.
  if (crossProductZ(pointA, pointB, pointC) < 0.0) {
    var temp = pointA;

    pointA = pointC;
    pointC = temp;
  }

  patterns[0] = pointA;
  patterns[1] = pointB;
  patterns[2] = pointC;
};

export default qrcode;
//# sourceMappingURL=qrcode.js.map
