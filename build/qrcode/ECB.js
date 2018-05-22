export default function ECB(count, dataCodewords) {
  this.count = count;
  this.dataCodewords = dataCodewords;

  Object.defineProperties(this, {
    Count: {
      get: function() {
        return this.count;
      },
    },

    DataCodewords: {
      get: function() {
        return this.dataCodewords;
      },
    },
  });
}
