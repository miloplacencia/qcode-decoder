export default function QRCodeDataBlockReader(t, i, e) {
  (this.blockPointer = 0),
    (this.bitPointer = 7),
    (this.dataLength = 0),
    (this.blocks = t),
    (this.numErrorCorrectionCode = e),
    9 >= i
      ? (this.dataLengthMode = 0)
      : i >= 10 && 26 >= i
        ? (this.dataLengthMode = 1)
        : i >= 27 && 40 >= i && (this.dataLengthMode = 2),
    (this.getNextBits = function(t) {
      var i = 0;
      if (t < this.bitPointer + 1) {
        for (var e = 0, r = 0; t > r; r++) e += 1 << r;
        return (
          (e <<= this.bitPointer - t + 1),
          (i =
            (this.blocks[this.blockPointer] & e) >> (this.bitPointer - t + 1)),
          (this.bitPointer -= t),
          i
        );
      }
      if (t < this.bitPointer + 1 + 8) {
        for (var n = 0, r = 0; r < this.bitPointer + 1; r++) n += 1 << r;
        return (
          (i =
            (this.blocks[this.blockPointer] & n) <<
            (t - (this.bitPointer + 1))),
          this.blockPointer++,
          (i +=
            this.blocks[this.blockPointer] >>
            (8 - (t - (this.bitPointer + 1)))),
          (this.bitPointer = this.bitPointer - t % 8),
          this.bitPointer < 0 && (this.bitPointer = 8 + this.bitPointer),
          i
        );
      }
      if (t < this.bitPointer + 1 + 16) {
        for (var n = 0, h = 0, r = 0; r < this.bitPointer + 1; r++) n += 1 << r;
        var o =
          (this.blocks[this.blockPointer] & n) << (t - (this.bitPointer + 1));
        this.blockPointer++;
        var s =
          this.blocks[this.blockPointer] << (t - (this.bitPointer + 1 + 8));
        this.blockPointer++;
        for (var r = 0; r < t - (this.bitPointer + 1 + 8); r++) h += 1 << r;
        h <<= 8 - (t - (this.bitPointer + 1 + 8));
        var a =
          (this.blocks[this.blockPointer] & h) >>
          (8 - (t - (this.bitPointer + 1 + 8)));
        return (
          (i = o + s + a),
          (this.bitPointer = this.bitPointer - (t - 8) % 8),
          this.bitPointer < 0 && (this.bitPointer = 8 + this.bitPointer),
          i
        );
      }
      return 0;
    }),
    (this.NextMode = function() {
      return this.blockPointer >
        this.blocks.length - this.numErrorCorrectionCode - 2
        ? 0
        : this.getNextBits(4);
    }),
    (this.getDataLength = function(t) {
      for (var i = 0; ; ) {
        if (t >> i == 1) break;
        i++;
      }
      return this.getNextBits(
        qrcode.sizeOfDataLengthInfo[this.dataLengthMode][i]
      );
    }),
    (this.getRomanAndFigureString = function(t) {
      var i = t,
        e = 0,
        r = '',
        n = new Array(
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
          'G',
          'H',
          'I',
          'J',
          'K',
          'L',
          'M',
          'N',
          'O',
          'P',
          'Q',
          'R',
          'S',
          'T',
          'U',
          'V',
          'W',
          'X',
          'Y',
          'Z',
          ' ',
          '$',
          '%',
          '*',
          '+',
          '-',
          '.',
          '/',
          ':'
        );
      do
        if (i > 1) {
          e = this.getNextBits(11);
          var h = Math.floor(e / 45),
            o = e % 45;
          (r += n[h]), (r += n[o]), (i -= 2);
        } else 1 == i && ((e = this.getNextBits(6)), (r += n[e]), (i -= 1));
      while (i > 0);
      return r;
    }),
    (this.getFigureString = function(t) {
      var i = t,
        e = 0,
        r = '';
      do
        i >= 3
          ? ((e = this.getNextBits(10)),
            100 > e && (r += '0'),
            10 > e && (r += '0'),
            (i -= 3))
          : 2 == i
            ? ((e = this.getNextBits(7)), 10 > e && (r += '0'), (i -= 2))
            : 1 == i && ((e = this.getNextBits(4)), (i -= 1)),
          (r += e);
      while (i > 0);
      return r;
    }),
    (this.get8bitByteArray = function(t) {
      var i = t,
        e = 0,
        r = new Array();
      do (e = this.getNextBits(8)), r.push(e), i--;
      while (i > 0);
      return r;
    }),
    (this.getKanjiString = function(t) {
      var i = t,
        e = 0,
        r = '';
      do {
        e = getNextBits(13);
        var n = e % 192,
          h = e / 192,
          o = (h << 8) + n,
          s = 0;
        (s = 40956 >= o + 33088 ? o + 33088 : o + 49472),
          (r += String.fromCharCode(s)),
          i--;
      } while (i > 0);
      return r;
    }),
    Object.defineProperty(this, 'DataByte', {
      get: function() {
        for (var t = new Array(), i = 1, e = 2, r = 4, n = 8; ; ) {
          var h = this.NextMode();
          if (0 == h) {
            if (t.length > 0) break;
            throw 'Empty data block';
          }
          if (h != i && h != e && h != r && h != n)
            throw ((h = guessMode(h)),
            'Invalid mode: ' +
              h +
              ' in (block:' +
              this.blockPointer +
              ' bit:' +
              this.bitPointer +
              ')');
          if (((dataLength = this.getDataLength(h)), 1 > dataLength))
            throw 'Invalid data length: ' + dataLength;
          switch (h) {
            case i:
              for (
                var o = this.getFigureString(dataLength),
                  s = new Array(o.length),
                  a = 0;
                a < o.length;
                a++
              )
                s[a] = o.charCodeAt(a);
              t.push(s);
              break;
            case e:
              for (
                var o = this.getRomanAndFigureString(dataLength),
                  s = new Array(o.length),
                  a = 0;
                a < o.length;
                a++
              )
                s[a] = o.charCodeAt(a);
              t.push(s);
              break;
            case r:
              var b = this.get8bitByteArray(dataLength);
              t.push(b);
              break;
            case n:
              var o = this.getKanjiString(dataLength);
              t.push(o);
          }
        }
        return t;
      },
    });
}
