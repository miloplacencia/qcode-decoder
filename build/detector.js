function PerspectiveTransform(t, a, i, s, r, e, h, n, o) {
  this.a11 = t;
  this.a12 = s;
  this.a13 = h;
  this.a21 = a;
  this.a22 = r;
  this.a23 = n;
  this.a31 = i;
  this.a32 = e;
  this.a33 = o;
  this.transformPoints1 = function(t) {
    for (
      var a = t.length,
        i = this.a11,
        s = this.a12,
        r = this.a13,
        e = this.a21,
        h = this.a22,
        n = this.a23,
        o = this.a31,
        l = this.a32,
        f = this.a33,
        u = 0;
      a > u;
      u += 2
    ) {
      var c = t[u],
        d = t[u + 1],
        m = r * c + n * d + f;
      (t[u] = (i * c + e * d + o) / m), (t[u + 1] = (s * c + h * d + l) / m);
    }
  };
  this.transformPoints2 = function(t, a) {
    for (var i = t.length, s = 0; i > s; s++) {
      var r = t[s],
        e = a[s],
        h = this.a13 * r + this.a23 * e + this.a33;
      (t[s] = (this.a11 * r + this.a21 * e + this.a31) / h),
        (a[s] = (this.a12 * r + this.a22 * e + this.a32) / h);
    }
  };
  this.buildAdjoint = function() {
    return new PerspectiveTransform(
      this.a22 * this.a33 - this.a23 * this.a32,
      this.a23 * this.a31 - this.a21 * this.a33,
      this.a21 * this.a32 - this.a22 * this.a31,
      this.a13 * this.a32 - this.a12 * this.a33,
      this.a11 * this.a33 - this.a13 * this.a31,
      this.a12 * this.a31 - this.a11 * this.a32,
      this.a12 * this.a23 - this.a13 * this.a22,
      this.a13 * this.a21 - this.a11 * this.a23,
      this.a11 * this.a22 - this.a12 * this.a21
    );
  };
  this.times = function(t) {
    return new PerspectiveTransform(
      this.a11 * t.a11 + this.a21 * t.a12 + this.a31 * t.a13,
      this.a11 * t.a21 + this.a21 * t.a22 + this.a31 * t.a23,
      this.a11 * t.a31 + this.a21 * t.a32 + this.a31 * t.a33,
      this.a12 * t.a11 + this.a22 * t.a12 + this.a32 * t.a13,
      this.a12 * t.a21 + this.a22 * t.a22 + this.a32 * t.a23,
      this.a12 * t.a31 + this.a22 * t.a32 + this.a32 * t.a33,
      this.a13 * t.a11 + this.a23 * t.a12 + this.a33 * t.a13,
      this.a13 * t.a21 + this.a23 * t.a22 + this.a33 * t.a23,
      this.a13 * t.a31 + this.a23 * t.a32 + this.a33 * t.a33
    );
  };
}
function DetectorResult(t, a) {
  (this.bits = t), (this.points = a);
}
function Detector(t) {
  (this.image = t),
    (this.resultPointCallback = null),
    (this.sizeOfBlackWhiteBlackRun = function(t, a, i, s) {
      var r = Math.abs(s - a) > Math.abs(i - t);
      if (r) {
        var e = t;
        (t = a), (a = e), (e = i), (i = s), (s = e);
      }
      for (
        var h = Math.abs(i - t),
          n = Math.abs(s - a),
          o = -h >> 1,
          l = s > a ? 1 : -1,
          f = i > t ? 1 : -1,
          u = 0,
          c = t,
          d = a;
        c != i;
        c += f
      ) {
        var m = r ? d : c,
          v = r ? c : d;
        if (
          (1 == u
            ? this.image[m + v * qrcode.width] && u++
            : this.image[m + v * qrcode.width] || u++,
          3 == u)
        ) {
          var M = c - t,
            q = d - a;
          return Math.sqrt(M * M + q * q);
        }
        if (((o += n), o > 0)) {
          if (d == s) break;
          (d += l), (o -= h);
        }
      }
      var y = i - t,
        g = s - a;
      return Math.sqrt(y * y + g * g);
    }),
    (this.sizeOfBlackWhiteBlackRunBothWays = function(t, a, i, s) {
      var r = this.sizeOfBlackWhiteBlackRun(t, a, i, s),
        e = 1,
        h = t - (i - t);
      0 > h
        ? ((e = t / (t - h)), (h = 0))
        : h >= qrcode.width &&
          ((e = (qrcode.width - 1 - t) / (h - t)), (h = qrcode.width - 1));
      var n = Math.floor(a - (s - a) * e);
      return (
        (e = 1),
        0 > n
          ? ((e = a / (a - n)), (n = 0))
          : n >= qrcode.height &&
            ((e = (qrcode.height - 1 - a) / (n - a)), (n = qrcode.height - 1)),
        (h = Math.floor(t + (h - t) * e)),
        (r += this.sizeOfBlackWhiteBlackRun(t, a, h, n)),
        r - 1
      );
    }),
    (this.calculateModuleSizeOneWay = function(t, a) {
      var i = this.sizeOfBlackWhiteBlackRunBothWays(
          Math.floor(t.X),
          Math.floor(t.Y),
          Math.floor(a.X),
          Math.floor(a.Y)
        ),
        s = this.sizeOfBlackWhiteBlackRunBothWays(
          Math.floor(a.X),
          Math.floor(a.Y),
          Math.floor(t.X),
          Math.floor(t.Y)
        );
      return isNaN(i) ? s / 7 : isNaN(s) ? i / 7 : (i + s) / 14;
    }),
    (this.calculateModuleSize = function(t, a, i) {
      return (
        (this.calculateModuleSizeOneWay(t, a) +
          this.calculateModuleSizeOneWay(t, i)) /
        2
      );
    }),
    (this.distance = function(t, a) {
      return (
        (xDiff = t.X - a.X),
        (yDiff = t.Y - a.Y),
        Math.sqrt(xDiff * xDiff + yDiff * yDiff)
      );
    }),
    (this.computeDimension = function(t, a, i, s) {
      var r = Math.round(this.distance(t, a) / s),
        e = Math.round(this.distance(t, i) / s),
        h = ((r + e) >> 1) + 7;
      switch (3 & h) {
        case 0:
          h++;
          break;
        case 2:
          h--;
          break;
        case 3:
          throw 'Error';
      }
      return h;
    }),
    (this.findAlignmentInRegion = function(t, a, i, s) {
      var r = Math.floor(s * t),
        e = Math.max(0, a - r),
        h = Math.min(qrcode.width - 1, a + r);
      if (3 * t > h - e) throw 'Error';
      var n = Math.max(0, i - r),
        o = Math.min(qrcode.height - 1, i + r),
        l = new AlignmentPatternFinder(
          this.image,
          e,
          n,
          h - e,
          o - n,
          t,
          this.resultPointCallback
        );
      return l.find();
    }),
    (this.createTransform = function(t, a, i, s, r) {
      var e,
        h,
        n,
        o,
        l = r - 3.5;
      null != s
        ? ((e = s.X), (h = s.Y), (n = o = l - 3))
        : ((e = a.X - t.X + i.X), (h = a.Y - t.Y + i.Y), (n = o = l));
      var f = PerspectiveTransform.quadrilateralToQuadrilateral(
        3.5,
        3.5,
        l,
        3.5,
        n,
        o,
        3.5,
        l,
        t.X,
        t.Y,
        a.X,
        a.Y,
        e,
        h,
        i.X,
        i.Y
      );
      return f;
    }),
    (this.sampleGrid = function(t, a, i) {
      var s = GridSampler;
      return s.sampleGrid3(t, i, a);
    }),
    (this.processFinderPatternInfo = function(t) {
      var a = t.TopLeft,
        i = t.TopRight,
        s = t.BottomLeft,
        r = this.calculateModuleSize(a, i, s);
      if (1 > r) throw 'Error';
      var e = this.computeDimension(a, i, s, r),
        h = Version.getProvisionalVersionForDimension(e),
        n = h.DimensionForVersion - 7,
        o = null;
      if (h.AlignmentPatternCenters.length > 0)
        for (
          var l = i.X - a.X + s.X,
            f = i.Y - a.Y + s.Y,
            u = 1 - 3 / n,
            c = Math.floor(a.X + u * (l - a.X)),
            d = Math.floor(a.Y + u * (f - a.Y)),
            m = 4;
          16 >= m;
          m <<= 1
        ) {
          o = this.findAlignmentInRegion(r, c, d, m);
          break;
        }
      var v,
        M = this.createTransform(a, i, s, o, e),
        q = this.sampleGrid(this.image, M, e);
      return (
        (v = null == o ? new Array(s, a, i) : new Array(s, a, i, o)),
        new DetectorResult(q, v)
      );
    }),
    (this.detect = function() {
      var t = new FinderPatternFinder().findFinderPattern(this.image);
      return this.processFinderPatternInfo(t);
    });
}
(PerspectiveTransform.quadrilateralToQuadrilateral = function(
  t,
  a,
  i,
  s,
  r,
  e,
  h,
  n,
  o,
  l,
  f,
  u,
  c,
  d,
  m,
  v
) {
  var M = this.quadrilateralToSquare(t, a, i, s, r, e, h, n),
    q = this.squareToQuadrilateral(o, l, f, u, c, d, m, v);
  return q.times(M);
}),
  (PerspectiveTransform.squareToQuadrilateral = function(
    t,
    a,
    i,
    s,
    r,
    e,
    h,
    n
  ) {
    return (
      (dy2 = n - e),
      (dy3 = a - s + e - n),
      0 == dy2 && 0 == dy3
        ? new PerspectiveTransform(i - t, r - i, t, s - a, e - s, a, 0, 0, 1)
        : ((dx1 = i - r),
          (dx2 = h - r),
          (dx3 = t - i + r - h),
          (dy1 = s - e),
          (denominator = dx1 * dy2 - dx2 * dy1),
          (a13 = (dx3 * dy2 - dx2 * dy3) / denominator),
          (a23 = (dx1 * dy3 - dx3 * dy1) / denominator),
          new PerspectiveTransform(
            i - t + a13 * i,
            h - t + a23 * h,
            t,
            s - a + a13 * s,
            n - a + a23 * n,
            a,
            a13,
            a23,
            1
          ))
    );
  }),
  (PerspectiveTransform.quadrilateralToSquare = function(
    t,
    a,
    i,
    s,
    r,
    e,
    h,
    n
  ) {
    return this.squareToQuadrilateral(t, a, i, s, r, e, h, n).buildAdjoint();
  });