function DataMask000() {
  (this.unmaskBitMatrix = function(a, t) {
    for (var i = 0; t > i; i++)
      for (var s = 0; t > s; s++) this.isMasked(i, s) && a.flip(s, i);
  }),
    (this.isMasked = function(a, t) {
      return 0 == ((a + t) & 1);
    });
}
function DataMask001() {
  (this.unmaskBitMatrix = function(a, t) {
    for (var i = 0; t > i; i++)
      for (var s = 0; t > s; s++) this.isMasked(i, s) && a.flip(s, i);
  }),
    (this.isMasked = function(a) {
      return 0 == (1 & a);
    });
}
function DataMask010() {
  (this.unmaskBitMatrix = function(a, t) {
    for (var i = 0; t > i; i++)
      for (var s = 0; t > s; s++) this.isMasked(i, s) && a.flip(s, i);
  }),
    (this.isMasked = function(a, t) {
      return t % 3 == 0;
    });
}
function DataMask011() {
  (this.unmaskBitMatrix = function(a, t) {
    for (var i = 0; t > i; i++)
      for (var s = 0; t > s; s++) this.isMasked(i, s) && a.flip(s, i);
  }),
    (this.isMasked = function(a, t) {
      return (a + t) % 3 == 0;
    });
}
function DataMask100() {
  (this.unmaskBitMatrix = function(a, t) {
    for (var i = 0; t > i; i++)
      for (var s = 0; t > s; s++) this.isMasked(i, s) && a.flip(s, i);
  }),
    (this.isMasked = function(a, t) {
      return 0 == ((URShift(a, 1) + t / 3) & 1);
    });
}
function DataMask101() {
  (this.unmaskBitMatrix = function(a, t) {
    for (var i = 0; t > i; i++)
      for (var s = 0; t > s; s++) this.isMasked(i, s) && a.flip(s, i);
  }),
    (this.isMasked = function(a, t) {
      var i = a * t;
      return (1 & i) + i % 3 == 0;
    });
}
function DataMask110() {
  (this.unmaskBitMatrix = function(a, t) {
    for (var i = 0; t > i; i++)
      for (var s = 0; t > s; s++) this.isMasked(i, s) && a.flip(s, i);
  }),
    (this.isMasked = function(a, t) {
      var i = a * t;
      return 0 == (((1 & i) + i % 3) & 1);
    });
}
function DataMask111() {
  (this.unmaskBitMatrix = function(a, t) {
    for (var i = 0; t > i; i++)
      for (var s = 0; t > s; s++) this.isMasked(i, s) && a.flip(s, i);
  }),
    (this.isMasked = function(a, t) {
      return 0 == ((((a + t) & 1) + (a * t) % 3) & 1);
    });
}

const DataMask = {
  forReference = function(a) {
    if (0 > a || a > 7) throw 'System.ArgumentException';
    return DataMask.DATA_MASKS[a];
  },
  DATA_MASKS = new Array(
    new DataMask000(),
    new DataMask001(),
    new DataMask010(),
    new DataMask011(),
    new DataMask100(),
    new DataMask101(),
    new DataMask110(),
    new DataMask111(),
  ),
};

export default DataMask;
