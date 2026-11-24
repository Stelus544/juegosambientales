/* Cada juego recibe un contenedor y devuelve una función para detenerse */
var Games = {};

/* ---------- SALVA EL BOSQUE (original) ---------- */
Games.bosque = function (box) {
  var c = document.createElement('canvas');
  c.width = 480; c.height = 320; c.className = 'gcanvas';
  box.appendChild(c);
  var x = c.getContext('2d');
  var trees = [], score = 0, lives = 5, t = 0, spawn = 1, last = 0, run = true, raf, i;
  for (i = 0; i < 6; i++) trees.push({ x: 40 + i * 80, fire: 0 });

  function draw() {
    x.fillStyle = '#0a1a0f'; x.fillRect(0, 0, 480, 320);
    x.fillStyle = '#143d1c'; x.fillRect(0, 270, 480, 50);
    x.textAlign = 'center';
    trees.forEach(function (a) {
      x.font = '56px serif'; x.fillText('🌳', a.x, 265);
      if (a.fire) {
        x.font = '40px serif'; x.fillText('🔥', a.x, 190);
        var lim = Math.max(1.2, 2.8 - t / 60);
        x.fillStyle = '#ff4d2e'; x.fillRect(a.x - 25, 200, 50 * (1 - a.fire / lim), 5);
      }
    });
    x.fillStyle = '#39ff14'; x.font = 'bold 18px Arial'; x.textAlign = 'left';
    x.fillText('Salvados: ' + score, 10, 24);
    x.textAlign = 'right'; x.fillText('Vidas: ' + lives, 470, 24);
    if (lives <= 0) {
      x.textAlign = 'center'; x.font = 'bold 28px Arial';
      x.fillText('¡El bosque te necesita!', 240, 130);
      x.font = '18px Arial'; x.fillText('Salvaste ' + score + ' árboles. Toca para reintentar', 240, 165);
    }
  }
  function loop(ts) {
    if (!run) return;
    var dt = Math.min(ts - last, 50) / 1000; last = ts;
    if (lives > 0) {
      t += dt; spawn -= dt;
      if (spawn <= 0) {
        var free = trees.filter(function (a) { return !a.fire; });
        if (free.length) free[Math.floor(Math.random() * free.length)].fire = 0.001;
        spawn = Math.max(0.5, 1.6 - t / 40);
      }
      var lim = Math.max(1.2, 2.8 - t / 60);
      trees.forEach(function (a) {
        if (a.fire) { a.fire += dt; if (a.fire > lim) { a.fire = 0; lives--; } }
      });
    }
    draw();
    raf = requestAnimationFrame(loop);
  }
  c.addEventListener('pointerdown', function (e) {
    if (lives <= 0) { trees.forEach(function (a) { a.fire = 0; }); score = 0; lives = 5; t = 0; spawn = 1; return; }
    var r = c.getBoundingClientRect(), px = (e.clientX - r.left) * 480 / r.width;
    trees.forEach(function (a) {
      if (a.fire && Math.abs(px - a.x) < 40) { a.fire = 0; score++; }
    });
  });
  raf = requestAnimationFrame(function (ts) { last = ts; loop(ts); });
  return function () { run = false; cancelAnimationFrame(raf); };
};

/* ---------- MEMORIA VERDE ---------- */
Games.memoria = function (box) {
  var em = ['🌳', '♻️', '💧', '🌞', '🐢', '🌻'];
  var cards = em.concat(em).sort(function () { return Math.random() - 0.5; });
  var open = [], lock = false, pairs = 0, moves = 0;
  var info = document.createElement('p'); info.className = 'ginfo'; box.appendChild(info);
  var g = document.createElement('div'); g.className = 'mgrid'; box.appendChild(g);
  function upd() {
    info.textContent = pairs === 6 ? '¡Ganaste en ' + moves + ' movimientos!' : 'Movimientos: ' + moves + ' | Parejas: ' + pairs + '/6';
  }
  cards.forEach(function (e) {
    var b = document.createElement('button'); b.textContent = '?';
    b.onclick = function () {
      if (lock || b.disabled || open.indexOf(b) > -1) return;
      b.textContent = e; b.className = 'up'; open.push(b);
      if (open.length === 2) {
        moves++; lock = true;
        var p = open[0], q = open[1];
        if (p.textContent === q.textContent) { pairs++; p.disabled = q.disabled = true; open = []; lock = false; }
        else setTimeout(function () {
          p.textContent = q.textContent = '?'; p.className = q.className = ''; open = []; lock = false;
        }, 700);
      }
      upd();
    };
    g.appendChild(b);
  });
  upd();
  return function () {};
};

/* ---------- RECICLA RÁPIDO ---------- */
Games.recicla = function (box) {
  var I = [['📰', 'papel'], ['📦', 'papel'], ['🍾', 'plastico'], ['🥤', 'plastico'], ['🍎', 'organico'], ['🍌', 'organico']];
  var B = { papel: '🔵 Papel', plastico: '🟡 Plástico', organico: '🟤 Orgánico' };
  var s = 0, t = 30, cur;
  var info = document.createElement('p'); info.className = 'ginfo'; box.appendChild(info);
  var item = document.createElement('div'); item.className = 'big'; box.appendChild(item);
  var bins = document.createElement('div'); bins.className = 'bins'; box.appendChild(bins);
  function upd() { info.textContent = 'Tiempo: ' + t + 's | Puntos: ' + s; }
  function next() { cur = I[Math.floor(Math.random() * I.length)]; item.textContent = cur[0]; }
  Object.keys(B).forEach(function (k) {
    var b = document.createElement('button'); b.textContent = B[k];
    b.onclick = function () {
      if (t <= 0) return;
      s = cur[1] === k ? s + 1 : Math.max(0, s - 1);
      next(); upd();
    };
    bins.appendChild(b);
  });
  var iv = setInterval(function () {
    t--; upd();
    if (t <= 0) { clearInterval(iv); item.textContent = '🏁'; info.textContent = 'Fin: ' + s + ' puntos'; }
  }, 1000);
  next(); upd();
  return function () { clearInterval(iv); };
};