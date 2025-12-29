function pushUnique(arr, item) {
  if (!item) return;
  if (!arr.includes(item)) arr.push(item);
}

function topNByScore(items, n = 3) {
  return [...items].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, n);
}

module.exports = { pushUnique, topNByScore };
