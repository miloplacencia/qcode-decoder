export default function BitMatrixParser(r) {
  var i = r.Dimension;
  if (21 > i || 1 != (3 & i)) throw 'Error BitMatrixParser';
  (this.bitMatrix = r),
    (this.parsedVersion = null),
    (this.parsedFormatInfo = null),
    (this.copyBit = function(r, i, t) {
      return this.bitMatrix.get_Renamed(r, i) ? (t << 1) | 1 : t << 1;
    }),
    (this.readFormatInformation = function() {
      if (null != this.parsedFormatInfo) return this.parsedFormatInfo;
      for (var r = 0, i = 0; 6 > i; i++) r = this.copyBit(i, 8, r);
      (r = this.copyBit(7, 8, r)),
        (r = this.copyBit(8, 8, r)),
        (r = this.copyBit(8, 7, r));
      for (var t = 5; t >= 0; t--) r = this.copyBit(8, t, r);
      if (
        ((this.parsedFormatInfo = FormatInformation.decodeFormatInformation(r)),
        null != this.parsedFormatInfo)
      )
        return this.parsedFormatInfo;
      var o = this.bitMatrix.Dimension;
      r = 0;
      for (var s = o - 8, i = o - 1; i >= s; i--) r = this.copyBit(i, 8, r);
      for (var t = o - 7; o > t; t++) r = this.copyBit(8, t, r);
      if (
        ((this.parsedFormatInfo = FormatInformation.decodeFormatInformation(r)),
        null != this.parsedFormatInfo)
      )
        return this.parsedFormatInfo;
      throw 'Error readFormatInformation';
    }),
    (this.readVersion = function() {
      if (null != this.parsedVersion) return this.parsedVersion;
      var r = this.bitMatrix.Dimension,
        i = (r - 17) >> 2;
      if (6 >= i) return Version.getVersionForNumber(i);
      for (var t = 0, o = r - 11, s = 5; s >= 0; s--)
        for (var n = r - 9; n >= o; n--) t = this.copyBit(n, s, t);
      if (
        ((this.parsedVersion = Version.decodeVersionInformation(t)),
        null != this.parsedVersion &&
          this.parsedVersion.DimensionForVersion == r)
      )
        return this.parsedVersion;
      t = 0;
      for (var n = 5; n >= 0; n--)
        for (var s = r - 9; s >= o; s--) t = this.copyBit(n, s, t);
      if (
        ((this.parsedVersion = Version.decodeVersionInformation(t)),
        null != this.parsedVersion &&
          this.parsedVersion.DimensionForVersion == r)
      )
        return this.parsedVersion;
      throw 'Error readVersion';
    }),
    (this.readCodewords = function() {
      var r = this.readFormatInformation(),
        i = this.readVersion(),
        t = DataMask.forReference(r.DataMask),
        o = this.bitMatrix.Dimension;
      t.unmaskBitMatrix(this.bitMatrix, o);
      for (
        var s = i.buildFunctionPattern(),
          n = !0,
          e = new Array(i.TotalCodewords),
          a = 0,
          d = 0,
          h = 0,
          f = o - 1;
        f > 0;
        f -= 2
      ) {
        6 == f && f--;
        for (var m = 0; o > m; m++)
          for (var p = n ? o - 1 - m : m, u = 0; 2 > u; u++)
            s.get_Renamed(f - u, p) ||
              (h++,
              (d <<= 1),
              this.bitMatrix.get_Renamed(f - u, p) && (d |= 1),
              8 == h && ((e[a++] = d), (h = 0), (d = 0)));
        n ^= !0;
      }
      if (a != i.TotalCodewords) throw 'Error readCodewords';
      return e;
    });
}
