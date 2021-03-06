import qrcode from './qrcode';

const MIN_SKIP = 3;
const MAX_MODULES = 57;
const INTEGER_MATH_SHIFT = 8;
const CENTER_QUORUM = 2;

function FinderPattern(t, e, r) {
  this.x = t;
  this.y = e;
  this.count = 1;
  this.estimatedModuleSize = r;
  Object.defineProperties(this, {
    EstimatedModuleSize: {
      get: function() {
        return this.estimatedModuleSize;
      },
    },
    Count: {
      get: function() {
        return this.count;
      },
    },
    X: {
      get: function() {
        return this.x;
      },
    },
    Y: {
      get: function() {
        return this.y;
      },
    },
  });
  this.incrementCount = function() {
    this.count++;
  };
  this.aboutEquals = function(t, e, r) {
    if (Math.abs(e - this.y) <= t && Math.abs(r - this.x) <= t) {
      var i = Math.abs(t - this.estimatedModuleSize);
      return 1 >= i || i / this.estimatedModuleSize <= 1;
    }
    return !1;
  };
}

function FinderPatternInfo(t) {
  this.bottomLeft = t[0];
  this.topLeft = t[1];
  this.topRight = t[2];

  Object.defineProperties(this, {
    BottomLeft: {
      get: function() {
        return this.bottomLeft;
      },
    },
    TopLeft: {
      get: function() {
        return this.topLeft;
      },
    },
    TopRight: {
      get: function() {
        return this.topRight;
      },
    },
  });
}

export default function FinderPatternFinder() {
  this.image = null;
  this.possibleCenters = [];
  this.hasSkipped = !1;
  this.crossCheckStateCount = new Array(0, 0, 0, 0, 0);
  this.resultPointCallback = null;

  Object.defineProperty(this, 'CrossCheckStateCount', {
    get: function() {
      return (
        (this.crossCheckStateCount[0] = 0),
        (this.crossCheckStateCount[1] = 0),
        (this.crossCheckStateCount[2] = 0),
        (this.crossCheckStateCount[3] = 0),
        (this.crossCheckStateCount[4] = 0),
        this.crossCheckStateCount
      );
    },
  });
  this.foundPatternCross = function(t) {
    for (var e = 0, r = 0; 5 > r; r++) {
      var i = t[r];
      if (0 == i) return !1;
      e += i;
    }
    if (7 > e) return !1;
    var s = Math.floor((e << INTEGER_MATH_SHIFT) / 7),
      n = Math.floor(s / 2);
    return (
      Math.abs(s - (t[0] << INTEGER_MATH_SHIFT)) < n &&
      Math.abs(s - (t[1] << INTEGER_MATH_SHIFT)) < n &&
      Math.abs(3 * s - (t[2] << INTEGER_MATH_SHIFT)) < 3 * n &&
      Math.abs(s - (t[3] << INTEGER_MATH_SHIFT)) < n &&
      Math.abs(s - (t[4] << INTEGER_MATH_SHIFT)) < n
    );
  };
  this.centerFromEnd = function(t, e) {
    return e - t[4] - t[3] - t[2] / 2;
  };
  this.crossCheckVertical = function(t, e, r, i) {
    for (
      var s = this.image,
        n = qrcode.height,
        o = this.CrossCheckStateCount,
        h = t;
      h >= 0 && s[e + h * qrcode.width];

    )
      o[2]++, h--;
    if (0 > h) return 0 / 0;
    for (; h >= 0 && !s[e + h * qrcode.width] && o[1] <= r; ) o[1]++, h--;
    if (0 > h || o[1] > r) return 0 / 0;
    for (; h >= 0 && s[e + h * qrcode.width] && o[0] <= r; ) o[0]++, h--;
    if (o[0] > r) return 0 / 0;
    for (h = t + 1; n > h && s[e + h * qrcode.width]; ) o[2]++, h++;
    if (h == n) return 0 / 0;
    for (; n > h && !s[e + h * qrcode.width] && o[3] < r; ) o[3]++, h++;
    if (h == n || o[3] >= r) return 0 / 0;
    for (; n > h && s[e + h * qrcode.width] && o[4] < r; ) o[4]++, h++;
    if (o[4] >= r) return 0 / 0;
    var a = o[0] + o[1] + o[2] + o[3] + o[4];
    return 5 * Math.abs(a - i) >= 2 * i
      ? 0 / 0
      : this.foundPatternCross(o) ? this.centerFromEnd(o, h) : 0 / 0;
  };
  this.crossCheckHorizontal = function(t, e, r, i) {
    for (
      var s = this.image,
        n = qrcode.width,
        o = this.CrossCheckStateCount,
        h = t;
      h >= 0 && s[h + e * qrcode.width];

    )
      o[2]++, h--;
    if (0 > h) return 0 / 0;
    for (; h >= 0 && !s[h + e * qrcode.width] && o[1] <= r; ) o[1]++, h--;
    if (0 > h || o[1] > r) return 0 / 0;
    for (; h >= 0 && s[h + e * qrcode.width] && o[0] <= r; ) o[0]++, h--;
    if (o[0] > r) return 0 / 0;
    for (h = t + 1; n > h && s[h + e * qrcode.width]; ) o[2]++, h++;
    if (h == n) return 0 / 0;
    for (; n > h && !s[h + e * qrcode.width] && o[3] < r; ) o[3]++, h++;
    if (h == n || o[3] >= r) return 0 / 0;
    for (; n > h && s[h + e * qrcode.width] && o[4] < r; ) o[4]++, h++;
    if (o[4] >= r) return 0 / 0;
    var a = o[0] + o[1] + o[2] + o[3] + o[4];
    return 5 * Math.abs(a - i) >= i
      ? 0 / 0
      : this.foundPatternCross(o) ? this.centerFromEnd(o, h) : 0 / 0;
  };
  this.handlePossibleCenter = function(t, e, r) {
    var i = t[0] + t[1] + t[2] + t[3] + t[4],
      s = this.centerFromEnd(t, r),
      n = this.crossCheckVertical(e, Math.floor(s), t[2], i);
    if (
      !isNaN(n) &&
      ((s = this.crossCheckHorizontal(Math.floor(s), Math.floor(n), t[2], i)),
      !isNaN(s))
    ) {
      for (
        var o = i / 7, h = !1, a = this.possibleCenters.length, u = 0;
        a > u;
        u++
      ) {
        var f = this.possibleCenters[u];
        if (f.aboutEquals(o, n, s)) {
          f.incrementCount(), (h = !0);
          break;
        }
      }
      if (!h) {
        var d = new FinderPattern(s, n, o);
        this.possibleCenters.push(d),
          null != this.resultPointCallback &&
            this.resultPointCallback.foundPossibleResultPoint(d);
      }
      return !0;
    }
    return !1;
  };
  this.selectBestPatterns = function() {
    var t = this.possibleCenters.length;
    if (3 > t) throw "Couldn't find enough finder patterns";
    if (t > 3) {
      for (var e = 0, r = 0, i = 0; t > i; i++) {
        var s = this.possibleCenters[i].EstimatedModuleSize;
        (e += s), (r += s * s);
      }
      var n = e / t;
      this.possibleCenters.sort(function(t, e) {
        var r = Math.abs(e.EstimatedModuleSize - n),
          i = Math.abs(t.EstimatedModuleSize - n);
        return i > r ? -1 : r == i ? 0 : 1;
      });
      for (
        var o = Math.sqrt(r / t - n * n), h = Math.max(0.2 * n, o), i = 0;
        i < this.possibleCenters.length && this.possibleCenters.length > 3;
        i++
      ) {
        var a = this.possibleCenters[i];
        Math.abs(a.EstimatedModuleSize - n) > h &&
          (this.possibleCenters.remove(i), i--);
      }
    }
    return (
      this.possibleCenters.length > 3 &&
        this.possibleCenters.sort(function(t, e) {
          return t.count > e.count ? -1 : t.count < e.count ? 1 : 0;
        }),
      new Array(
        this.possibleCenters[0],
        this.possibleCenters[1],
        this.possibleCenters[2]
      )
    );
  };
  this.findRowSkip = function() {
    var t = this.possibleCenters.length;
    if (1 >= t) return 0;
    for (var e = null, r = 0; t > r; r++) {
      var i = this.possibleCenters[r];
      if (i.Count >= CENTER_QUORUM) {
        if (null != e)
          return (
            (this.hasSkipped = !0),
            Math.floor((Math.abs(e.X - i.X) - Math.abs(e.Y - i.Y)) / 2)
          );
        e = i;
      }
    }
    return 0;
  };
  this.haveMultiplyConfirmedCenters = function() {
    for (var t = 0, e = 0, r = this.possibleCenters.length, i = 0; r > i; i++) {
      var s = this.possibleCenters[i];
      s.Count >= CENTER_QUORUM && (t++, (e += s.EstimatedModuleSize));
    }
    if (3 > t) return !1;
    for (var n = e / r, o = 0, i = 0; r > i; i++)
      (s = this.possibleCenters[i]), (o += Math.abs(s.EstimatedModuleSize - n));
    return 0.05 * e >= o;
  };
  this.findFinderPattern = function(t) {
    const e = !1;
    this.image = t;
    const r = qrcode.height;
    const i = qrcode.width;
    const s = Math.floor(3 * r / (4 * MAX_MODULES));
    (MIN_SKIP > s || e) && (s = MIN_SKIP);

    for (var n = !1, o = new Array(5), h = s - 1; r > h && !n; h += s) {
      (o[0] = 0), (o[1] = 0), (o[2] = 0), (o[3] = 0), (o[4] = 0);
      for (var a = 0, u = 0; i > u; u++)
        if (t[u + h * qrcode.width]) 1 == (1 & a) && a++, o[a]++;
        else if (0 == (1 & a))
          if (4 == a)
            if (this.foundPatternCross(o)) {
              var f = this.handlePossibleCenter(o, h, u);
              if (f)
                if (((s = 2), this.hasSkipped))
                  n = this.haveMultiplyConfirmedCenters();
                else {
                  var d = this.findRowSkip();
                  d > o[2] && ((h += d - o[2] - s), (u = i - 1));
                }
              else {
                do u++;
                while (i > u && !t[u + h * qrcode.width]);
                u--;
              }
              (a = 0),
                (o[0] = 0),
                (o[1] = 0),
                (o[2] = 0),
                (o[3] = 0),
                (o[4] = 0);
            } else
              (o[0] = o[2]),
                (o[1] = o[3]),
                (o[2] = o[4]),
                (o[3] = 1),
                (o[4] = 0),
                (a = 3);
          else o[++a]++;
        else o[a]++;
      if (this.foundPatternCross(o)) {
        var f = this.handlePossibleCenter(o, h, i);
        f &&
          ((s = o[0]), this.hasSkipped && (n = haveMultiplyConfirmedCenters()));
      }
    }
    var c = this.selectBestPatterns();
    return qrcode.orderBestPatterns(c), new FinderPatternInfo(c);
  };
}
