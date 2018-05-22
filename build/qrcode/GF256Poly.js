export function GF256(primitive) {
  this.expTable = new Array(256);
  this.logTable = new Array(256);
  var x = 1;
  for (var i = 0; i < 256; i++) {
    this.expTable[i] = x;
    x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
    if (x >= 0x100) {
      x ^= primitive;
    }
  }
  for (var i = 0; i < 255; i++) {
    this.logTable[this.expTable[i]] = i;
  }
  // logTable[0] == 0 but this should never be used
  var at0 = new Array(1);
  at0[0] = 0;
  this.zero = new GF256Poly(this, new Array(at0));
  var at1 = new Array(1);
  at1[0] = 1;
  this.one = new GF256Poly(this, new Array(at1));

  Object.defineProperties(this, {
    Zero: {
      get: function() {
        return this.zero;
      },
    },

    One: {
      get: function() {
        return this.one;
      },
    },
  });

  this.buildMonomial = function(degree, coefficient) {
    if (degree < 0) {
      throw 'System.ArgumentException';
    }
    if (coefficient == 0) {
      return zero;
    }
    var coefficients = new Array(degree + 1);
    for (var i = 0; i < coefficients.length; i++) coefficients[i] = 0;
    coefficients[0] = coefficient;
    return new GF256Poly(this, coefficients);
  };

  this.exp = function(a) {
    return this.expTable[a];
  };
  this.log = function(a) {
    if (a == 0) {
      throw 'System.ArgumentException';
    }
    return this.logTable[a];
  };
  this.inverse = function(a) {
    if (a == 0) {
      throw 'System.ArithmeticException';
    }
    return this.expTable[255 - this.logTable[a]];
  };
  this.multiply = function(a, b) {
    if (a == 0 || b == 0) {
      return 0;
    }
    if (a == 1) {
      return b;
    }
    if (b == 1) {
      return a;
    }
    return this.expTable[(this.logTable[a] + this.logTable[b]) % 255];
  };
}

GF256.QR_CODE_FIELD = new GF256(0x011d);
GF256.DATA_MATRIX_FIELD = new GF256(0x012d);

GF256.addOrSubtract = function(a, b) {
  return a ^ b;
};

export function GF256Poly(field, coefficients) {
  if (coefficients == null || coefficients.length == 0) {
    throw 'System.ArgumentException';
  }
  this.field = field;
  var coefficientsLength = coefficients.length;
  if (coefficientsLength > 1 && coefficients[0] == 0) {
    // Leading term must be non-zero for anything except the constant polynomial "0"
    var firstNonZero = 1;
    while (
      firstNonZero < coefficientsLength &&
      coefficients[firstNonZero] == 0
    ) {
      firstNonZero++;
    }
    if (firstNonZero == coefficientsLength) {
      this.coefficients = field.Zero.coefficients;
    } else {
      this.coefficients = new Array(coefficientsLength - firstNonZero);
      for (var i = 0; i < this.coefficients.length; i++)
        this.coefficients[i] = 0;
      //Array.Copy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);
      for (var ci = 0; ci < this.coefficients.length; ci++)
        this.coefficients[ci] = coefficients[firstNonZero + ci];
    }
  } else {
    this.coefficients = coefficients;
  }

  Object.defineProperties(this, {
    Zero: {
      get: function() {
        return this.coefficients[0] == 0;
      },
    },

    Degree: {
      get: function() {
        return this.coefficients.length - 1;
      },
    },

    Coefficients: {
      get: function() {
        return this.coefficients;
      },
    },
  });

  this.getCoefficient = function(degree) {
    return this.coefficients[this.coefficients.length - 1 - degree];
  };

  this.evaluateAt = function(a) {
    if (a == 0) {
      // Just return the x^0 coefficient
      return this.getCoefficient(0);
    }
    var size = this.coefficients.length;
    if (a == 1) {
      // Just the sum of the coefficients
      var result = 0;
      for (var i = 0; i < size; i++) {
        result = GF256.addOrSubtract(result, this.coefficients[i]);
      }
      return result;
    }
    var result2 = this.coefficients[0];
    for (var i = 1; i < size; i++) {
      result2 = GF256.addOrSubtract(
        this.field.multiply(a, result2),
        this.coefficients[i]
      );
    }
    return result2;
  };

  this.addOrSubtract = function(other) {
    if (this.field != other.field) {
      throw 'GF256Polys do not have same GF256 field';
    }
    if (this.Zero) {
      return other;
    }
    if (other.Zero) {
      return this;
    }

    var smallerCoefficients = this.coefficients;
    var largerCoefficients = other.coefficients;
    if (smallerCoefficients.length > largerCoefficients.length) {
      var temp = smallerCoefficients;
      smallerCoefficients = largerCoefficients;
      largerCoefficients = temp;
    }
    var sumDiff = new Array(largerCoefficients.length);
    var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
    // Copy high-order terms only found in higher-degree polynomial's coefficients
    //Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
    for (var ci = 0; ci < lengthDiff; ci++)
      sumDiff[ci] = largerCoefficients[ci];

    for (var i = lengthDiff; i < largerCoefficients.length; i++) {
      sumDiff[i] = GF256.addOrSubtract(
        smallerCoefficients[i - lengthDiff],
        largerCoefficients[i]
      );
    }

    return new GF256Poly(field, sumDiff);
  };

  this.multiply1 = function(other) {
    if (this.field != other.field) {
      throw 'GF256Polys do not have same GF256 field';
    }
    if (this.Zero || other.Zero) {
      return this.field.Zero;
    }
    var aCoefficients = this.coefficients;
    var aLength = aCoefficients.length;
    var bCoefficients = other.coefficients;
    var bLength = bCoefficients.length;
    var product = new Array(aLength + bLength - 1);
    for (var i = 0; i < aLength; i++) {
      var aCoeff = aCoefficients[i];
      for (var j = 0; j < bLength; j++) {
        product[i + j] = GF256.addOrSubtract(
          product[i + j],
          this.field.multiply(aCoeff, bCoefficients[j])
        );
      }
    }
    return new GF256Poly(this.field, product);
  };

  this.multiply2 = function(scalar) {
    if (scalar == 0) {
      return this.field.Zero;
    }
    if (scalar == 1) {
      return this;
    }
    var size = this.coefficients.length;
    var product = new Array(size);
    for (var i = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], scalar);
    }
    return new GF256Poly(this.field, product);
  };

  this.multiplyByMonomial = function(degree, coefficient) {
    if (degree < 0) {
      throw 'System.ArgumentException';
    }

    if (coefficient == 0) {
      return this.field.Zero;
    }
    var size = this.coefficients.length;
    var product = new Array(size + degree);
    for (var i = 0; i < product.length; i++) product[i] = 0;
    for (var i = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], coefficient);
    }
    return new GF256Poly(this.field, product);
  };

  this.divide = function(other) {
    if (this.field != other.field) {
      throw 'GF256Polys do not have same GF256 field';
    }
    if (other.Zero) {
      throw 'Divide by 0';
    }

    var quotient = this.field.Zero;
    var remainder = this;

    var denominatorLeadingTerm = other.getCoefficient(other.Degree);
    var inverseDenominatorLeadingTerm = this.field.inverse(
      denominatorLeadingTerm
    );

    while (remainder.Degree >= other.Degree && !remainder.Zero) {
      var degreeDifference = remainder.Degree - other.Degree;
      var scale = this.field.multiply(
        remainder.getCoefficient(remainder.Degree),
        inverseDenominatorLeadingTerm
      );
      var term = other.multiplyByMonomial(degreeDifference, scale);
      var iterationQuotient = this.field.buildMonomial(degreeDifference, scale);
      quotient = quotient.addOrSubtract(iterationQuotient);
      remainder = remainder.addOrSubtract(term);
    }

    return new Array(quotient, remainder);
  };
}
