function DataBlock(o, r) {
  this.numDataCodewords = o;
  this.codewords = r;

  Object.defineProperties(this, {
    NumDataCodewords: {
      get: function() {
        return this.numDataCodewords;
      },
    },
    Codewords: {
      get: function() {
        return this.codewords;
      },
    },
  });
}

DataBlock.getDataBlocks = function(o, r, e) {
  if (o.length != r.TotalCodewords) throw 'ArgumentException';
  for (
    var t = r.getECBlocksForLevel(e), d = 0, a = t.getECBlocks(), n = 0;
    n < a.length;
    n++
  )
    d += a[n].Count;
  for (var s = new Array(d), c = 0, w = 0; w < a.length; w++)
    for (var l = a[w], n = 0; n < l.Count; n++) {
      var f = l.DataCodewords,
        i = t.ECCodewordsPerBlock + f;
      s[c++] = new DataBlock(f, new Array(i));
    }
  for (var C = s[0].codewords.length, g = s.length - 1; g >= 0; ) {
    var h = s[g].codewords.length;
    if (h == C) break;
    g--;
  }
  g++;
  for (var u = C - t.ECCodewordsPerBlock, v = 0, n = 0; u > n; n++)
    for (var w = 0; c > w; w++) s[w].codewords[n] = o[v++];
  for (var w = g; c > w; w++) s[w].codewords[u] = o[v++];
  for (var k = s[0].codewords.length, n = u; k > n; n++)
    for (var w = 0; c > w; w++) {
      var B = g > w ? n : n + 1;
      s[w].codewords[B] = o[v++];
    }
  return s;
};

export default DataBlock;
