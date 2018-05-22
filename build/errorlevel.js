export default function ErrorCorrectionLevel(r, e, n) {
  this.ordinal_Renamed_Field = r;
  this.bits = e;
  this.name = n;
  Object.defineProperties(this, {
    Bits: {
      get: function() {
        return this.bits;
      },
    },
    Name: {
      get: function() {
        return this.name;
      },
    },
  });
  this.ordinal = function() {
    return this.ordinal_Renamed_Field;
  };
}
ErrorCorrectionLevel.forBits = function(r) {
  if (0 > r || r >= FOR_BITS.length) throw 'ArgumentException';
  return FOR_BITS[r];
};

const L = new ErrorCorrectionLevel(0, 1, 'L');
const M = new ErrorCorrectionLevel(1, 0, 'M');
const Q = new ErrorCorrectionLevel(2, 3, 'Q');
const H = new ErrorCorrectionLevel(3, 2, 'H');
const FOR_BITS = new Array(M, L, H, Q);
