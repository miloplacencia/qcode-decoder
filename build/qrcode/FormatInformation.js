import ErrorCorrectionLevel from './ErrorCorrectionLevel';

const FORMAT_INFO_MASK_QR = 0x5412;
const FORMAT_INFO_DECODE_LOOKUP = new Array(
  new Array(0x5412, 0x00),
  new Array(0x5125, 0x01),
  new Array(0x5e7c, 0x02),
  new Array(0x5b4b, 0x03),
  new Array(0x45f9, 0x04),
  new Array(0x40ce, 0x05),
  new Array(0x4f97, 0x06),
  new Array(0x4aa0, 0x07),
  new Array(0x77c4, 0x08),
  new Array(0x72f3, 0x09),
  new Array(0x7daa, 0x0a),
  new Array(0x789d, 0x0b),
  new Array(0x662f, 0x0c),
  new Array(0x6318, 0x0d),
  new Array(0x6c41, 0x0e),
  new Array(0x6976, 0x0f),
  new Array(0x1689, 0x10),
  new Array(0x13be, 0x11),
  new Array(0x1ce7, 0x12),
  new Array(0x19d0, 0x13),
  new Array(0x0762, 0x14),
  new Array(0x0255, 0x15),
  new Array(0x0d0c, 0x16),
  new Array(0x083b, 0x17),
  new Array(0x355f, 0x18),
  new Array(0x3068, 0x19),
  new Array(0x3f31, 0x1a),
  new Array(0x3a06, 0x1b),
  new Array(0x24b4, 0x1c),
  new Array(0x2183, 0x1d),
  new Array(0x2eda, 0x1e),
  new Array(0x2bed, 0x1f)
);
const BITS_SET_IN_HALF_BYTE = new Array(
  0,
  1,
  1,
  2,
  1,
  2,
  2,
  3,
  1,
  2,
  2,
  3,
  2,
  3,
  3,
  4
);

export default function FormatInformation(formatInfo) {
  this.errorCorrectionLevel = ErrorCorrectionLevel.forBits(
    (formatInfo >> 3) & 0x03
  );
  this.dataMask = formatInfo & 0x07;

  Object.defineProperties(this, {
    ErrorCorrectionLevel: {
      get: function() {
        return this.errorCorrectionLevel;
      },
    },

    DataMask: {
      get: function() {
        return this.dataMask;
      },
    },
  });

  this.GetHashCode = function() {
    return (this.errorCorrectionLevel.ordinal() << 3) | dataMask;
  };
  this.Equals = function(o) {
    var other = o;
    return (
      this.errorCorrectionLevel == other.errorCorrectionLevel &&
      this.dataMask == other.dataMask
    );
  };
}

FormatInformation.numBitsDiffering = function(a, b) {
  a ^= b; // a now has a 1 bit exactly where its bit differs with b's
  // Count bits set quickly with a series of lookups:
  return (
    BITS_SET_IN_HALF_BYTE[a & 0x0f] +
    BITS_SET_IN_HALF_BYTE[URShift(a, 4) & 0x0f] +
    BITS_SET_IN_HALF_BYTE[URShift(a, 8) & 0x0f] +
    BITS_SET_IN_HALF_BYTE[URShift(a, 12) & 0x0f] +
    BITS_SET_IN_HALF_BYTE[URShift(a, 16) & 0x0f] +
    BITS_SET_IN_HALF_BYTE[URShift(a, 20) & 0x0f] +
    BITS_SET_IN_HALF_BYTE[URShift(a, 24) & 0x0f] +
    BITS_SET_IN_HALF_BYTE[URShift(a, 28) & 0x0f]
  );
};
FormatInformation.decodeFormatInformation = function(maskedFormatInfo) {
  var formatInfo = FormatInformation.doDecodeFormatInformation(
    maskedFormatInfo
  );
  if (formatInfo != null) {
    return formatInfo;
  }
  // Should return null, but, some QR codes apparently
  // do not mask this info. Try again by actually masking the pattern
  // first
  return FormatInformation.doDecodeFormatInformation(
    maskedFormatInfo ^ FORMAT_INFO_MASK_QR
  );
};
FormatInformation.doDecodeFormatInformation = function(maskedFormatInfo) {
  // Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
  var bestDifference = 0xffffffff;
  var bestFormatInfo = 0;
  for (var i = 0; i < FORMAT_INFO_DECODE_LOOKUP.length; i++) {
    var decodeInfo = FORMAT_INFO_DECODE_LOOKUP[i];
    var targetInfo = decodeInfo[0];
    if (targetInfo == maskedFormatInfo) {
      // Found an exact match
      return new FormatInformation(decodeInfo[1]);
    }
    var bitsDifference = this.numBitsDiffering(maskedFormatInfo, targetInfo);
    if (bitsDifference < bestDifference) {
      bestFormatInfo = decodeInfo[1];
      bestDifference = bitsDifference;
    }
  }
  // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
  // differing means we found a match
  if (bestDifference <= 3) {
    return new FormatInformation(bestFormatInfo);
  }
  return null;
};
