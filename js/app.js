/* CATÁLOGO: para agregar un juego, añade una línea aquí.
   Si tiene "id", debe existir en games.js. Sin "id" aparece como "Próximamente". */
var CATALOG = [
  { id: 'bosque',  name: 'Salva el Bosque', cat: 'Acción',    ico: '🌳', desc: 'Toca los incendios antes de que quemen los árboles.' },
  { id: 'recicla', name: 'Recicla Rápido',  cat: 'Educativo', ico: '♻️', desc: 'Clasifica la basura en el contenedor correcto en 30 segundos.' },
  { id: 'memoria', name: 'Memoria Verde',   cat: 'Puzzle',    ico: '🌻', desc: 'Encuentra las 6 parejas de la naturaleza.' },
  { name: 'Océano Limpio',  cat: 'Acción',    ico: '🐢' },
  { name: 'Ciudad Solar',   cat: 'Educativo', ico: '🌞' },
  { name: 'Río Puzzle',     cat: 'Puzzle',    ico: '💧' }
];
var CATS = ['Todos', 'Acción', 'Puzzle', 'Educativo'];
var state = { cat: 'Todos', q: '' }, stop = null, current = null;

var $ = function (id) { return document.getElementById(id); };
var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };

function renderCats() {
  $('cats').innerHTML = '';
  CATS.forEach(function (c) {
    var b = document.createElement('button');
    b.className = 'chip' + (c === state.cat ? ' on' : '');
    b.textContent = c;
    b.onclick = function () { state.cat = c; renderCats(); renderGrid(); };
    $('cats').appendChild(b);
  });
}

function renderGrid() {
  var q = norm(state.q), n = 0;
  $('grid').innerHTML = '';
  CATALOG.forEach(function (g) {
    if (state.cat !== 'Todos' && g.cat !== state.cat) return;
    if (q && norm(g.name + ' ' + g.cat).indexOf(q) < 0) return;
    n++;
    var b = document.createElement('button');
    b.className = 'card';
    b.innerHTML = '<span class="ico">' + g.ico + '</span><b>' + g.name + '</b><small>' + (g.id ? g.cat : 'Próximamente') + '</small>';
    if (g.id) b.onclick = function () { openGame(g); }; else b.disabled = true;
    $('grid').appendChild(b);
  });
  $('empty').hidden = n > 0;
  $('title').textContent = state.cat === 'Todos' ? 'Todos los juegos' : state.cat;
}

function launch() {
  if (stop) stop();
  $('stage').innerHTML = '';
  stop = Games[current.id]($('stage'));
}
function openGame(g) {
  current = g;
  $('mtitle').textContent = g.name;
  $('mdesc').textContent = g.desc;
  $('modal').hidden = false;
  document.body.style.overflow = 'hidden';
  launch();
}
function closeGame() {
  if (stop) stop(); stop = null;
  $('stage').innerHTML = '';
  $('modal').hidden = true;
  document.body.style.overflow = '';
}

$('q').oninput = function () { state.q = this.value; renderGrid(); };
$('mclose').onclick = closeGame;
$('mreset').onclick = launch;
$('heroPlay').onclick = function () { openGame(CATALOG[0]); };
$('modal').onclick = function (e) { if (e.target === this) closeGame(); };
document.onkeydown = function (e) { if (e.key === 'Escape' && !$('modal').hidden) closeGame(); };

renderCats();
renderGrid();