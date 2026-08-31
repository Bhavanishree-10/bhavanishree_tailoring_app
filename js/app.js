// BHAVANISHREE TAILORING SHOP — முதன்மை பயன்பாட்டு தர்க்கம் (Router + Views)

const $view = document.getElementById('view-root');
const $bottomNav = document.getElementById('bottom-nav');
const $sidebar = document.getElementById('sidebar');
const $modalLayer = document.getElementById('modal-layer');
const $toastLayer = document.getElementById('toast-layer');

const SHOP_NAME = 'BHAVANISHREE TAILORING SHOP';

// ---------------- Field configuration ----------------

const BLOUSE_CORE_FIELDS = [
  { key: 'kaiUyaram', label: 'கை உயரம்', required: false },
  { key: 'kaiAkkul', label: 'கை அக்குள்', required: false },
  { key: 'muzhuUyaram', label: 'முழு உயரம்', required: false },
  { key: 'kazhuthu', label: 'கழுத்து', required: false },
  { key: 'shoulder', label: 'சோல்டர்', required: false },
  { key: 'pinKazhuthu', label: 'பின் கழுத்து', required: false },
  { key: 'munKazhuthu', label: 'முன் கழுத்து', required: false },
  { key: 'bodyMarbu', label: 'பாடி மார்பு.சு', required: false },
  { key: 'patti', label: 'பட்டி', required: false }
];

// ஆர்ம்ஹோல் வரைபடத்திற்கான அளவுகள் — பிளவுஸ் மாடலுக்கு மட்டும்
const BLOUSE_ARMHOLE_FIELDS = [
  { key: 'armholeDepth', label: 'Box Line Height', hint: 'ஆர்ம்ஹோல் ஆழம் (Armhole Depth)', required: false },
  { key: 'kaiSuttalavu', label: 'கைச்சுற்றளவு', required: false }
];

const BLOUSE_FIELDS = BLOUSE_CORE_FIELDS.concat(BLOUSE_ARMHOLE_FIELDS);

const CHUDITHAR_FIELDS = BLOUSE_CORE_FIELDS.concat([
  { key: 'openUyaram', label: 'ஓபன் உயரம்', required: false },
  { key: 'pantHeight', label: 'பேண்ட் உயரம்', required: false },
  { key: 'pattiHeightWidth', label: 'பட்டி உயரம் & அகலம்', required: false }
]);

function fieldsForModel(model) {
  return model === 'chudithar' ? CHUDITHAR_FIELDS : BLOUSE_FIELDS;
}
function modelLabel(model) {
  return model === 'chudithar' ? 'சுடிதார்' : 'பிளவுஸ்';
}
function cuttingTypeLabel(cuttingType) {
  return cuttingType === 'cross' ? 'குறுக்கு கட்டிங்' : (cuttingType === 'neer' ? 'நேர் கட்டிங்' : '');
}

// ==================================================
// உடல் அளவு (Body Measurements tab) — standalone பேட்டர்ன் ஜெனரேட்டர்
// Independent of the Customers/Measurements DB entirely — its own store.
// ==================================================

const BODY_PATTERN_FIELDS = [
  { key: 'backLength', label: '1. பிளவுஸ் பின் உயரம்', hint: 'Back Length', placeholder: '14.0' },
  { key: 'fullChest', label: '2. முழு மார்புச் சுற்றளவு', hint: 'Full Chest', placeholder: '36.0' },
  { key: 'upperChest', label: '3. மேல் மார்பு சுற்றளவு', hint: 'Upper Chest', placeholder: '34.0' },
  { key: 'lowerBust', label: '4. கீழ் மார்பு சுற்றளவு', hint: 'Lower Bust', placeholder: '30.0' },
  { key: 'waist', label: '5. இடுப்பு சுற்றளவு', hint: 'Waist', placeholder: '28.0' },
  { key: 'shoulder', label: '6. தோள்பட்டை அகலம்', hint: 'Shoulder Width', placeholder: '14.0' },
  { key: 'frontLength', label: '7. பிளவுஸ் முன் உயரம்', hint: 'Front Length', placeholder: '13.0' },
  { key: 'shoulderToApex', label: '8. டாட் இறக்கம்', hint: 'Shoulder to Apex', placeholder: '9.5' },
  { key: 'apexToApex', label: '9. இரு முனை இடைவெளி', hint: 'Apex to Apex', placeholder: '7.0' },
  { key: 'frontNeckDepth', label: '10. முன் கழுத்து இறக்கம்', hint: 'Front Neck Depth', placeholder: '6.0' },
  { key: 'backNeckDepth', label: '11. பின் கழுத்து இறக்கம்', hint: 'Back Neck Depth', placeholder: '8.5' },
  { key: 'sleeveLength', label: '12. கை நீளம்', hint: 'Sleeve Length', placeholder: '6.5' },
  { key: 'sleeveTop', label: '13. கை மேல் சுற்றளவு', hint: 'Sleeve Top', placeholder: '13.0' },
  { key: 'sleeveBottom', label: '14. கை கீழ் சுற்றளவு', hint: 'Sleeve Bottom', placeholder: '11.0' }
];

// Pure body-fit formulas — identical to the standalone pattern generator.
function computeBlousePatternDerived(rawInput) {
  const raw = rawInput || {};
  const num = (v) => parseFloat(v) || 0;
  return {
    shoulderLine: (num(raw.shoulder) / 2) - 1,
    armholeDepth: (num(raw.fullChest) / 6) - 0.5,
    chestLineFit: num(raw.upperChest) / 4,
    lowerBustLine: num(raw.lowerBust) / 4,
    waistLine: num(raw.waist) / 4,
    apexWidthPos: num(raw.apexToApex) / 2,
    mainDartWidth: num(raw.fullChest) / 12,
    sleeveCap: (num(raw.fullChest) / 12) + 0.5,
    sleeveTopWidth: num(raw.sleeveTop) / 2,
    sleeveBottomWidth: num(raw.sleeveBottom) / 2
  };
}

function buildStandalonePatternSheet(rawInput) {
  const raw = rawInput || {};
  const d = computeBlousePatternDerived(raw);

  const backSvg = fillPatternSvg(PATTERN_BACK_SVG, {
    'back-val-length': raw.backLength,
    'back-val-neck-depth': raw.backNeckDepth,
    'back-val-shoulder': d.shoulderLine,
    'back-val-armhole-depth': d.armholeDepth,
    'back-val-chest': d.chestLineFit,
    'back-val-waist': d.waistLine
  });
  const frontSvg = fillPatternSvg(PATTERN_FRONT_SVG, {
    'front-val-length': raw.frontLength,
    'front-val-neck-depth': raw.frontNeckDepth,
    'front-val-shoulder': d.shoulderLine,
    'front-val-armhole-depth': d.armholeDepth,
    'front-val-chest': d.chestLineFit,
    'front-val-apex-depth': raw.shoulderToApex,
    'front-val-apex-width': d.apexWidthPos,
    'front-val-dart-width': d.mainDartWidth,
    'front-val-lower-bust': d.lowerBustLine
  });
  const sleeveSvg = fillPatternSvg(PATTERN_SLEEVE_SVG, {
    'sleeve-val-length': raw.sleeveLength,
    'sleeve-val-cap': d.sleeveCap,
    'sleeve-val-top': d.sleeveTopWidth,
    'sleeve-val-bottom': d.sleeveBottomWidth
  });

  return h`
    <div class="patterns-grid" id="patternsGrid">
      <div class="pattern-card">
        <div class="pattern-header"><span class="pattern-name">1. BACK PATTERN (பின்பகுதி)</span></div>
        ${backSvg}
      </div>
      <div class="pattern-card">
        <div class="pattern-header"><span class="pattern-name">2. FRONT PATTERN (முன்பகுதி)</span></div>
        ${frontSvg}
      </div>
      <div class="pattern-card">
        <div class="pattern-header"><span class="pattern-name">3. SLEEVE PATTERN (கைப்பகுதி)</span></div>
        ${sleeveSvg}
      </div>
    </div>
  `;
}

// ==================================================
// பிளவுஸ் பேட்டர்ன் ஜெனரேட்டர் (blouse_pattern_generator.md வழிமுறை)
// ==================================================

// Raw pattern SVG templates (decoded from blouse_pattern_generator.md).
// Each dim-val <text> node carries an id — we fill it in with the customer's value.
const PATTERN_BACK_SVG = `<svg viewbox="0 0 540 560" xmlns="http://www.w3.org/2000/svg">
        <g class="pattern-main-line" stroke-width="2">
          <rect x="110" y="80" width="370" height="390" stroke="#d5c8be" stroke-width="1.2" />
          <line x1="200" y1="102" x2="300" y2="102"></line>
          <line x1="200" y1="80" x2="200" y2="280"></line>
          <line x1="110" y1="280" x2="200" y2="280"></line>
          <path d="M 115 280 C 175 280 198 260 200 215" stroke-width="2.5" />
          <line x1="300" y1="80" x2="300" y2="215"></line>
          <line x1="300" y1="215" x2="480" y2="215"></line>
          <path d="M 300 175 C 300 210 330 215 365 215" stroke-width="2.5" />
          <line x1="110" y1="440" x2="430" y2="440"></line>
          <line x1="426" y1="215" x2="370" y2="470" class="pattern-seam-line" stroke-width="1.5"></line>
          <line x1="480" y1="215" x2="425" y2="470" stroke-width="2.2"></line>
        </g>
        <line x1="40" y1="80" x2="40" y2="470" class="dim-line"></line>
        <line x1="75" y1="80" x2="75" y2="280" class="dim-line"></line>
        <line x1="110" y1="50" x2="300" y2="50" class="dim-line"></line>
        <line x1="110" y1="515" x2="425" y2="515" class="dim-line"></line>
        <text x="442" y="360" class="dim-text" transform="rotate(-82 442 360)">SEAM ALLOWANCE</text>
        <text x="435" y="495" class="dim-text">1.5 in</text>
        <text x="32" y="320" class="dim-text" transform="rotate(-90 32 320)">LENGTH OF BLOUSE</text>
        <text x="24" y="465" id="back-val-length" class="dim-val">--</text>
        <text x="67" y="225" class="dim-text" transform="rotate(-90 67 225)">BACK NECK DEPTH</text>
        <text x="59" y="275" id="back-val-neck-depth" class="dim-val">--</text>
        <text x="180" y="42" id="back-val-shoulder" class="dim-val">--</text>
        <text x="290" y="155" class="dim-text" transform="rotate(-90 315 200)">ARMHOLE DEPTH</text>
        <text x="310" y="150" id="back-val-armhole-depth" class="dim-val">--</text>
        <text x="375" y="205" id="back-val-chest" class="dim-val">--</text>
        <text x="110" y="535" class="dim-text">WAIST LINE</text>
        <text x="240" y="535" id="back-val-waist" class="dim-val">--</text>
      </svg>`;

const PATTERN_FRONT_SVG = `<svg viewbox="0 0 540 540" xmlns="http://www.w3.org/2000/svg">
        <g class="pattern-main-line" stroke-width="2.2">
          <rect x="90" y="40" width="380" height="390" stroke="#d5c8be" stroke-width="1.2" />
          <line x1="175" y1="40" x2="175" y2="205"></line>
          <line x1="90" y1="205" x2="175" y2="205"></line>
          <path d="M 135 205 C 170 205 175 180 175 150" stroke-width="2.5" />
          <line x1="255" y1="40" x2="255" y2="198"></line>
          <line x1="255" y1="198" x2="425" y2="198"></line>
          <path d="M 255 135 C 256 182 285 198 340 198" stroke-width="2.5" />
          <line x1="255" y1="150" x2="270" y2="198" stroke-width="1.8"></line>
          <path d="M 90 295 L 173 310 L 90 323" stroke-width="2.2" />
          <path d="M 255 198 L 222 295 L 290 198" stroke-width="2.2" />
          <path d="M 175 405 L 205 330 L 235 409" stroke-width="2.2" />
          <path d="M 90 380 L 205 418 L 420 373" stroke-width="2.4" />
          <line x1="380" y1="198" x2="373" y2="380" class="pattern-seam-line" stroke-width="1.8"></line>
          <line x1="425" y1="198" x2="420" y2="373" stroke-width="2.2"></line>
        </g>
        <line x1="35" y1="40" x2="35" y2="430" class="dim-line"></line>
        <line x1="65" y1="40" x2="65" y2="205" class="dim-line"></line>
        <line x1="90" y1="20" x2="255" y2="20" class="dim-line"></line>
        <line x1="90" y1="465" x2="420" y2="465" class="dim-line"></line>
        <text x="438" y="320" class="dim-text" transform="rotate(-82 438 320)">SEAM ALLOWANCE</text>
        <text x="430" y="400" class="dim-text">1.5 in</text>
        <text x="27" y="275" class="dim-text" transform="rotate(-90 27 275)">LENGTH OF BLOUSE</text>
        <text x="18" y="420" id="front-val-length" class="dim-val">--</text>
        <text x="57" y="160" class="dim-text" transform="rotate(-90 57 160)">FRONT NECK DEPTH</text>
        <text x="49" y="200" id="front-val-neck-depth" class="dim-val">--</text>
        <text x="150" y="15" id="front-val-shoulder" class="dim-val">--</text>
        <text x="247" y="130" class="dim-text" transform="rotate(-90 260 150)">ARMHOLE DEPTH</text>
        <text x="265" y="125" id="front-val-armhole-depth" class="dim-val">--</text>
        <text x="330" y="188" id="front-val-chest" class="dim-val">--</text>
        <text x="195" y="325" id="front-val-apex-depth" class="dim-val" transform="rotate(-90 195 325)">--</text>
        <text x="120" y="450" id="front-val-apex-width" class="dim-val">--</text>
        <text x="190" y="450" id="front-val-dart-width" class="dim-val">--</text>
        <text x="90" y="490" class="dim-text">LOWER BUST LINE</text>
        <text x="240" y="490" id="front-val-lower-bust" class="dim-val">--</text>
      </svg>`;

const PATTERN_SLEEVE_SVG = `<svg viewbox="0 0 380 460" xmlns="http://www.w3.org/2000/svg">
        <path d="M 90 40 C 140 40, 205 95, 290 145 C 225 145, 175 90, 90 40 Z" fill="#ebdcd9" />
        <g class="pattern-main-line">
          <path d="M 90 40 C 130 40, 215 80, 290 145" stroke-width="1.6" />
          <path d="M 90 40 C 155 75, 220 142, 290 145" class="pattern-seam-line" stroke-width="1.2" />
          <line x1="90" y1="40" x2="290" y2="145" stroke="#a82035" stroke-width="1.2" stroke-dasharray="4 3"></line>
          <line x1="187" y1="87" x2="193" y2="98" stroke="#a82035" stroke-width="1.2"></line>
          <line x1="90" y1="145" x2="316" y2="145" stroke-width="1.6"></line>
          <line x1="90" y1="40" x2="90" y2="390" stroke-width="1.6"></line>
          <line x1="90" y1="390" x2="295" y2="390" stroke-width="1.6"></line>
          <line x1="290" y1="145" x2="272" y2="390" class="pattern-seam-line" stroke-width="1.2"></line>
          <line x1="316" y1="145" x2="295" y2="390" stroke-width="1.6"></line>
        </g>
        <line x1="45" y1="40" x2="45" y2="390" class="dim-line"></line>
        <line x1="90" y1="420" x2="272" y2="420" class="dim-line"></line>
        <text x="37" y="250" class="dim-text" transform="rotate(-90 37 250)">SLEEVE LENGTH</text>
        <text x="25" y="380" id="sleeve-val-length" class="dim-val">--</text>
        <text x="75" y="105" class="dim-text" transform="rotate(-90 75 105)">SLEEVE CAP</text>
        <text x="105" y="100" id="sleeve-val-cap" class="dim-val">--</text>
        <text x="190" y="138" id="sleeve-val-top" class="dim-val">--</text>
        <text x="90" y="440" id="sleeve-val-bottom" class="dim-val">--</text>
        <text x="280" y="415" class="dim-text">1.0 in</text>
      </svg>`;

function fmtVal(v) {
  if (v === undefined || v === null || v === '') return '--';
  const n = Number(v);
  // Plain numeric values get rounded/formatted as before. Values that include
  // a hyphen (e.g. "14-15") aren't pure numbers, so show them exactly as typed.
  return Number.isFinite(n) ? (Math.round(n * 100) / 100) + '″' : v + '″';
}

function fillPatternSvg(svgTemplate, values) {
  let out = svgTemplate;
  Object.keys(values).forEach((id) => {
    const re = new RegExp('(id="' + id + '"[^>]*>)--(</text>)');
    out = out.replace(re, '$1' + esc(fmtVal(values[id])) + '$2');
  });
  return out;
}

function buildBlousePatternCards(fields) {
  const f = fields || {};
  // Dart width is a light derived estimate from full chest vs upper chest (not a direct measurement field).
  const dartWidth = (f.fullChest != null && f.upperChest != null)
    ? Math.max(0, (parseFloat(f.fullChest) - parseFloat(f.upperChest)) / 4)
    : null;

  const backSvg = fillPatternSvg(PATTERN_BACK_SVG, {
    'back-val-length': f.backLength,
    'back-val-neck-depth': f.backNeckDepth,
    'back-val-shoulder': f.shoulderWidth,
    'back-val-armhole-depth': f.armholeDepth,
    'back-val-chest': f.fullChest,
    'back-val-waist': f.waist
  });
  const frontSvg = fillPatternSvg(PATTERN_FRONT_SVG, {
    'front-val-length': f.frontLength,
    'front-val-neck-depth': f.frontNeckDepth,
    'front-val-shoulder': f.shoulderWidth,
    'front-val-armhole-depth': f.armholeDepth,
    'front-val-chest': f.upperChest,
    'front-val-apex-depth': f.shoulderToApex,
    'front-val-apex-width': f.apexToApex,
    'front-val-dart-width': dartWidth,
    'front-val-lower-bust': f.lowerBust
  });
  const sleeveSvg = fillPatternSvg(PATTERN_SLEEVE_SVG, {
    'sleeve-val-length': f.sleeveLength,
    'sleeve-val-cap': f.armholeDepth,
    'sleeve-val-top': f.sleeveTop,
    'sleeve-val-bottom': f.sleeveBottom
  });

  return h`
    <div class="patterns-grid" id="patternsGrid">
      <div class="pattern-card">
        <div class="pattern-header"><span class="pattern-name">1. BACK PATTERN (பின்பகுதி)</span></div>
        ${backSvg}
      </div>
      <div class="pattern-card">
        <div class="pattern-header"><span class="pattern-name">2. FRONT PATTERN (முன்பகுதி)</span></div>
        ${frontSvg}
      </div>
      <div class="pattern-card">
        <div class="pattern-header"><span class="pattern-name">3. SLEEVE PATTERN (கைப்பகுதி)</span></div>
        ${sleeveSvg}
      </div>
    </div>
    ${buildArmholeBoxDiagramCard(f.armholeDepth, f.kaiSuttalavu)}
  `;
}

// ஆர்ம்ஹோல் பாக்ஸ் லைன் வரைபடம் — Box Line Height (செங்குத்து) + கைச்சுற்றளவு (கிடைமட்டம்)
function buildArmholeBoxDiagramCard(armholeDepth, kaiSuttalavu) {
  const depthVal = fmtVal(armholeDepth);
  const circVal = fmtVal(kaiSuttalavu);
  return h`
    <div class="pattern-card armhole-diagram-card">
      <div class="pattern-header"><span class="pattern-name">ஆர்ம்ஹோல் வரைபடம் (Armhole Box Line Diagram)</span></div>
      <svg viewbox="0 0 340 190" xmlns="http://www.w3.org/2000/svg">
        <line x1="60" y1="18" x2="60" y2="100" class="pattern-main-line" stroke-width="2.5"></line>
        <path d="M 60 100 C 60 135 95 150 145 150" class="pattern-main-line" stroke-width="2.5" fill="none"></path>
        <line x1="145" y1="150" x2="280" y2="150" class="pattern-main-line" stroke-width="2.5"></line>

        <line x1="32" y1="18" x2="32" y2="100" class="dim-line"></line>
        <line x1="60" y1="168" x2="280" y2="168" class="dim-line"></line>

        <text x="24" y="59" class="dim-text" transform="rotate(-90 24 59)">BOX LINE HEIGHT</text>
        <text x="14" y="93" class="dim-val">${esc(depthVal)}</text>

        <text x="170" y="186" class="dim-text" text-anchor="middle">கைச்சுற்றளவு (SLEEVE CIRCUMFERENCE)</text>
        <text x="170" y="163" class="dim-val" text-anchor="middle">${esc(circVal)}</text>
      </svg>
    </div>
  `;
}

// ---------------- Small helpers ----------------

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}
function initials(name) {
  const t = (name || '').trim();
  return t ? t.charAt(0).toUpperCase() : '?';
}
function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString('ta-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return new Date(ts).toLocaleDateString();
  }
}
function h(strings, ...vals) {
  return strings.reduce((acc, s, i) => acc + s + (vals[i] != null ? vals[i] : ''), '');
}
function toast(msg, ms = 2600) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = msg;
  $toastLayer.appendChild(node);
  setTimeout(() => node.remove(), ms);
}

function confirmDialog({ title, text, confirmLabel = 'உறுதி செய்', cancelLabel = 'ரத்து செய்', danger = false }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = h`
      <div class="modal-box" role="dialog" aria-modal="true">
        <h3>${esc(title)}</h3>
        <p>${esc(text)}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-act="cancel">${esc(cancelLabel)}</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${esc(confirmLabel)}</button>
        </div>
      </div>`;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) { cleanup(); resolve(false); }
    });
    backdrop.querySelector('[data-act="cancel"]').onclick = () => { cleanup(); resolve(false); };
    backdrop.querySelector('[data-act="ok"]').onclick = () => { cleanup(); resolve(true); };
    function cleanup() { backdrop.remove(); }
    $modalLayer.appendChild(backdrop);
  });
}

function isValidNumber(v) {
  if (v === '' || v == null) return true; // optional handled separately
  // Accepts a plain measurement ("14", "14.5") or a range/combo written with a
  // hyphen ("14-15", "14.5-1", "14-1/2" style) since tailors often note two
  // linked values this way. At least one digit must appear before any hyphen.
  return /^\d+(\.\d{1,2})?(\s*-\s*\d+(\.\d{1,2})?)*$/.test(String(v).trim());
}

function measurementsEqual(a = {}, b = {}) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    const va = a && a[k] != null ? String(a[k]) : '';
    const vb = b && b[k] != null ? String(b[k]) : '';
    if (va !== vb) return false;
  }
  return true;
}

// ---------------- Router ----------------

const ROUTES = {
  home: () => renderHome(),
  customers: () => renderCustomerList(),
  'customers-new': () => renderCustomerForm(null),
  'customer-detail': (p) => renderCustomerProfile(p.id),
  'customer-edit': (p) => renderCustomerForm(p.id),
  measurements: () => renderPatternList(),
  'measurements-new': () => renderPatternForm(null),
  'measurement-detail': (p) => renderPatternDetail(p.id),
  'measurement-edit': (p) => renderPatternForm(p.id),
  settings: () => renderSettings(),
  'settings-backup': () => renderBackupRestore('backup'),
  'settings-restore': () => renderBackupRestore('restore')
};

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/home';
  const [pathPart, queryPart] = raw.split('?');
  const query = {};
  if (queryPart) {
    queryPart.split('&').forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }
  const segs = pathPart.split('/').filter(Boolean);
  return { segs, query };
}

function navigate(path, { replace = false } = {}) {
  if (replace) {
    // Swap the current history entry instead of pushing a new one, so that
    // "← பின்செல்" (back) skips over form pages (e.g. "new customer") and
    // returns to whatever the user was on before opening the form.
    // Changing just the fragment still fires 'hashchange', which the router
    // is already listening for, so no extra render call is needed here.
    const url = location.pathname + location.search + '#' + path;
    location.replace(url);
  } else {
    location.hash = path;
  }
}

function currentSection() {
  const { segs } = parseHash();
  if (segs[0] === 'customers' || segs[0] === undefined && false) return 'customers';
  if (segs[0] === 'measurements') return 'measurements';
  if (segs[0] === 'settings') return 'settings';
  if (segs[0] === 'home' || segs.length === 0) return 'home';
  return segs[0] === 'customers' ? 'customers' : segs[0];
}

async function router() {
  const { segs, query } = parseHash();
  window.scrollTo(0, 0);

  try {
    if (segs.length === 0 || (segs[0] === 'home')) {
      await ROUTES.home();
    } else if (segs[0] === 'customers' && segs.length === 1) {
      await ROUTES.customers();
    } else if (segs[0] === 'customers' && segs[1] === 'new') {
      await ROUTES['customers-new']();
    } else if (segs[0] === 'customers' && segs.length === 2) {
      await ROUTES['customer-detail']({ id: segs[1] });
    } else if (segs[0] === 'customers' && segs[2] === 'edit') {
      await ROUTES['customer-edit']({ id: segs[1] });
    } else if (segs[0] === 'measurements' && segs.length === 1) {
      await ROUTES.measurements();
    } else if (segs[0] === 'measurements' && segs[1] === 'new') {
      await ROUTES['measurements-new']();
    } else if (segs[0] === 'measurements' && segs.length === 2) {
      await ROUTES['measurement-detail']({ id: segs[1] });
    } else if (segs[0] === 'measurements' && segs[2] === 'edit') {
      await ROUTES['measurement-edit']({ id: segs[1] });
    } else if (segs[0] === 'settings' && segs.length === 1) {
      await ROUTES.settings();
    } else if (segs[0] === 'settings' && segs[1] === 'backup') {
      await ROUTES['settings-backup']();
    } else if (segs[0] === 'settings' && segs[1] === 'restore') {
      await ROUTES['settings-restore']();
    } else {
      await ROUTES.home();
    }
  } catch (err) {
    console.error(err);
    $view.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div><div class="msg">ஏதோ தவறு நடந்தது</div><div class="sub">மீண்டும் முயற்சிக்கவும்.</div></div>`;
  }

  updateNavHighlight();
}

window.addEventListener('hashchange', router);

// ---------------- Shell: topbar + nav ----------------

function setTopbar({ title, showBack = false, action = null }) {
  const $bar = document.getElementById('topbar');
  $bar.innerHTML = '';
  if (showBack) {
    const b = document.createElement('button');
    b.className = 'back-btn';
    b.innerHTML = '← பின்செல்';
    b.onclick = () => history.back();
    $bar.appendChild(b);
  }
  const t = document.createElement('h1');
  t.textContent = title;
  $bar.appendChild(t);
  if (action) $bar.appendChild(action);
}

const NAV_ITEMS = [
  { key: 'home', icon: '🏠', label: 'முகப்பு', path: '/home' },
  { key: 'customers', icon: '👩', label: 'வாடிக்கையாளர்கள்', path: '/customers' },
  { key: 'measurements', icon: '📏', label: 'உடல் அளவு', path: '/measurements' },
  { key: 'settings', icon: '⚙️', label: 'அமைப்புகள்', path: '/settings' }
];

function buildNav() {
  $bottomNav.innerHTML = NAV_ITEMS.map((it) => h`
    <button data-key="${it.key}" data-path="${it.path}">
      <span class="nav-icon">${it.icon}</span><span>${esc(it.label)}</span>
    </button>`).join('');
  $bottomNav.querySelectorAll('button').forEach((btn) => {
    btn.onclick = () => navigate(btn.dataset.path);
  });

  $sidebar.innerHTML = h`
    <div class="brand">
      <img src="logo.png" alt="BHAVANISHREE TAILORING SHOP" />
      <span>BHAVANISHREE<br/>TAILORING SHOP</span>
    </div>` + NAV_ITEMS.map((it) => h`
    <button data-key="${it.key}" data-path="${it.path}">
      <span class="nav-icon">${it.icon}</span><span>${esc(it.label)}</span>
    </button>`).join('');
  $sidebar.querySelectorAll('button').forEach((btn) => {
    btn.onclick = () => navigate(btn.dataset.path);
  });
}

function updateNavHighlight() {
  const sect = currentSection();
  document.querySelectorAll('.bottom-nav button, .sidebar button').forEach((b) => {
    b.classList.toggle('active', b.dataset.key === sect);
  });
}

// ==================================================
// முகப்பு (Home)
// ==================================================

async function renderHome() {
  setTopbar({ title: '' });
  document.getElementById('topbar').style.display = 'none';

  const [pinned, recent] = await Promise.all([
    DB.Customers.pinnedList(),
    DB.Customers.recentList(10)
  ]);

  $view.innerHTML = h`
    <div class="home-hero">
      <img class="logo" src="logo.png" alt="BHAVANISHREE TAILORING SHOP" />
      <div class="shop-name">BHAVANISHREE TAILORING SHOP</div>
      <div class="tagline">Stitched with care, style &amp; perfection</div>
    </div>

    <div class="search-field" id="home-search">
      <span class="icon">🔍</span>
      <input type="text" placeholder="வாடிக்கையாளர் பெயரைத் தேடுக..." id="home-search-input" />
    </div>

    <div id="home-search-results"></div>

    <div id="home-default-content">
      <button class="btn btn-primary fab-add" id="btn-new-customer">+ புதிய வாடிக்கையாளர்</button>

      <div class="section-title">📌 முக்கிய வாடிக்கையாளர்கள்</div>
      <div id="pinned-wrap"></div>

      <div class="section-title">🕓 சமீபத்திய வாடிக்கையாளர்கள்</div>
      <div id="recent-wrap"></div>
    </div>
  `;

  document.getElementById('btn-new-customer').onclick = () => navigate('/customers/new');

  const pinnedWrap = document.getElementById('pinned-wrap');
  if (pinned.length === 0) {
    pinnedWrap.innerHTML = `<div class="empty-state" style="padding:24px 10px;"><div class="emoji">📌</div><div class="msg">இன்னும் முக்கிய வாடிக்கையாளர் இல்லை</div><div class="sub">வாடிக்கையாளர் விவரத்தில் பின் செய்யவும்.</div></div>`;
  } else {
    pinnedWrap.innerHTML = `<div class="pinned-scroll">${pinned.map(customerCardHtml).join('')}</div>`;
    bindCustomerCards(pinnedWrap);
  }

  const recentWrap = document.getElementById('recent-wrap');
  if (recent.length === 0) {
    recentWrap.innerHTML = `<div class="empty-state"><div class="emoji">🧵</div><div class="msg">இன்னும் வாடிக்கையாளர்கள் இல்லை</div><div class="sub">புதிய வாடிக்கையாளரைச் சேர்க்க மேலே உள்ள பொத்தானை அழுத்தவும்.</div></div>`;
  } else {
    recentWrap.innerHTML = recent.map(customerCardHtml).join('');
    bindCustomerCards(recentWrap);
  }

  const input = document.getElementById('home-search-input');
  const resultsWrap = document.getElementById('home-search-results');
  const defaultContent = document.getElementById('home-default-content');
  let searchTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const q = input.value.trim();
      if (!q) {
        resultsWrap.innerHTML = '';
        defaultContent.style.display = '';
        return;
      }
      defaultContent.style.display = 'none';
      const results = await DB.Customers.search(q);
      if (results.length === 0) {
        resultsWrap.innerHTML = `<div class="empty-state"><div class="emoji">🔍</div><div class="msg">பொருந்தும் வாடிக்கையாளர் இல்லை</div><div class="sub">வேறு பெயர் அல்லது எண்ணைத் தேடிப் பாருங்கள்.</div></div>`;
        return;
      }
      resultsWrap.innerHTML = results.map(customerCardHtml).join('');
      bindCustomerCards(resultsWrap);
    }, 180);
  });
}

function customerCardHtml(c) {
  return h`
    <div class="customer-card" data-id="${c.id}">
      <div class="customer-avatar">${esc(initials(c.name))}</div>
      <div class="customer-info">
        <div class="c-name">${esc(c.name || 'பெயர் இல்லை')}</div>
        <div class="c-meta">
          <span class="badge">${esc(modelLabel(c.model))}</span>
          ${c.phone ? `<span>${esc(c.phone)}</span>` : ''}
        </div>
      </div>
      <button class="pin-btn ${c.pinned ? 'pinned' : ''}" data-pin="${c.id}" title="பின் செய்">${c.pinned ? '★' : '☆'}</button>
    </div>`;
}

function bindCustomerCards(root) {
  root.querySelectorAll('.customer-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.pin-btn')) return;
      navigate('/customers/' + card.dataset.id);
    });
  });
  root.querySelectorAll('.pin-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.pin;
      const customer = await DB.Customers.get(id);
      await DB.Customers.setPinned(id, !customer.pinned);
      toast(!customer.pinned ? 'முக்கிய வாடிக்கையாளராக சேர்க்கப்பட்டது' : 'முக்கியப் பட்டியலிலிருந்து நீக்கப்பட்டது');
      router();
    });
  });
}

// ==================================================
// வாடிக்கையாளர்கள் (Customer List)
// ==================================================

async function renderCustomerList() {
  document.getElementById('topbar').style.display = 'flex';
  setTopbar({ title: 'வாடிக்கையாளர்கள்' });

  $view.innerHTML = h`
    <div class="search-field" id="list-search">
      <span class="icon">🔍</span>
      <input type="text" placeholder="வாடிக்கையாளர் பெயரைத் தேடுக..." id="list-search-input" />
    </div>
    <button class="btn btn-primary fab-add" id="btn-new-customer-2">+ புதிய வாடிக்கையாளர்</button>
    <div id="list-wrap"></div>
  `;

  document.getElementById('btn-new-customer-2').onclick = () => navigate('/customers/new');

  const wrap = document.getElementById('list-wrap');
  async function refresh(q) {
    const list = q ? await DB.Customers.search(q) : await DB.Customers.getAll();
    list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ta'));
    if (list.length === 0) {
      wrap.innerHTML = q
        ? `<div class="empty-state"><div class="emoji">🔍</div><div class="msg">பொருந்தும் வாடிக்கையாளர் இல்லை</div><div class="sub">வேறு பெயர் அல்லது எண்ணைத் தேடிப் பாருங்கள்.</div></div>`
        : `<div class="empty-state"><div class="emoji">🧵</div><div class="msg">இன்னும் வாடிக்கையாளர்கள் இல்லை</div><div class="sub">+ புதிய வாடிக்கையாளர் என்பதை அழுத்தி சேர்க்கவும்.</div></div>`;
      return;
    }
    wrap.innerHTML = list.map(customerCardHtml).join('');
    bindCustomerCards(wrap);
  }
  await refresh('');

  let t = null;
  document.getElementById('list-search-input').addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value.trim();
    t = setTimeout(() => refresh(v), 180);
  });
}

// ==================================================
// உடல் அளவு (Body Measurements tab)
// Standalone pattern-sheet tool — its own database, no link to Customers.
// ==================================================

function patternCardHtml(p) {
  return h`
    <div class="customer-card" data-id="${p.id}">
      <div class="customer-avatar">📏</div>
      <div class="customer-info">
        <div class="c-name">${esc(p.label || 'பெயர் இல்லாத பேட்டர்ன்')}</div>
        <div class="c-meta"><span>${formatDate(p.createdAt)}</span></div>
      </div>
      <div style="color:var(--ink-faint); font-size:20px;">›</div>
    </div>`;
}

async function renderPatternList() {
  document.getElementById('topbar').style.display = 'flex';
  setTopbar({ title: 'உடல் அளவு' });

  const all = await DB.Patterns.getAll();

  $view.innerHTML = h`
    <div class="card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div>
        <div class="muted" style="font-size:12.5px; font-weight:700;">மொத்த பேட்டர்ன்கள்</div>
        <div style="font-size:26px; font-weight:800; color:var(--maroon-deep); margin-top:2px;" id="bm-total-count">${all.length}</div>
      </div>
      <div style="font-size:34px;">📏</div>
    </div>

    <button class="btn btn-primary fab-add" id="btn-bm-new">+ புதிய அளவு / பேட்டர்ன்</button>

    <div class="search-field" id="bm-search" style="margin-bottom:14px;">
      <span class="icon">🔍</span>
      <input type="text" placeholder="குறிப்பு மூலம் தேடுக..." id="bm-search-input" />
    </div>

    <div class="section-title mt-0">🧾 சேமிக்கப்பட்ட பேட்டர்ன்கள்</div>
    <div id="bm-list-wrap"></div>
  `;

  document.getElementById('btn-bm-new').onclick = () => navigate('/measurements/new');

  const wrap = document.getElementById('bm-list-wrap');
  async function refresh(q) {
    const list = q ? await DB.Patterns.search(q) : all;
    document.getElementById('bm-total-count').textContent = q ? `${list.length} / ${all.length}` : all.length;
    if (list.length === 0) {
      wrap.innerHTML = q
        ? `<div class="empty-state"><div class="emoji">🔍</div><div class="msg">பொருந்தும் பேட்டர்ன் இல்லை</div><div class="sub">வேறு குறிப்பைத் தேடிப் பாருங்கள்.</div></div>`
        : `<div class="empty-state"><div class="emoji">📏</div><div class="msg">இன்னும் பேட்டர்ன் இல்லை</div><div class="sub">+ புதிய அளவு / பேட்டர்ன் என்பதை அழுத்தி தொடங்கவும்.</div></div>`;
      return;
    }
    wrap.innerHTML = list.map(patternCardHtml).join('');
    wrap.querySelectorAll('.customer-card').forEach((card) => {
      card.addEventListener('click', () => navigate('/measurements/' + card.dataset.id));
    });
  }
  await refresh('');

  let t = null;
  document.getElementById('bm-search-input').addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value.trim();
    t = setTimeout(() => refresh(v), 180);
  });
}

// ---------------- புதிய அளவு / திருத்து (Pattern Form) ----------------

async function renderPatternForm(patternId) {
  document.getElementById('topbar').style.display = 'flex';
  const isEdit = !!patternId;
  setTopbar({ title: isEdit ? 'பேட்டர்னைத் திருத்து' : 'புதிய உடல் அளவு', showBack: true });

  let record = null;
  if (isEdit) {
    record = await DB.Patterns.get(patternId);
    if (!record) { navigate('/measurements'); return; }
  }
  const existing = (record && record.fields) ? record.fields : {};

  $view.innerHTML = h`
    <form id="pattern-form" novalidate>
      <div class="field">
        <label for="pf-label">குறிப்பு / பெயர் (விருப்பம்)</label>
        <input type="text" id="pf-label" placeholder="எ.கா. கீதா அக்கா, 12/08 ஆர்டர்" value="${esc(record ? record.label : '')}" />
      </div>

      <div class="section-title mt-0">✂️ பிளவுஸ் அளவு விவரங்கள் (இன்ச் அளவில்)</div>
      <div class="grid-2">
        ${BODY_PATTERN_FIELDS.map((f) => h`
          <div class="field">
            <label for="pf-${f.key}">${esc(f.label)} *</label>
            <div class="hint" style="margin-top:-4px; margin-bottom:7px;">${esc(f.hint)}</div>
            <div class="unit-input">
              <input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="pf-${f.key}" placeholder="${esc(f.placeholder)}" value="${esc(existing[f.key] != null ? existing[f.key] : '')}" />
              <span class="unit-tag">அங்குலம்</span>
            </div>
            <div class="error-msg" data-err="pf-${f.key}" hidden>சரியான எண்ணை உள்ளிடவும்.</div>
          </div>`).join('')}
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">பேட்டர்ன் உருவாக்கி சேமி</button>
      </div>
    </form>
  `;

  document.getElementById('pattern-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.error-msg').forEach((el) => { el.hidden = true; });
    document.querySelectorAll('input').forEach((el) => el.classList.remove('error'));

    const label = document.getElementById('pf-label').value.trim();
    const fields = {};
    let valid = true;

    BODY_PATTERN_FIELDS.forEach((f) => {
      const input = document.getElementById('pf-' + f.key);
      const v = input.value.trim();
      if (!v) {
        valid = false;
        input.classList.add('error');
        document.querySelector(`[data-err="pf-${f.key}"]`).hidden = false;
        document.querySelector(`[data-err="pf-${f.key}"]`).textContent = 'இந்த அளவை உள்ளிடவும்.';
      } else if (!isValidNumber(v)) {
        valid = false;
        input.classList.add('error');
        document.querySelector(`[data-err="pf-${f.key}"]`).hidden = false;
        document.querySelector(`[data-err="pf-${f.key}"]`).textContent = 'சரியான எண்ணை (தசம மதிப்பு) உள்ளிடவும்.';
      } else {
        fields[f.key] = v; // keep as typed (may be a plain number or a hyphenated range)
      }
    });

    if (!valid) {
      document.querySelector('.error-msg:not([hidden])')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      let saved;
      if (isEdit) {
        saved = await DB.Patterns.update(patternId, label, fields);
        toast('பேட்டர்ன் புதுப்பிக்கப்பட்டது');
      } else {
        saved = await DB.Patterns.add(label, fields);
        toast('பேட்டர்ன் சேமிக்கப்பட்டது');
      }
      // replace: true so this pattern's "new/edit" form doesn't linger in
      // history — pressing back from the detail page goes to the பேட்டர்ன் list.
      navigate('/measurements/' + saved.id, { replace: true });
    } catch (err) {
      console.error(err);
      toast('சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
    }
  });
}

// ---------------- பேட்டர்ன் விவரம் (Pattern Detail) ----------------

async function renderPatternDetail(patternId) {
  document.getElementById('topbar').style.display = 'flex';
  setTopbar({ title: 'பேட்டர்ன் விவரம்', showBack: true });

  const record = await DB.Patterns.get(patternId);
  if (!record) {
    $view.innerHTML = `<div class="empty-state"><div class="emoji">🚫</div><div class="msg">பேட்டர்ன் கிடைக்கவில்லை</div></div>`;
    return;
  }
  const recFields = record.fields || {};

  $view.innerHTML = h`
    <div class="profile-header">
      <div class="customer-avatar">📏</div>
      <div>
        <div class="p-name">${esc(record.label || 'பெயர் இல்லாத பேட்டர்ன்')}</div>
        <div class="p-phone">${formatDate(record.createdAt)}</div>
      </div>
    </div>

    <div class="action-row">
      <button class="btn btn-primary" id="btn-pf-edit">✏️ திருத்து</button>
    </div>

    <div class="section-title">📏 உள்ளிட்ட அளவுகள்</div>
    <div class="measure-grid">
      ${BODY_PATTERN_FIELDS.map((f) => h`
        <div class="measure-item">
          <div class="m-label">${esc(f.label)} <span class="muted">(${esc(f.hint)})</span></div>
          <div class="m-value">${fmtVal(recFields[f.key])}</div>
        </div>`).join('')}
    </div>

    <div class="section-title">✂️ பேட்டர்ன் ஷீட்</div>
    ${buildStandalonePatternSheet(recFields)}

    <div style="margin-top:34px;">
      <button class="btn btn-danger" id="btn-pf-delete">🗑️ பேட்டர்னை நீக்கு</button>
    </div>
  `;

  document.getElementById('btn-pf-edit').onclick = () => navigate(`/measurements/${record.id}/edit`);
  document.getElementById('btn-pf-delete').onclick = async () => {
    const ok = await confirmDialog({
      title: 'பேட்டர்னை நீக்கவா?',
      text: `"${record.label || 'இந்த பேட்டர்ன்'}" மறைக்கப்படும். இதை அமைப்புகள் வழியாக மீட்டெடுக்க முடியும்.`,
      confirmLabel: 'நீக்கு',
      danger: true
    });
    if (!ok) return;
    await DB.Patterns.softDelete(record.id);
    toast('பேட்டர்ன் நீக்கப்பட்டது');
    navigate('/measurements');
  };
}

// ==================================================
// புதிய வாடிக்கையாளர் / திருத்து (Add / Edit Customer)
// ==================================================

async function renderCustomerForm(customerId) {
  document.getElementById('topbar').style.display = 'flex';
  const isEdit = !!customerId;
  setTopbar({ title: isEdit ? 'வாடிக்கையாளரைத் திருத்து' : 'புதிய வாடிக்கையாளர்', showBack: true });

  let customer = null;
  let latestMeasurement = null;
  if (isEdit) {
    customer = await DB.Customers.get(customerId);
    if (!customer) { navigate('/customers'); return; }
    latestMeasurement = await DB.Measurements.getLatest(customerId);
  }

  const selectedModel = customer ? customer.model : null;
  const selectedCutting = customer ? (customer.cuttingType || null) : null;

  $view.innerHTML = h`
    <form id="customer-form" novalidate>
      <div class="field">
        <label for="f-name">பெயர் *</label>
        <input type="text" autocomplete="off" autocorrect="off" spellcheck="false" id="f-name" name="name" value="${esc(customer ? customer.name : '')}" placeholder="வாடிக்கையாளர் பெயர்" />
        <div class="error-msg" data-err="name" hidden>பெயரை உள்ளிடவும்.</div>
      </div>
      <div class="field">
        <label for="f-phone">தொலைபேசி எண் (விருப்பம்)</label>
        <input type="tel" autocomplete="off" id="f-phone" name="phone" value="${esc(customer ? customer.phone : '')}" placeholder="10 இலக்க எண் (விருப்பம்)" />
        <div class="error-msg" data-err="phone" hidden>சரியான தொலைபேசி எண்ணை உள்ளிடவும்.</div>
      </div>

      <div class="field">
        <label>மாடல் *</label>
        <div class="model-choice" id="model-choice">
          <div class="choice-card ${selectedModel === 'blouse' ? 'selected' : ''}" data-model="blouse">
            <span class="icon">👚</span>பிளவுஸ்
          </div>
          <div class="choice-card ${selectedModel === 'chudithar' ? 'selected' : ''}" data-model="chudithar">
            <span class="icon">👗</span>சுடிதார்
          </div>
        </div>
        <div class="error-msg" data-err="model" hidden>மாடலைத் தேர்வு செய்யவும்.</div>
      </div>

      <div class="field" id="cutting-type-field" style="display:none;">
        <label>கட்டிங் வகை (பிளவுஸ்)</label>
        <div class="model-choice" id="cutting-choice">
          <div class="choice-card ${selectedCutting === 'neer' ? 'selected' : ''}" data-cutting="neer">
            <span class="icon">✂️</span>நேர் கட்டிங்
          </div>
          <div class="choice-card ${selectedCutting === 'cross' ? 'selected' : ''}" data-cutting="cross">
            <span class="icon">✂️</span>குறுக்கு கட்டிங்
          </div>
        </div>
      </div>

      <div id="measurement-fields"></div>

      <div class="field">
        <label for="f-notes">குறிப்புகள்</label>
        <textarea id="f-notes" name="notes" placeholder="கூடுதல் குறிப்புகள் (விருப்பம்)">${esc(customer ? customer.notes : '')}</textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">சேமிக்க</button>
      </div>
    </form>
  `;

  let currentModel = selectedModel;
  let currentCutting = selectedCutting;

  function updateCuttingVisibility() {
    const wrap = document.getElementById('cutting-type-field');
    wrap.style.display = currentModel === 'blouse' ? '' : 'none';
  }

  function currentFieldValues() {
    const fields = currentModel ? fieldsForModel(currentModel) : [];
    const vals = {};
    fields.forEach((f) => {
      const input = document.getElementById('mf-' + f.key);
      if (!input) return;
      const v = input.value.trim();
      if (v && isValidNumber(v)) vals[f.key] = v; // keep as typed (may be a plain number or a hyphenated range)
    });
    return vals;
  }

  function renderMeasureFields() {
    const wrap = document.getElementById('measurement-fields');
    if (!currentModel) { wrap.innerHTML = ''; return; }
    const fields = fieldsForModel(currentModel);
    const existing = (latestMeasurement && latestMeasurement.model === currentModel) ? latestMeasurement.fields : {};
    wrap.innerHTML = `<div class="section-title">📏 அளவுகள் (${esc(modelLabel(currentModel))})</div><div class="grid-2">` +
      fields.map((f) => h`
        <div class="field">
          <label for="mf-${f.key}">${esc(f.label)}${f.required ? ' *' : ''}</label>
          ${f.hint ? `<div class="hint" style="margin-top:-4px; margin-bottom:7px;">${esc(f.hint)}</div>` : ''}
          <div class="unit-input">
            <input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="mf-${f.key}" name="${f.key}" value="${esc(existing[f.key] != null ? existing[f.key] : '')}" placeholder="0.0" />
            <span class="unit-tag">அங்குலம்</span>
          </div>
          <div class="error-msg" data-err="mf-${f.key}" hidden>சரியான எண்ணை உள்ளிடவும்.</div>
        </div>`).join('') + `</div>`;
  }
  renderMeasureFields();
  updateCuttingVisibility();

  document.querySelectorAll('#model-choice .choice-card').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#model-choice .choice-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      currentModel = card.dataset.model;
      renderMeasureFields();
      updateCuttingVisibility();
    });
  });

  document.querySelectorAll('#cutting-choice .choice-card').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#cutting-choice .choice-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      currentCutting = card.dataset.cutting;
    });
  });

  document.getElementById('customer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.error-msg').forEach((el) => { el.hidden = true; });
    document.querySelectorAll('input, select').forEach((el) => el.classList.remove('error'));

    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const notes = document.getElementById('f-notes').value;
    let valid = true;

    if (!name) {
      valid = false;
      document.getElementById('f-name').classList.add('error');
      document.querySelector('[data-err="name"]').hidden = false;
    }
    if (phone && !/^[0-9+\-\s]{7,15}$/.test(phone)) {
      valid = false;
      document.getElementById('f-phone').classList.add('error');
      document.querySelector('[data-err="phone"]').hidden = false;
    }
    if (!currentModel) {
      valid = false;
      document.querySelector('[data-err="model"]').hidden = false;
    }

    const fields = currentModel ? fieldsForModel(currentModel) : [];
    const measurementValues = {};
    fields.forEach((f) => {
      const input = document.getElementById('mf-' + f.key);
      const v = input.value.trim();
      if (f.required && !v) {
        valid = false;
        input.classList.add('error');
        document.querySelector(`[data-err="mf-${f.key}"]`).hidden = false;
        document.querySelector(`[data-err="mf-${f.key}"]`).textContent = 'இந்த அளவை உள்ளிடவும்.';
      } else if (v && !isValidNumber(v)) {
        valid = false;
        input.classList.add('error');
        document.querySelector(`[data-err="mf-${f.key}"]`).hidden = false;
        document.querySelector(`[data-err="mf-${f.key}"]`).textContent = 'சரியான எண்ணை (தசம மதிப்பு) உள்ளிடவும்.';
      } else if (v) {
        measurementValues[f.key] = v; // keep as typed (may be a plain number or a hyphenated range)
      }
    });

    if (!valid) return;

    const cuttingType = currentModel === 'blouse' ? (currentCutting || null) : null;

    try {
      let savedCustomer;
      if (isEdit) {
        savedCustomer = await DB.Customers.update(customerId, { name, phone, model: currentModel, cuttingType, notes });
      } else {
        savedCustomer = await DB.Customers.add({ name, phone, model: currentModel, cuttingType, notes });
      }

      const hasAnyMeasurement = Object.keys(measurementValues).length > 0;
      const changed = !latestMeasurement || latestMeasurement.model !== currentModel || !measurementsEqual(latestMeasurement.fields, measurementValues);
      if (hasAnyMeasurement && changed) {
        await DB.Measurements.add(savedCustomer.id, currentModel, measurementValues);
      }

      toast(isEdit ? 'வாடிக்கையாளர் தகவல் புதுப்பிக்கப்பட்டது' : 'வாடிக்கையாளர் சேமிக்கப்பட்டார்');
      // replace: true so this "new/edit customer" form doesn't linger in
      // history — pressing back from the profile goes to the customer list.
      navigate('/customers/' + savedCustomer.id, { replace: true });
    } catch (err) {
      console.error(err);
      toast('சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
    }
  });
}

// ==================================================
// வாடிக்கையாளர் விவரம் (Customer Profile)
// ==================================================

async function renderCustomerProfile(customerId) {
  document.getElementById('topbar').style.display = 'flex';

  const customer = await DB.Customers.get(customerId);
  if (!customer || customer.deleted) {
    setTopbar({ title: 'வாடிக்கையாளர் விவரம்', showBack: true });
    $view.innerHTML = `<div class="empty-state"><div class="emoji">🚫</div><div class="msg">வாடிக்கையாளர் கிடைக்கவில்லை</div></div>`;
    return;
  }

  const pinBtn = document.createElement('button');
  pinBtn.className = 'topbar-icon-btn';
  pinBtn.innerHTML = customer.pinned ? '★' : '☆';
  pinBtn.title = 'பின் செய்';
  pinBtn.onclick = async () => {
    await DB.Customers.setPinned(customer.id, !customer.pinned);
    toast(!customer.pinned ? 'முக்கிய வாடிக்கையாளராக சேர்க்கப்பட்டது' : 'முக்கியப் பட்டியலிலிருந்து நீக்கப்பட்டது');
    renderCustomerProfile(customerId);
  };
  setTopbar({ title: 'வாடிக்கையாளர் விவரம்', showBack: true, action: pinBtn });

  const history = await DB.Measurements.getByCustomer(customerId);
  const latest = history[0] || null;

  $view.innerHTML = h`
    <div class="profile-header">
      <div class="customer-avatar">${esc(initials(customer.name))}</div>
      <div>
        <div class="p-name">${esc(customer.name)}</div>
        <div class="p-phone">${customer.phone ? esc(customer.phone) : 'தொலைபேசி எண் இல்லை'}</div>
        <div style="margin-top:6px;">
          <span class="chip">${esc(modelLabel(customer.model))}</span>
          ${customer.model === 'blouse' && customer.cuttingType ? `<span class="chip">${esc(cuttingTypeLabel(customer.cuttingType))}</span>` : ''}
        </div>
      </div>
    </div>

    <div class="action-row">
      <button class="btn btn-primary" id="btn-edit">✏️ திருத்து</button>
    </div>

    <div class="section-title">📏 தற்போதைய அளவுகள்</div>
    <div id="current-measure"></div>

    ${customer.model === 'blouse' ? h`
      <div class="section-title">📐 ஆர்ம்ஹோல் வரைபடம் (Armhole Diagram)</div>
      <div id="armhole-diagram-wrap"></div>
    ` : ''}

    <div class="section-title">🕘 அளவு வரலாறு</div>
    <div id="history-wrap"></div>

    <div class="section-title">📝 குறிப்புகள்</div>
    <div class="notes-box">${customer.notes ? esc(customer.notes) : 'குறிப்புகள் இல்லை.'}</div>

    <div style="margin-top:34px;">
      <button class="btn btn-danger" id="btn-delete">🗑️ வாடிக்கையாளரை நீக்கு</button>
    </div>
  `;

  document.getElementById('btn-edit').onclick = () => navigate(`/customers/${customer.id}/edit`);

  const measureWrap = document.getElementById('current-measure');
  if (!latest) {
    measureWrap.innerHTML = `<div class="empty-state"><div class="emoji">📏</div><div class="msg">அளவுகள் இன்னும் சேமிக்கப்படவில்லை</div><div class="sub">திருத்து என்பதை அழுத்தி அளவுகளைச் சேர்க்கவும்.</div></div>`;
  } else {
    const fields = fieldsForModel(latest.model);
    measureWrap.innerHTML = `<div class="measure-grid">` + fields.map((f) => h`
      <div class="measure-item">
        <div class="m-label">${esc(f.label)}</div>
        <div class="m-value">${latest.fields[f.key] != null ? esc(latest.fields[f.key]) + '″' : '—'}</div>
      </div>`).join('') + `</div>`;
  }

  if (customer.model === 'blouse') {
    const armholeWrap = document.getElementById('armhole-diagram-wrap');
    if (!latest) {
      armholeWrap.innerHTML = `<div class="empty-state" style="padding:22px 10px;"><div class="sub">Box Line Height மற்றும் கைச்சுற்றளவு அளவுகளைச் சேர்த்தால் வரைபடம் இங்கே தோன்றும்.</div></div>`;
    } else {
      armholeWrap.innerHTML = buildArmholeBoxDiagramCard(latest.fields.armholeDepth, latest.fields.kaiSuttalavu);
    }
  }

  const historyWrap = document.getElementById('history-wrap');
  if (history.length <= 1) {
    historyWrap.innerHTML = `<div class="empty-state" style="padding:22px 10px;"><div class="sub">முந்தைய அளவு பதிவுகள் இல்லை.</div></div>`;
  } else {
    historyWrap.innerHTML = history.map((rec, idx) => h`
      <div class="history-item" data-mid="${rec.id}">
        <div class="h-date">${formatDate(rec.createdAt)} ${idx === 0 ? '· தற்போதையது' : ''}</div>
        <div class="h-sub">${esc(modelLabel(rec.model))} அளவுகள்</div>
      </div>`).join('');
    historyWrap.querySelectorAll('.history-item').forEach((item) => {
      item.addEventListener('click', () => showMeasurementDetail(history.find((r) => r.id === item.dataset.mid)));
    });
  }

  document.getElementById('btn-delete').onclick = async () => {
    const ok = await confirmDialog({
      title: 'வாடிக்கையாளரை நீக்கவா?',
      text: `${customer.name} இன் அனைத்து தகவல்களும் மறைக்கப்படும். இதை அமைப்புகள் வழியாக மீட்டெடுக்க முடியும்.`,
      confirmLabel: 'நீக்கு',
      danger: true
    });
    if (!ok) return;
    await DB.Customers.softDelete(customer.id);
    toast('வாடிக்கையாளர் நீக்கப்பட்டார்');
    navigate('/customers');
  };
}

function showMeasurementDetail(rec) {
  if (!rec) return;
  const fields = fieldsForModel(rec.model);
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = h`
    <div class="modal-box">
      <h3>${formatDate(rec.createdAt)} அளவுகள்</h3>
      <div class="measure-grid" style="margin-bottom:18px;">
        ${fields.map((f) => h`
          <div class="measure-item">
            <div class="m-label">${esc(f.label)}</div>
            <div class="m-value">${rec.fields[f.key] != null ? esc(rec.fields[f.key]) + '″' : '—'}</div>
          </div>`).join('')}
      </div>
      <div class="modal-actions"><button class="btn btn-primary" data-act="close">மூடு</button></div>
    </div>`;
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  backdrop.querySelector('[data-act="close"]').onclick = () => backdrop.remove();
  $modalLayer.appendChild(backdrop);
}

// ==================================================
// அமைப்புகள் (Settings)
// ==================================================

async function renderSettings() {
  document.getElementById('topbar').style.display = 'flex';
  setTopbar({ title: 'அமைப்புகள்' });

  $view.innerHTML = h`
    <div class="section-title mt-0">கடை தகவல்</div>
    <div class="card shop-card">
      <img src="logo.png" alt="BHAVANISHREE TAILORING SHOP" />
      <div>
        <div class="name">BHAVANISHREE TAILORING SHOP</div>
        <div class="sub">Stitched with care, style &amp; perfection</div>
      </div>
    </div>

    <div class="section-title">தரவு பாதுகாப்பு</div>
    <div class="card" style="padding:6px 12px;">
      <div class="settings-row" id="row-backup">
        <div class="s-icon">⬆️</div>
        <div class="s-text"><div class="s-title">காப்புப்பிரதி எடுக்க</div><div class="s-sub">தரவை ஏற்றுமதி செய்</div></div>
        <div class="chevron">›</div>
      </div>
      <div class="settings-row" id="row-restore">
        <div class="s-icon">⬇️</div>
        <div class="s-text"><div class="s-title">காப்புப்பிரதியை மீட்டமை</div><div class="s-sub">தரவை இறக்குமதி செய்</div></div>
        <div class="chevron">›</div>
      </div>
      <div class="settings-row" id="row-deleted">
        <div class="s-icon">🗑️</div>
        <div class="s-text"><div class="s-title">நீக்கப்பட்ட வாடிக்கையாளர்கள்</div><div class="s-sub">மீட்டெடுக்க அல்லது நிரந்தரமாக நீக்க</div></div>
        <div class="chevron">›</div>
      </div>
      <div class="settings-row" id="row-deleted-patterns">
        <div class="s-icon">🗑️</div>
        <div class="s-text"><div class="s-title">நீக்கப்பட்ட பேட்டர்ன்கள்</div><div class="s-sub">மீட்டெடுக்க அல்லது நிரந்தரமாக நீக்க</div></div>
        <div class="chevron">›</div>
      </div>
    </div>

    <div class="section-title">பயன்பாட்டு தகவல்</div>
    <div class="card">
      <div style="font-weight:700; margin-bottom:4px;">BHAVANISHREE TAILORING SHOP</div>
      <div class="muted" style="font-size:13px;">அனைத்து தரவும் இந்த சாதனத்தில் மட்டுமே சேமிக்கப்படுகிறது. இணையம் இல்லாமலும் பயன்படுத்தலாம்.</div>
    </div>
  `;

  document.getElementById('row-backup').onclick = () => navigate('/settings/backup');
  document.getElementById('row-restore').onclick = () => navigate('/settings/restore');
  document.getElementById('row-deleted').onclick = () => renderDeletedCustomers();
  document.getElementById('row-deleted-patterns').onclick = () => renderDeletedPatterns();
}

async function renderDeletedCustomers() {
  const all = await DB.Customers.getAll({ includeDeleted: true });
  const deleted = all.filter((c) => c.deleted);
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = h`
    <div class="modal-box">
      <h3>நீக்கப்பட்ட வாடிக்கையாளர்கள்</h3>
      ${deleted.length === 0
        ? `<p>நீக்கப்பட்ட வாடிக்கையாளர்கள் இல்லை.</p>`
        : `<div class="stack" style="max-height:50vh; overflow:auto; margin-bottom:16px;">` + deleted.map((c) => h`
            <div class="customer-card" style="cursor:default; margin-bottom:0;">
              <div class="customer-avatar">${esc(initials(c.name))}</div>
              <div class="customer-info">
                <div class="c-name">${esc(c.name)}</div>
                <div class="c-meta"><span>${esc(c.phone || '')}</span></div>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm btn-outline" data-restore="${c.id}">மீட்டெடு</button>
                <button class="btn btn-sm btn-danger" data-harddelete="${c.id}">நீக்கு</button>
              </div>
            </div>`).join('') + `</div>`}
      <div class="modal-actions"><button class="btn btn-ghost" data-act="close">மூடு</button></div>
    </div>`;
  backdrop.querySelector('[data-act="close"]').onclick = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  backdrop.querySelectorAll('[data-restore]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await DB.Customers.restore(btn.dataset.restore);
      toast('வாடிக்கையாளர் மீட்டெடுக்கப்பட்டார்');
      backdrop.remove();
      renderDeletedCustomers();
    });
  });
  backdrop.querySelectorAll('[data-harddelete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.harddelete;
      const customer = deleted.find((c) => c.id === id);
      const ok = await confirmDialog({
        title: 'நிரந்தரமாக நீக்கவா?',
        text: `"${customer ? customer.name : 'இந்த வாடிக்கையாளர்'}" இன் தகவல்கள் நிரந்தரமாக நீக்கப்படும். இதை மீட்டெடுக்க முடியாது.`,
        confirmLabel: 'நீக்கு',
        danger: true
      });
      if (!ok) return;
      await DB.Customers.hardDelete(id);
      toast('வாடிக்கையாளர் நிரந்தரமாக நீக்கப்பட்டார்');
      backdrop.remove();
      renderDeletedCustomers();
    });
  });
  $modalLayer.appendChild(backdrop);
}

async function renderDeletedPatterns() {
  const all = await DB.Patterns.getAll({ includeDeleted: true });
  const deleted = all.filter((p) => p.deleted);
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = h`
    <div class="modal-box">
      <h3>நீக்கப்பட்ட பேட்டர்ன்கள்</h3>
      ${deleted.length === 0
        ? `<p>நீக்கப்பட்ட பேட்டர்ன்கள் இல்லை.</p>`
        : `<div class="stack" style="max-height:50vh; overflow:auto; margin-bottom:16px;">` + deleted.map((p) => h`
            <div class="customer-card" style="cursor:default; margin-bottom:0;">
              <div class="customer-avatar">📏</div>
              <div class="customer-info">
                <div class="c-name">${esc(p.label || 'பெயர் இல்லாத பேட்டர்ன்')}</div>
                <div class="c-meta"><span>${formatDate(p.createdAt)}</span></div>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm btn-outline" data-restore="${p.id}">மீட்டெடு</button>
                <button class="btn btn-sm btn-danger" data-harddelete="${p.id}">நீக்கு</button>
              </div>
            </div>`).join('') + `</div>`}
      <div class="modal-actions"><button class="btn btn-ghost" data-act="close">மூடு</button></div>
    </div>`;
  backdrop.querySelector('[data-act="close"]').onclick = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  backdrop.querySelectorAll('[data-restore]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await DB.Patterns.restore(btn.dataset.restore);
      toast('பேட்டர்ன் மீட்டெடுக்கப்பட்டது');
      backdrop.remove();
      renderDeletedPatterns();
    });
  });
  backdrop.querySelectorAll('[data-harddelete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.harddelete;
      const pattern = deleted.find((p) => p.id === id);
      const ok = await confirmDialog({
        title: 'நிரந்தரமாக நீக்கவா?',
        text: `"${pattern ? (pattern.label || 'இந்த பேட்டர்ன்') : 'இந்த பேட்டர்ன்'}" நிரந்தரமாக நீக்கப்படும். இதை மீட்டெடுக்க முடியாது.`,
        confirmLabel: 'நீக்கு',
        danger: true
      });
      if (!ok) return;
      await DB.Patterns.hardDelete(id);
      toast('பேட்டர்ன் நிரந்தரமாக நீக்கப்பட்டது');
      backdrop.remove();
      renderDeletedPatterns();
    });
  });
  $modalLayer.appendChild(backdrop);
}

async function renderBackupRestore(mode) {
  document.getElementById('topbar').style.display = 'flex';
  setTopbar({ title: mode === 'backup' ? 'காப்புப்பிரதி எடுக்க' : 'காப்புப்பிரதியை மீட்டமை', showBack: true });

  if (mode === 'backup') {
    const all = await DB.Customers.getAll({ includeDeleted: true });
    $view.innerHTML = h`
      <div class="card text-center" style="padding:30px 18px;">
        <div style="font-size:38px; margin-bottom:10px;">⬆️</div>
        <div style="font-weight:700; margin-bottom:6px;">தரவை ஏற்றுமதி செய்</div>
        <div class="muted" style="font-size:13.5px; margin-bottom:22px;">
          ${all.length} வாடிக்கையாளர் தகவல்கள் ஒரு கோப்பாக பதிவிறக்கம் செய்யப்படும்.<br/>
          இந்த கோப்பை பாதுகாப்பாக வைத்திருங்கள்.
        </div>
        <button class="btn btn-primary" id="btn-export">காப்புப்பிரதி கோப்பைப் பதிவிறக்கு</button>
      </div>
    `;
    document.getElementById('btn-export').onclick = async () => {
      try {
        const backup = await DB.Backup.exportAll();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `bhavanishree-backup-${stamp}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast('காப்புப்பிரதி பதிவிறக்கம் செய்யப்பட்டது');
      } catch (err) {
        console.error(err);
        toast('காப்புப்பிரதி எடுக்க முடியவில்லை.');
      }
    };
  } else {
    $view.innerHTML = h`
      <div class="card text-center" style="padding:30px 18px;">
        <div style="font-size:38px; margin-bottom:10px;">⬇️</div>
        <div style="font-weight:700; margin-bottom:6px;">தரவை இறக்குமதி செய்</div>
        <div class="muted" style="font-size:13.5px; margin-bottom:22px;">
          காப்புப்பிரதி கோப்பை (.json) தேர்ந்தெடுக்கவும். மீட்டமைக்கும் முன் உறுதிப்படுத்தல் கேட்கப்படும்.
        </div>
        <input type="file" accept="application/json" id="restore-file" style="display:none;" />
        <button class="btn btn-primary" id="btn-pick-file">கோப்பைத் தேர்ந்தெடு</button>
      </div>
    `;
    const fileInput = document.getElementById('restore-file');
    document.getElementById('btn-pick-file').onclick = () => fileInput.click();
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        const count = (payload.data && payload.data.customers && payload.data.customers.length) || 0;
        const ok = await confirmDialog({
          title: 'தரவை மீட்டமைக்கவா?',
          text: `இந்த கோப்பில் ${count} வாடிக்கையாளர் தகவல்கள் உள்ளன. மீட்டமைத்தால் தற்போதைய தரவு மாற்றப்படும். தொடர விரும்புகிறீர்களா?`,
          confirmLabel: 'மீட்டமை',
          danger: true
        });
        if (!ok) return;
        await DB.Backup.importAll(payload, { merge: false });
        toast('தரவு மீட்டமைக்கப்பட்டது');
        navigate('/home');
      } catch (err) {
        console.error(err);
        toast('கோப்பு சரியாக இல்லை. மீண்டும் முயற்சிக்கவும்.');
      }
    });
  }
}

// ==================================================
// Boot
// ==================================================

async function boot() {
  buildNav();
  await DB.openDb();
  router();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
}

boot();