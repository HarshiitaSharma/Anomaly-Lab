// UI, signal generation and drawing. Detection math lives in detectors.js.
const N = 240, $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function rng(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

let normals = [], inj = {}, x = [], res = null;

function newSignal(){
  const r = rng(Math.floor(Math.random()*1e9));
  normals = Array.from({length:N}, () => { let u = 0; for(let k=0;k<6;k++) u += r(); return (u-3)*1.41; });
  inj = {};
  for(let k=0;k<6;k++){ const i = 10 + Math.floor(r()*(N-20)); inj[i] = (r()<.5?-1:1) * (22 + r()*16); }
  update();
}
function build(){
  const noise = +$('noise').value;
  x = Array.from({length:N}, (_,i) => 50 + .05*i + 12*Math.sin(2*Math.PI*i/60) + noise*normals[i] + (inj[i]||0));
}
const truth = () => Object.keys(inj).map(Number);

function showStats(flagged){
  const e = Detectors.evaluate(flagged, truth()), pct = v => v===null ? '-' : Math.round(v*100)+'%';
  $('sFlag').textContent = flagged.length; $('sTrue').textContent = truth().length;
  $('sPrec').textContent = pct(e.precision); $('sRec').textContent = pct(e.recall); $('sF1').textContent = pct(e.f1);
}

const pad = {l:44, r:12, t:12, b:24};
let W = 0, H = 0, yMin = 0, yMax = 1;
const px = i => pad.l + i/(N-1)*(W-pad.l-pad.r);
const py = v => pad.t + (1-(v-yMin)/(yMax-yMin))*(H-pad.t-pad.b);

function draw(){
  const dpr = devicePixelRatio || 1, r = cv.getBoundingClientRect();
  W = r.width; H = r.height; cv.width = W*dpr; cv.height = H*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
  yMin = Math.min(...x) - 6; yMax = Math.max(...x) + 6;
  const muted = css('--muted'), line = css('--line'), acc = css('--accent'), bad = css('--bad'), good = css('--good');
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = muted; ctx.strokeStyle = line; ctx.lineWidth = 1;
  for(let k=0;k<=4;k++){ const v = yMin + (yMax-yMin)*k/4, y = py(v); ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke(); ctx.fillText(Math.round(v), 8, y+4); }
  [0,60,120,180,239].forEach(i => ctx.fillText(i, px(i)-8, H-6));
  ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t, W-pad.l-pad.r, H-pad.t-pad.b); ctx.clip();
  const idx = res.lo.map((v,i)=>v===null?-1:i).filter(i=>i>=0);
  if(idx.length){
    ctx.globalAlpha = .16; ctx.fillStyle = acc; ctx.beginPath();
    idx.forEach((i,k) => k ? ctx.lineTo(px(i),py(res.hi[i])) : ctx.moveTo(px(i),py(res.hi[i])));
    [...idx].reverse().forEach(i => ctx.lineTo(px(i),py(res.lo[i])));
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = acc; ctx.lineWidth = 1.8; ctx.beginPath();
  x.forEach((v,i) => i ? ctx.lineTo(px(i),py(v)) : ctx.moveTo(px(i),py(v))); ctx.stroke();
  ctx.restore();
  Object.keys(inj).forEach(k => { ctx.strokeStyle = good; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px(+k), py(x[k]), 9, 0, 7); ctx.stroke(); });
  ctx.fillStyle = bad; res.flagged.forEach(i => { ctx.beginPath(); ctx.arc(px(i), py(x[i]), 4, 0, 7); ctx.fill(); });
}

function update(){
  ['win','thr','noise'].forEach(id => $(id+'O').textContent = $(id).value);
  build(); res = Detectors.detect($('method').value, x, +$('win').value, +$('thr').value);
  showStats(res.flagged); draw();
}

['method','win','thr','noise'].forEach(id => $(id).addEventListener('input', update));
$('regen').onclick = newSignal;
cv.addEventListener('click', e => {
  const r = cv.getBoundingClientRect(), i = Math.round((e.clientX - r.left - pad.l)/(W-pad.l-pad.r)*(N-1));
  if(i < 0 || i >= N) return;
  if(inj[i] !== undefined) delete inj[i]; else inj[i] = (Math.random()<.5?-1:1) * 30;
  update();
});
$('csv').onclick = () => {
  const rows = ['index,value,true_spike,flagged,score'], f = new Set(res.flagged);
  for(let i=0;i<N;i++) rows.push([i, x[i].toFixed(3), inj[i]!==undefined?1:0, f.has(i)?1:0, res.score[i].toFixed(3)].join(','));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}));
  a.download = 'anomaly-lab.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
addEventListener('resize', draw);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
newSignal();
