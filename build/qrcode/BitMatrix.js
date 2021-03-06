export default function BitMatrix(t, i) {
  if ((i || (i = t), 1 > t || 1 > i))
    throw 'Both dimensions must be greater than 0';

  this.width = t;
  this.height = i;
  var h = t >> 5;

  0 != (31 & t) && h++;
  this.rowSize = h;
  this.bits = new Array(h * i);

  for (var e = 0; e < this.bits.length; e++) this.bits[e] = 0;

  Object.defineProperties(this, {
    Width: {
      get: function() {
        return this.width;
      },
    },
    Height: {
      get: function() {
        return this.height;
      },
    },
    Dimension: {
      get: function() {
        if (this.width != this.height)
          throw "Can't call getDimension() on a non-square matrix";
        return this.width;
      },
    },
  });
  this.get_Renamed = function(t, i) {
    var h = i * this.rowSize + (t >> 5);
    return 0 != (1 & URShift(this.bits[h], 31 & t));
  };
  this.set_Renamed = function(t, i) {
    var h = i * this.rowSize + (t >> 5);
    this.bits[h] |= 1 << (31 & t);
  };
  this.flip = function(t, i) {
    var h = i * this.rowSize + (t >> 5);
    this.bits[h] ^= 1 << (31 & t);
  };
  this.clear = function() {
    for (var t = this.bits.length, i = 0; t > i; i++) this.bits[i] = 0;
  };
  this.setRegion = function(t, i, h, e) {
    if (0 > i || 0 > t) throw 'Left and top must be nonnegative';
    if (1 > e || 1 > h) throw 'Height and width must be at least 1';
    var s = t + h,
      n = i + e;
    if (n > this.height || s > this.width)
      throw 'The region must fit inside the matrix';
    for (var r = i; n > r; r++)
      for (var o = r * this.rowSize, a = t; s > a; a++)
        this.bits[o + (a >> 5)] |= 1 << (31 & a);
  };
}
