/**
 * Count up category logic
 * Features 150%-300% enlarged disks, 30°-300°/min rotation, and
 * a real-time 60 FPS 2D elastic collision physics engine for dancing, non-overlapping disks.
 */

let cuNums = [];
let cuNext = 0;
let cuAnimId = null;
let cuCircles = [];

/**
 * Stop any active Count Up physics animation loop
 */
const stopCuPhysics = function() {
  if (cuAnimId) {
    cancelAnimationFrame(cuAnimId);
    cuAnimId = null;
  }
  cuCircles = [];
};

/**
 * Generate countup question with dancing 2D elastic collision physics
 * @param {number} d - Difficulty level
 */
const gCU = function(d) {
  stopCuPhysics();

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
  var aw2 = ar.offsetWidth || 340;
  var ah = ar.offsetHeight || 260;

  var sf = shuf(cuNums.map(function(n, i) { return { n: n, i: i }; }));

  // Disk sizes increased by 150% to 250%
  var minSz, maxSz;
  if (count <= 4) {
    minSz = 92; maxSz = 118;
  } else if (count <= 6) {
    minSz = 76; maxSz = 98;
  } else {
    minSz = 66; maxSz = 86;
  }

  // Adjust if arena is particularly compact
  var maxAllowed = Math.min(aw2, ah) * 0.46;
  if (maxSz > maxAllowed) {
    var scale = maxAllowed / maxSz;
    minSz = Math.round(minSz * scale);
    maxSz = Math.round(maxSz * scale);
  }

  cuCircles = [];

  sf.forEach(function(item) {
    var sz = Math.round(minSz + Math.random() * (maxSz - minSz));
    var r = sz / 2;

    // High-contrast tactile texture fill
    var tex = (typeof CU_TEXTURES !== 'undefined') ? CU_TEXTURES[item.i % CU_TEXTURES.length] : null;
    var bg = tex ? tex.bg : '#ff4d6a';
    var borderColor = tex ? tex.border : 'rgba(255,255,255,0.85)';

    // Rotation speed: between 30° and 300° per second in CW or CCW direction
    var degPerSec = 30 + Math.random() * 270;
    var rotDir = (Math.random() > 0.5) ? 1 : -1;
    var rotSpeed = degPerSec * rotDir;
    var angle = Math.random() * 360;

    // Dancing velocity: faster center coordinate changes (45 to 80 px/s)
    var speed = 45 + Math.random() * 35;
    var moveAngle = Math.random() * Math.PI * 2;
    var vx = Math.cos(moveAngle) * speed;
    var vy = Math.sin(moveAngle) * speed;

    var el = document.createElement('div');
    el.className = 'cu-circle';
    el.id = 'cu' + item.i;
    el.onclick = function() { cuTap(item.i); };

    // Big numbers with bold, underlined font
    var fontSize = Math.round(sz * (String(item.n).length > 2 ? 0.36 : 0.46));
    el.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;' +
      'background:' + bg + ';' +
      'border-color:' + borderColor + ';' +
      'font-size:' + fontSize + 'px;' +
      'font-weight:900;' +
      'text-decoration:underline;text-underline-offset:4px;';
    el.textContent = item.n;
    ar.appendChild(el);

    // Initial placement with rejection sampling
    var bestX = r + Math.random() * Math.max(10, aw2 - 2 * r);
    var bestY = r + Math.random() * Math.max(10, ah - 2 * r);
    var maxMinDist = -1;

    for (var att = 0; att < 100; att++) {
      var candX = r + Math.random() * Math.max(10, aw2 - 2 * r);
      var candY = r + Math.random() * Math.max(10, ah - 2 * r);
      var valid = true;
      var closest = Infinity;

      for (var j = 0; j < cuCircles.length; j++) {
        var other = cuCircles[j];
        var d = Math.hypot(candX - other.x, candY - other.y);
        var req = r + other.r + 6;
        if (d < req) { valid = false; }
        if (d - (r + other.r) < closest) { closest = d - (r + other.r); }
      }

      if (valid) {
        bestX = candX;
        bestY = candY;
        break;
      }
      if (closest > maxMinDist) {
        maxMinDist = closest;
        bestX = candX;
        bestY = candY;
      }
    }

    cuCircles.push({
      x: bestX,
      y: bestY,
      r: r,
      sz: sz,
      vx: vx,
      vy: vy,
      angle: angle,
      rotSpeed: rotSpeed,
      mass: r * r,
      el: el,
      done: false
    });
  });

  // Pre-relaxation passes to guarantee strictly zero overlap at start
  for (var step = 0; step < 20; step++) {
    for (var i = 0; i < cuCircles.length; i++) {
      for (var j = i + 1; j < cuCircles.length; j++) {
        var c1 = cuCircles[i];
        var c2 = cuCircles[j];
        var dx = c2.x - c1.x;
        var dy = c2.y - c1.y;
        var dist = Math.hypot(dx, dy) || 0.001;
        var req = c1.r + c2.r + 4;
        if (dist < req) {
          var overlap = (req - dist) * 0.5;
          var nx = dx / dist;
          var ny = dy / dist;
          c1.x -= nx * overlap;
          c1.y -= ny * overlap;
          c2.x += nx * overlap;
          c2.y += ny * overlap;
        }
      }
      var cObj = cuCircles[i];
      cObj.x = Math.max(cObj.r, Math.min(aw2 - cObj.r, cObj.x));
      cObj.y = Math.max(cObj.r, Math.min(ah - cObj.r, cObj.y));
    }
  }

  // Initial draw
  for (var i = 0; i < cuCircles.length; i++) {
    var cObj = cuCircles[i];
    cObj.el.style.left = Math.round(cObj.x - cObj.r) + 'px';
    cObj.el.style.top = Math.round(cObj.y - cObj.r) + 'px';
    cObj.el.style.transform = 'rotate(' + cObj.angle.toFixed(1) + 'deg)';
  }

  // Real-time 60 FPS 2D Elastic Collision Physics Engine
  var lastTime = performance.now();

  var cuPhysicsStep = function(now) {
    if (!ar || !ar.isConnected) {
      stopCuPhysics();
      return;
    }

    var dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.035) dt = 0.035; // Prevent tunneling on lag

    var curW = ar.offsetWidth || aw2;
    var curH = ar.offsetHeight || ah;

    // 1. Move & Bounce off Arena Boundaries
    for (var i = 0; i < cuCircles.length; i++) {
      var c = cuCircles[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.angle = (c.angle + c.rotSpeed * dt) % 360;

      // Wall reflections with boundary clamping
      if (c.x - c.r < 0) {
        c.x = c.r;
        c.vx = Math.abs(c.vx);
      } else if (c.x + c.r > curW) {
        c.x = curW - c.r;
        c.vx = -Math.abs(c.vx);
      }

      if (c.y - c.r < 0) {
        c.y = c.r;
        c.vy = Math.abs(c.vy);
      } else if (c.y + c.r > curH) {
        c.y = curH - c.r;
        c.vy = -Math.abs(c.vy);
      }
    }

    // 2. 2D Elastic Circle-Circle Collisions (Guaranteed Zero Overlap)
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < cuCircles.length; i++) {
        for (var j = i + 1; j < cuCircles.length; j++) {
          var c1 = cuCircles[i];
          var c2 = cuCircles[j];
          var dx = c2.x - c1.x;
          var dy = c2.y - c1.y;
          var distSq = dx * dx + dy * dy;
          var minDist = c1.r + c2.r;

          if (distSq < minDist * minDist) {
            var dist = Math.sqrt(distSq);
            if (dist === 0) { dx = 1; dy = 0; dist = 1; }
            var nx = dx / dist;
            var ny = dy / dist;

            // Strict positional separation: push apart along normal vector so they never overlap
            var overlap = (minDist - dist) * 0.5;
            c1.x -= nx * overlap;
            c1.y -= ny * overlap;
            c2.x += nx * overlap;
            c2.y += ny * overlap;

            // Re-clamp within arena boundaries
            c1.x = Math.max(c1.r, Math.min(curW - c1.r, c1.x));
            c1.y = Math.max(c1.r, Math.min(curH - c1.r, c1.y));
            c2.x = Math.max(c2.r, Math.min(curW - c2.r, c2.x));
            c2.y = Math.max(c2.r, Math.min(curH - c2.r, c2.y));

            // Elastic Impulse Velocity Exchange (Conservation of Momentum)
            var dvx = c1.vx - c2.vx;
            var dvy = c1.vy - c2.vy;
            var velAlongNormal = dvx * nx + dvy * ny;

            if (velAlongNormal > 0) {
              var e = 0.98; // Restitution
              var impulse = -(1 + e) * velAlongNormal / (1 / c1.mass + 1 / c2.mass);
              c1.vx += (impulse / c1.mass) * nx;
              c1.vy += (impulse / c1.mass) * ny;
              c2.vx -= (impulse / c2.mass) * nx;
              c2.vy -= (impulse / c2.mass) * ny;
            }
          }
        }
      }
    }

    // 3. Render Positions & Rotations
    for (var i = 0; i < cuCircles.length; i++) {
      var c = cuCircles[i];
      c.el.style.left = Math.round(c.x - c.r) + 'px';
      c.el.style.top = Math.round(c.y - c.r) + 'px';
      c.el.style.transform = 'rotate(' + c.angle.toFixed(1) + 'deg)';
    }

    cuAnimId = requestAnimationFrame(cuPhysicsStep);
  };

  cuAnimId = requestAnimationFrame(cuPhysicsStep);
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
    if (cuCircles[idx]) {
      cuCircles[idx].done = true;
    }
    cuNext++;
    playOk();
    if (cuNext >= cuNums.length) {
      S.ap = false;
      stopCuPhysics();
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

