/**
 * Count up category logic
 * Uses guaranteed non-overlapping jittered grid spatial allocation.
 */

let cuNums = [];
let cuNext = 0;

/**
 * Generate countup question with jittered grid placement
 * @param {number} d - Difficulty level
 */
const gCU = function(d) {
  var c = document.getElementById('gCard');
  var count = 3 + Math.min(S.qn - 1, 5); // 3 to 8 numbers
  
  var minV, maxV;
  if (S.qn <= 2) {
    minV = 1; maxV = 9;
  } else if (S.qn <= 4) {
    minV = 10; maxV = 99;
  } else {
    minV = 100; maxV = 999;
  }

  cuNums = [];
  var used = {};
  for (var i = 0; i < count; i++) {
    var n;
    do {
      n = ri(minV, maxV);
    } while (used[n]);
    used[n] = true;
    cuNums.push(n);
  }
  cuNums.sort(function(a, b) { return a - b; });
  cuNext = 0;

  c.innerHTML = '<div class="ins">Tap ascending (smallest first)</div><div class="cu-arena" id="cuA"></div>';
  var ar = document.getElementById('cuA');
  var aw2 = ar.offsetWidth || 280, ah = ar.offsetHeight || 220;

  // Compute grid dimensions that accommodate `count` non-overlapping cells
  var cols, rows;
  if (count <= 4) {
    cols = 2; rows = 2;
  } else if (count <= 6) {
    if (ah > aw2 * 1.15) { cols = 2; rows = 3; }
    else { cols = 3; rows = 2; }
  } else {
    if (ah > aw2 * 1.25) { cols = 2; rows = 4; }
    else { cols = 3; rows = 3; }
  }

  var cellW = aw2 / cols;
  var cellH = ah / rows;

  // Build grid slot coordinates
  var slots = [];
  for (var r = 0; r < rows; r++) {
    for (var cl = 0; cl < cols; cl++) {
      slots.push({ r: r, c: cl });
    }
  }
  slots = shuf(slots); // Randomize which slot each number receives

  var sf = shuf(cuNums.map(function(n, i) { return { n: n, i: i }; }));

  // Vivid, eye-catching color palette
  var cCols = [
    '#ff4d6a', '#ffd93d', '#6bcb77', '#4d96ff',
    '#ff884b', '#c780fa', '#2abfbf', '#ff6b8b'
  ];

  sf.forEach(function(item, idx) {
    var slot = slots[idx];
    var slotLeft = slot.c * cellW;
    var slotTop = slot.r * cellH;

    // Sized comfortably within cell boundaries
    var maxSz = Math.min(cellW * 0.78, cellH * 0.78, 86);
    var minSz = Math.max(46, Math.min(cellW * 0.64, cellH * 0.64, 70));
    var sz = Math.round(ri(Math.floor(minSz), Math.floor(maxSz)));

    // Bounded jitter strictly inside the assigned cell
    var marginX = (cellW - sz) / 2;
    var marginY = (cellH - sz) / 2;
    var maxJitterX = Math.max(0, marginX - 4);
    var maxJitterY = Math.max(0, marginY - 4);
    var jitterX = (Math.random() * 2 - 1) * maxJitterX;
    var jitterY = (Math.random() * 2 - 1) * maxJitterY;

    var px = Math.round(slotLeft + marginX + jitterX);
    var py = Math.round(slotTop + marginY + jitterY);

    var col = cCols[item.i % cCols.length];
    var dur = (ri(24, 38) / 10) + 's';
    var del = (ri(0, 15) / 10) + 's';

    var el = document.createElement('div');
    el.className = 'cu-circle';
    el.id = 'cu' + item.i;
    el.onclick = function() { cuTap(item.i); };

    // Ambiguity indicator for 6 and 9
    var isAmbiguous = (item.n === 6 || item.n === 9);
    var textDecoration = isAmbiguous ? 'text-decoration: underline; text-underline-offset: 4px;' : '';
    var fontSize = Math.round(sz * (String(item.n).length > 2 ? 0.32 : 0.40));

    el.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;' +
      'left:' + px + 'px;top:' + py + 'px;' +
      'background:' + col + ';' +
      'font-size:' + fontSize + 'px;' +
      textDecoration +
      'animation: cuFloat ' + dur + ' ease-in-out ' + del + ' infinite alternate;';

    el.textContent = item.n;
    ar.appendChild(el);
  });
};

/**
 * Handle countup tap
 * @param {number} idx - Index of clicked circle
 */
const cuTap = function(idx) {
  if (!S.ap) return;
  if (idx === cuNext) {
    var el = document.getElementById('cu' + idx);
    if (el) {
      el.classList.add('cu-done');
    }
    cuNext++;
    playOk();
    if (cuNext >= cuNums.length) {
      S.ap = false;
      var p = aw(25);
      showFly('+' + p, true);
      showRx(true);
      setTimeout(nxt, 400);
    }
  } else {
    var el = document.getElementById('cu' + idx);
    if (el) {
      el.classList.add('cu-wrong');
      setTimeout(function() { el.classList.remove('cu-wrong'); }, 350);
    }
    playNo();
  }
};
