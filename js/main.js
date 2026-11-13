const SRC = 'https://raw.githubusercontent.com/public-apis/public-apis/master/README.md';
const $ = (id) => document.getElementById(id);
let apis = [];

function parse(md) {
  const out = [];
  let cat = '';
  for (const line of md.split('\n')) {
    const h = line.match(/^### (.+)/);
    if (h) { cat = h[1].trim(); continue; }
    if (!cat || !line.startsWith('|') || /^\|[\s:|-]+\|?$/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((s) => s.trim());
    if (cells.length < 5 || !/^(Yes|No)$/.test(cells[3])) continue;
    const m = cells[0].match(/\[(.+?)\]\((.+?)\)/);
    if (!m) continue;
    out.push({
      name: m[1], url: m[2], desc: cells[1],
      auth: cells[2].replace(/`/g, ''), https: cells[3], cors: cells[4], cat,
    });
  }
  return out;
}

function render() {
  const q = $('q').value.toLowerCase();
  const cat = $('category').value, auth = $('auth').value;
  const rows = apis.filter((a) =>
    (!q || (a.name + ' ' + a.desc).toLowerCase().includes(q)) &&
    (!cat || a.cat === cat) &&
    (!auth || a.auth === auth) &&
    (!$('https').checked || a.https === 'Yes') &&
    (!$('cors').checked || a.cors === 'Yes'));
  const tbody = $('list');
  tbody.replaceChildren(...rows.map((a) => {
    const tr = document.createElement('tr');
    const link = document.createElement('a');
    link.href = a.url; link.textContent = a.name; link.target = '_blank'; link.rel = 'noopener';
    const first = document.createElement('td'); first.append(link);
    tr.append(first);
    for (const v of [a.desc, a.auth, a.https, a.cors, a.cat]) {
      const td = document.createElement('td'); td.textContent = v; tr.append(td);
    }
    return tr;
  }));
  $('count').textContent = `${rows.length} / ${apis.length} 件`;
}

async function init() {
  try {
    const res = await fetch(SRC);
    if (!res.ok) throw new Error(res.status);
    apis = parse(await res.text());
    const cats = [...new Set(apis.map((a) => a.cat))];
    $('category').append(...cats.map((c) => new Option(c, c)));
    $('status').remove();
    render();
  } catch (e) {
    $('status').textContent = '読み込みに失敗しました: ' + e.message;
  }
}

for (const id of ['q', 'category', 'auth', 'https', 'cors']) $(id).addEventListener('input', render);
init();
