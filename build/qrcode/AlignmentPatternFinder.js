function AlignmentPattern(t, e, i) {
  this.x = t;
  this.y = e;
  this.count = 1;
  this.estimatedModuleSize = i;

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
        return Math.floor(this.x);
      },
    },
    Y: {
      get: function() {
        return Math.floor(this.y);
      },
    },
  });
  this.incrementCount = function() {
    this.count++;
  };
  this.aboutEquals = function(t, e, i) {
    if (Math.abs(e - this.y) <= t && Math.abs(i - this.x) <= t) {
      var r = Math.abs(t - this.estimatedModuleSize);
      return 1 >= r || r / this.estimatedModuleSize <= 1;
    }
    return !1;
  };
}

export function AlignmentPatternFinder(t, e, i, r, s, n, o) {
  this.image = t;
  this.possibleCenters = new Array();
  this.startX = e;
  this.startY = i;
  this.width = r;
  this.height = s;
  this.moduleSize = n;
  this.crossCheckStateCount = new Array(0, 0, 0);
  this.resultPointCallback = o;

  this.centerFromEnd = function(t, e) {
    return e - t[2] - t[1] / 2;
  };
  this.foundPatternCross = function(t) {
    for (var e = this.moduleSize, i = e / 2, r = 0; 3 > r; r++)
      if (Math.abs(e - t[r]) >= i) return !1;
    return !0;
  };
  this.crossCheckVertical = function(t, e, i, r) {
    var s = this.image,
      n = qrcode.height,
      o = this.crossCheckStateCount;
    (o[0] = 0), (o[1] = 0), (o[2] = 0);
    for (var h = t; h >= 0 && s[e + h * qrcode.width] && o[1] <= i; )
      o[1]++, h--;
    if (0 > h || o[1] > i) return 0 / 0;
    for (; h >= 0 && !s[e + h * qrcode.width] && o[0] <= i; ) o[0]++, h--;
    if (o[0] > i) return 0 / 0;
    for (h = t + 1; n > h && s[e + h * qrcode.width] && o[1] <= i; )
      o[1]++, h++;
    if (h == n || o[1] > i) return 0 / 0;
    for (; n > h && !s[e + h * qrcode.width] && o[2] <= i; ) o[2]++, h++;
    if (o[2] > i) return 0 / 0;
    var a = o[0] + o[1] + o[2];
    return 5 * Math.abs(a - r) >= 2 * r
      ? 0 / 0
      : this.foundPatternCross(o) ? this.centerFromEnd(o, h) : 0 / 0;
  };
  this.handlePossibleCenter = function(t, e, i) {
    var r = t[0] + t[1] + t[2],
      s = this.centerFromEnd(t, i),
      n = this.crossCheckVertical(e, Math.floor(s), 2 * t[1], r);
    if (!isNaN(n)) {
      for (
        var o = (t[0] + t[1] + t[2]) / 3,
          h = this.possibleCenters.length,
          a = 0;
        h > a;
        a++
      ) {
        var u = this.possibleCenters[a];
        if (u.aboutEquals(o, n, s)) return new AlignmentPattern(s, n, o);
      }
      var l = new AlignmentPattern(s, n, o);
      this.possibleCenters.push(l),
        null != this.resultPointCallback &&
          this.resultPointCallback.foundPossibleResultPoint(l);
    }
    return null;
  };
  this.find = function() {
    for (
      var e = this.startX,
        s = this.height,
        n = e + r,
        o = i + (s >> 1),
        h = new Array(0, 0, 0),
        a = 0;
      s > a;
      a++
    ) {
      var u = o + (0 == (1 & a) ? (a + 1) >> 1 : -((a + 1) >> 1));
      (h[0] = 0), (h[1] = 0), (h[2] = 0);
      for (var l = e; n > l && !t[l + qrcode.width * u]; ) l++;
      for (var f = 0; n > l; ) {
        if (t[l + u * qrcode.width])
          if (1 == f) h[f]++;
          else if (2 == f) {
            if (this.foundPatternCross(h)) {
              var d = this.handlePossibleCenter(h, u, l);
              if (null != d) return d;
            }
            (h[0] = h[2]), (h[1] = 1), (h[2] = 0), (f = 1);
          } else h[++f]++;
        else 1 == f && f++, h[f]++;
        l++;
      }
      if (this.foundPatternCross(h)) {
        var d = this.handlePossibleCenter(h, u, n);
        if (null != d) return d;
      }
    }
    if (0 != this.possibleCenters.length) return this.possibleCenters[0];
    throw "Couldn't find enough alignment patterns";
  };
}
