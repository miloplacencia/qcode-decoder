export default function ECBlocks(ecCodewordsPerBlock, ecBlocks1, ecBlocks2) {
  this.ecCodewordsPerBlock = ecCodewordsPerBlock;

  if (ecBlocks2) this.ecBlocks = new Array(ecBlocks1, ecBlocks2);
  else this.ecBlocks = new Array(ecBlocks1);

  Object.defineProperties(this, {
    ECCodewordsPerBlock: {
      get: function() {
        return this.ecCodewordsPerBlock;
      },
    },

    TotalECCodewords: {
      get: function() {
        return this.ecCodewordsPerBlock * this.NumBlocks;
      },
    },

    NumBlocks: {
      get: function() {
        var total = 0;

        for (var i = 0; i < this.ecBlocks.length; i++)
          total += this.ecBlocks[i].length;

        return total;
      },
    },
  });

  this.getECBlocks = function() {
    return this.ecBlocks;
  };
}
