/**
 * brain-network.js — ภาพสมองแบบเครือข่าย node ของ The Brain (หน้า Intro ใช้แบบมีอนิเมชัน หน้า Dashboard ใช้ตกแต่ง)
 * เก็บพิกัดไว้แค่ซีกซ้ายแล้วสะท้อนเป็นซีกขวา ทั้งสองหน้าจึงวาดจากข้อมูลชุดเดียว
 */
const WIDTH = 120;

// ซีกซ้าย: o = เส้นขอบสมอง · i = node ด้านใน · m = node ชิดร่องกลางที่ต่อสะพานไปอีกซีก
const NODES = {
  o1: [55, 13], o2: [43, 9], o3: [30, 12], o4: [19, 21], o5: [12, 34], o6: [11, 49],
  o7: [15, 63], o8: [23, 75], o9: [35, 84], o10: [47, 88], o11: [55, 82],
  i1: [38, 24], i2: [26, 35], i3: [43, 38], i4: [24, 52], i5: [39, 55], i6: [28, 68], i7: [44, 72],
  m1: [54, 28], m2: [54, 50], m3: [53, 66],
};

const EDGES = [
  ['o1', 'o2'], ['o2', 'o3'], ['o3', 'o4'], ['o4', 'o5'], ['o5', 'o6'], ['o6', 'o7'], ['o7', 'o8'],
  ['o8', 'o9'], ['o9', 'o10'], ['o10', 'o11'],
  ['o2', 'i1'], ['o3', 'i1'], ['o4', 'i2'], ['o5', 'i2'], ['i1', 'i2'], ['i1', 'i3'], ['i1', 'm1'],
  ['o1', 'm1'], ['m1', 'i3'], ['i2', 'i3'], ['i2', 'i4'], ['o6', 'i4'], ['i3', 'i5'], ['i4', 'i5'],
  ['i3', 'm2'], ['i5', 'm2'], ['o7', 'i4'], ['i4', 'i6'], ['o8', 'i6'], ['i5', 'i6'], ['i5', 'i7'],
  ['i6', 'i7'], ['o9', 'i7'], ['i7', 'm3'], ['m2', 'm3'], ['o10', 'i7'], ['o11', 'm3'],
];

const BRIDGES = ['o1', 'm1', 'm2', 'm3'];

let instance = 0;

const mirror = ([x, y]) => [WIDTH - x, y];
const point = (id) => (id.endsWith("'") ? mirror(NODES[id.slice(0, -1)]) : NODES[id]);
const round = (value) => Math.round(value * 10) / 10;

function line([a, b], index, extraClass = '') {
  const [x1, y1] = point(a);
  const [x2, y2] = point(b);
  return `<line class="brain-network__edge${extraClass}" x1="${round(x1)}" y1="${y1}" x2="${round(x2)}" y2="${y2}" pathLength="1" style="--i: ${index}"></line>`;
}

export function brainNetworkMarkup({ className = '', label = '' } = {}) {
  instance += 1;
  const gradientId = `brain-network-gradient-${instance}`;
  const edges = [
    ...EDGES,
    ...EDGES.map(([a, b]) => [`${a}'`, `${b}'`]),
  ];
  const nodeIds = Object.keys(NODES).flatMap((id) => [id, `${id}'`]);

  const edgeMarkup = edges.map((edge, index) => line(edge, index)).join('');
  const bridgeMarkup = BRIDGES
    .map((id, index) => line([id, `${id}'`], edges.length + index, ' brain-network__edge--bridge'))
    .join('');
  const nodeMarkup = nodeIds.map((id, index) => {
    const [cx, cy] = point(id);
    const radius = id.startsWith('m') ? 2.4 : 1.9;
    return `<circle class="brain-network__node" cx="${round(cx)}" cy="${cy}" r="${radius}" style="--i: ${index}"></circle>`;
  }).join('');

  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="brain-network ${className}" viewBox="0 0 ${WIDTH} 100" ${a11y} focusable="false">`
    + '<defs>'
    + `<linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${WIDTH}" y2="100">`
    + '<stop offset="0" style="stop-color: var(--accent-strong)"></stop>'
    + '<stop offset="1" style="stop-color: var(--accent-alt-strong)"></stop>'
    + '</linearGradient>'
    + '</defs>'
    + `<g stroke="url(#${gradientId})" fill="none">${edgeMarkup}${bridgeMarkup}</g>`
    + `<g fill="url(#${gradientId})">${nodeMarkup}</g>`
    + '</svg>';
}
