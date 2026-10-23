'use strict';

// Each cluster's coordinates are the exact top-left of its first icon, in
// the supplied 887 × 1774 map's coordinate space. Order is back-to-front.
const SET_INFO = Object.freeze({
  A: { color: 'Purple', image: './assets/Resonating_Crystal_Purple.png' },
  B: { color: 'Blue', image: './assets/Resonating_Crystal_Blue.png' },
  C: { color: 'Red', image: './assets/Resonating_Crystal_Red.png' },
  D: { color: 'Green', image: './assets/Resonating_Crystal_Green.png' }
});
const ALL_SETS = new Set(['A', 'B', 'C', 'D']);
const locations = [
  { id: 's01', panel: 'surface', x: 364, y: 133, icons: [{ set: 'B', offsetX: 0 }], identifier: true },
  { id: 's02', panel: 'surface', x: 705, y: 165, icons: [{ set: 'C', offsetX: 0 }], identifier: true },
  { id: 's03', panel: 'surface', x: 106, y: 348, icons: [{ set: 'C', offsetX: 0 }, { set: 'A', offsetX: 19 }] },
  { id: 's04', panel: 'surface', x: 245, y: 300, icons: [{ set: 'C', offsetX: 0 }, { set: 'B', offsetX: 24 }] },
  { id: 's05', panel: 'surface', x: 312, y: 344, icons: [{ set: 'D', offsetX: 0 }, { set: 'A', offsetX: 20 }] },
  { id: 's06', panel: 'surface', x: 474, y: 288, icons: [{ set: 'D', offsetX: 0 }], identifier: true },
  { id: 's07', panel: 'surface', x: 603, y: 330, icons: [{ set: 'A', offsetX: 0 }, { set: 'B', offsetX: 25 }] },
  { id: 's08', panel: 'surface', x: 734, y: 326, icons: [{ set: 'D', offsetX: 0 }], identifier: true },
  { id: 's09', panel: 'surface', x: 79, y: 529, icons: [{ set: 'D', offsetX: 0 }], identifier: true },
  { id: 's10', panel: 'surface', x: 152, y: 497, icons: [{ set: 'B', offsetX: 0 }], identifier: true },
  { id: 's11', panel: 'surface', x: 285, y: 524, icons: [{ set: 'A', offsetX: 0 }, { set: 'B', offsetX: 24 }] },
  { id: 's12', panel: 'surface', x: 360, y: 482, icons: [{ set: 'C', offsetX: 0 }, { set: 'D', offsetX: 21 }] },
  { id: 's13', panel: 'surface', x: 447, y: 596, icons: [{ set: 'A', offsetX: 0 }], identifier: true },
  { id: 's14', panel: 'surface', x: 226, y: 709, icons: [{ set: 'C', offsetX: 0 }, { set: 'B', offsetX: 26 }] },
  { id: 's15', panel: 'surface', x: 322, y: 767, icons: [{ set: 'A', offsetX: 0 }], identifier: true },
  { id: 'u01', panel: 'underground', x: 553, y: 964, icons: [{ set: 'C', offsetX: 0 }] },
  { id: 'u02', panel: 'underground', x: 437, y: 1163, icons: [{ set: 'B', offsetX: 0 }] },
  { id: 'u03', panel: 'underground', x: 661, y: 1219, icons: [{ set: 'A', offsetX: 0 }, { set: 'D', offsetX: 50 }] },
  { id: 'u04', panel: 'underground', x: 296, y: 1328, icons: [{ set: 'B', offsetX: 0 }, { set: 'A', offsetX: 35 }] },
  { id: 'u05', panel: 'underground', x: 315, y: 1525, icons: [{ set: 'D', offsetX: 0 }, { set: 'C', offsetX: 38 }] },
  { id: 'u06', panel: 'underground', x: 660, y: 1512, icons: [{ set: 'D', offsetX: 0 }, { set: 'C', offsetX: 37 }] }
];

const identifierCenters = new Map([
  ['s01', [408, 151]], ['s02', [750, 184]],
  ['s06', [512, 306]], ['s08', [777, 348]],
  ['s09', [116, 549]], ['s10', [191, 516]],
  ['s13', [490, 616]], ['s15', [370, 787]]
]);

const SVG_NS = 'http://www.w3.org/2000/svg';
const selectedLocationIds = new Set();
const elementsById = new Map();
const starElementsById = new Map();
const locationLayer = document.getElementById('location-layer');
const starLayer = document.getElementById('star-layer');
const chips = [...document.querySelectorAll('[data-set]')];
const statusPanel = document.getElementById('status-panel');
const statusKicker = document.getElementById('status-kicker');
const statusTitle = document.getElementById('status-title');
const statusDetail = document.getElementById('status-detail');
const selectionCounter = document.getElementById('selection-count');
const mobileStatusPanel = document.getElementById('mobile-status-panel');
const mobileStatusTitle = document.getElementById('mobile-status-title');
const mobileStatusDetail = document.getElementById('mobile-status-detail');

function svgElement(tag, attrs = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

function calculatePossibleSets(selectedIds) {
  if (selectedIds.size === 0) return new Set(ALL_SETS);

  // Always recompute from all selections; never incrementally restore/eliminate.
  let possible = new Set(ALL_SETS);
  for (const location of locations) {
    if (!selectedIds.has(location.id)) continue;
    const locationSets = new Set(location.icons.map(icon => icon.set));
    possible = new Set([...possible].filter(set => locationSets.has(set)));
  }
  return possible;
}

function createIdentifierStar(centerX, centerY) {
  const group = svgElement('g', { class: 'identifier-star' });
  for (const degrees of [90, 30, 150]) {
    const radians = degrees * Math.PI / 180;
    const dx = Math.cos(radians) * 12;
    const dy = Math.sin(radians) * 12;
    const line = { x1: centerX - dx, y1: centerY - dy, x2: centerX + dx, y2: centerY + dy };
    group.append(
      svgElement('line', { ...line, stroke: '#be6800', 'stroke-width': 7 }),
      svgElement('line', { ...line, stroke: '#ffde14', 'stroke-width': 4 })
    );
  }
  group.append(svgElement('circle', { cx: centerX, cy: centerY, r: 3, fill: '#ffde14' }));
  return group;
}

function makeLocation(location) {
  const size = location.panel === 'surface' ? { w: 60, h: 84 } : { w: 85, h: 120 };
  const clusterWidth = size.w + Math.max(...location.icons.map(icon => icon.offsetX));
  const hitWidth = Math.max(122, clusterWidth + 26);
  const hitHeight = Math.max(120, size.h + 26);
  const hitX = location.x + (clusterWidth - hitWidth) / 2;
  const hitY = location.y + (size.h - hitHeight) / 2;
  const ringX = location.x - 9;
  const ringY = location.y - 9;
  const ringWidth = clusterWidth + 18;
  const ringHeight = size.h + 18;

  const group = svgElement('g', {
    class: 'location',
    'data-location-id': location.id,
    role: 'button',
    tabindex: '0',
    'aria-pressed': 'false'
  });
  const ring = { x: ringX, y: ringY, width: ringWidth, height: ringHeight, rx: 17, ry: 17 };
  group.append(
    svgElement('rect', { ...ring, class: 'selection-underlay' }),
    svgElement('rect', { ...ring, class: 'selection-outline' }),
    svgElement('rect', { ...ring, class: 'focus-outline' })
  );

  const sprites = svgElement('g', { class: 'sprites', 'aria-hidden': 'true' });
  group.append(sprites);

  const checkX = ringX + ringWidth - 4;
  const checkY = ringY + ringHeight - 1;
  const check = svgElement('g', { class: 'selection-check', 'aria-hidden': 'true' });
  check.append(
    svgElement('circle', { cx: checkX, cy: checkY, r: 19 }),
    svgElement('path', { d: `M ${checkX - 9} ${checkY} l 6 7 l 13 -15` })
  );
  group.append(check);
  group.append(svgElement('rect', {
    class: 'hit-area', x: hitX, y: hitY, width: hitWidth, height: hitHeight,
    'aria-hidden': 'true'
  }));

  group.addEventListener('click', () => toggleLocation(location.id));
  group.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleLocation(location.id);
    }
  });
  elementsById.set(location.id, { group, sprites, size });
  locationLayer.append(group);

  if (location.identifier) {
    const [x, y] = identifierCenters.get(location.id);
    const star = createIdentifierStar(x, y);
    starLayer.append(star);
    starElementsById.set(location.id, star);
  }
}

function toggleLocation(id) {
  if (selectedLocationIds.has(id)) selectedLocationIds.delete(id);
  else selectedLocationIds.add(id);
  render();
}

function labelForLocation(location, selected) {
  const labelSets = [...new Set(location.icons.map(icon => icon.set))].sort();
  const setsText = labelSets.length === 1
    ? `set ${labelSets[0]}`
    : `sets ${labelSets.slice(0, -1).join(', ')} and ${labelSets.at(-1)}`;
  return `${location.panel === 'surface' ? 'Surface' : 'Underground'} crystal location ${location.id.toUpperCase()}, possible ${setsText}, ${selected ? 'selected' : 'not selected'}.`;
}

function render() {
  const possibleSets = calculatePossibleSets(selectedLocationIds);
  let possibleLocationCount = 0;

  for (const location of locations) {
    const { group, sprites, size } = elementsById.get(location.id);
    const selected = selectedLocationIds.has(location.id);
    const activeIcons = location.icons.filter(icon => possibleSets.has(icon.set));
    const visible = activeIcons.length > 0 || selected;
    if (activeIcons.length) possibleLocationCount++;

    group.style.display = visible ? '' : 'none';
    group.classList.toggle('is-selected', selected);
    group.setAttribute('aria-pressed', String(selected));
    group.setAttribute('aria-label', labelForLocation(location, selected));

    // Rebuild sprites in original paint order at the exact supplied coordinates.
    sprites.replaceChildren(...activeIcons.map(icon => svgElement('image', {
      href: SET_INFO[icon.set].image,
      x: location.x + icon.offsetX,
      y: location.y,
      width: size.w,
      height: size.h,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
      'pointer-events': 'none'
    })));

    const star = starElementsById.get(location.id);
    if (star) star.style.display = activeIcons.length ? '' : 'none';
  }

  for (const chip of chips) {
    const set = chip.dataset.set;
    const active = possibleSets.has(set);
    chip.classList.toggle('is-eliminated', !active);
    chip.setAttribute('aria-label', `Set ${set}, ${SET_INFO[set].color}, ${active ? 'possible' : 'eliminated'}`);
  }

  statusPanel.classList.toggle('is-identified', possibleSets.size === 1);
  statusPanel.classList.toggle('is-impossible', possibleSets.size === 0);
  selectionCounter.textContent = `${selectedLocationIds.size} confirmed`;
  mobileStatusPanel.classList.toggle('is-identified', possibleSets.size === 1);
  mobileStatusPanel.classList.toggle('is-impossible', possibleSets.size === 0);
  mobileStatusDetail.textContent = `${selectedLocationIds.size} confirmed`;
  if (possibleSets.size === 0) {
    mobileStatusTitle.textContent = 'No match';
    mobileStatusPanel.setAttribute('aria-label', 'No layout matches these selections');
  } else if (possibleSets.size === 1) {
    const set = [...possibleSets][0];
    mobileStatusTitle.textContent = `${set} · ${SET_INFO[set].color}`;
    mobileStatusPanel.setAttribute('aria-label', `Identified: ${SET_INFO[set].color}, Set ${set}`);
  } else if (possibleSets.size === 4) {
    mobileStatusTitle.textContent = '4 possible';
    mobileStatusPanel.setAttribute('aria-label', '4 layouts possible');
  } else {
    mobileStatusTitle.textContent = `${[...possibleSets].join(' / ')} possible`;
    mobileStatusPanel.setAttribute('aria-label', `Possible layouts: ${[...possibleSets].join(', ')}`);
  }

  if (possibleSets.size === 0) {
    statusKicker.textContent = 'NO MATCH';
    statusTitle.textContent = 'No layout matches these selections';
    statusDetail.textContent = 'All confirmed spots stay selected. Tap one again to undo, or reset.';
  } else if (possibleSets.size === 1) {
    const set = [...possibleSets][0];
    statusKicker.textContent = 'LAYOUT IDENTIFIED';
    statusTitle.textContent = `Identified: ${SET_INFO[set].color} · Set ${set}`;
    statusDetail.textContent = `${possibleLocationCount} matching crystal locations shown.`;
  } else {
    statusKicker.textContent = 'CURRENT MATCH';
    statusTitle.textContent = `${possibleSets.size} layouts possible`;
    statusDetail.textContent = `${possibleLocationCount} possible crystal locations shown.`;
  }
}

for (const location of locations) makeLocation(location);
for (const button of document.querySelectorAll('[data-reset-selections]')) {
  button.addEventListener('click', () => {
    selectedLocationIds.clear();
    render();
  });
}
render();

// file:// works directly offline. On HTTPS (including GitHub Pages), also
// cache the site to make later visits possible without an internet connection.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
