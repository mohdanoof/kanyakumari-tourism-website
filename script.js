/* ---------- Smooth scroll (Lenis) ---------- */
let lenis;
try{
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if(window.ScrollTrigger){ lenis.on('scroll', ScrollTrigger.update); }
}catch(e){}

gsap.registerPlugin(ScrollTrigger);

/* ---------- Nav scroll state ---------- */
const nav = document.getElementById('nav');
ScrollTrigger.create({ start: 60, onUpdate: self => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}});

/* ---------- Hero load sequence (one orchestrated moment) ---------- */
window.addEventListener('load', () => {
  const tl = gsap.timeline({defaults:{ease:'power3.out'}});
  tl.to('#heroImg', {scale:1, duration:1.8, ease:'power2.out'}, 0)
    .to('#r1', {opacity:1, y:0, duration:.8}, .2)
    .to('#r2', {opacity:1, y:0, duration:1}, .35)
    .to('#r3', {opacity:1, y:0, duration:.8}, .6)
    .to('#r4', {opacity:1, y:0, duration:.8}, .75);
});

/* ---------- Hero parallax ---------- */
gsap.to('#heroImg', {
  yPercent: 14, ease:'none',
  scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true }
});

/* ---------- Generic scroll reveals ---------- */
document.querySelectorAll('.reveal').forEach(el=>{
  if(el.id && el.id.startsWith('r')) return; // hero handled separately
  gsap.to(el, {
    opacity:1, y:0, duration:1, ease:'power3.out',
    scrollTrigger:{ trigger: el, start:'top 88%' }
  });
});

/* ---------- Timeline dots pulse in ---------- */
gsap.utils.toArray('.tl-item').forEach(item=>{
  gsap.from(item.querySelector('.tl-dot'), {
    scale:0, duration:.5, ease:'back.out(3)',
    scrollTrigger:{ trigger:item, start:'top 75%' }
  });
});

/* ---------- Meeting-point line draw ---------- */
['pathA','pathB','pathC'].forEach(id=>{
  const p = document.getElementById(id);
  const len = p.getTotalLength();
  p.style.strokeDasharray = len;
  p.style.strokeDashoffset = len;
  gsap.to(p, { strokeDashoffset:0, duration:1.6, ease:'power2.inOut',
    scrollTrigger:{ trigger:'.meeting', start:'top 70%' }});
});

/* ---------- Travelling sun (sunrise/sunset section) ---------- */
gsap.to('#travellingSun', {
  y: -60, duration:1, ease:'sine.inOut', yoyo:true, repeat:-1
});

/* ---------- Custom cursor ---------- */
const cursor = document.getElementById('cursor');
window.addEventListener('mousemove', e=>{
  gsap.to(cursor, {x:e.clientX, y:e.clientY, duration:.15});
});
document.querySelectorAll('a, button, .hcard, .icon-card').forEach(el=>{
  el.addEventListener('mouseenter', ()=>cursor.classList.add('big'));
  el.addEventListener('mouseleave', ()=>cursor.classList.remove('big'));
});

/* ---------- Itinerary card expand ---------- */
document.querySelectorAll('.itin-card').forEach(card=>{
  card.addEventListener('click', ()=> card.classList.toggle('open'));
});

/* ---------- Budget calculator ---------- */
const rates = {
  budget:   {transport:600,  hotel:1200, food:400, activities:300},
  comfort:  {transport:1200, hotel:3000, food:900, activities:700},
  luxury:   {transport:2800, hotel:7500, food:2000,activities:1800}
};
let currentStyle = 'budget';
const travelersEl = document.getElementById('travelers');
const daysEl = document.getElementById('days');
const travelersVal = document.getElementById('travelersVal');
const daysVal = document.getElementById('daysVal');

function fmt(n){ return '₹' + Math.round(n).toLocaleString('en-IN'); }

function updateBudget(){
  const t = parseInt(travelersEl.value);
  const d = parseInt(daysEl.value);
  travelersVal.textContent = t;
  daysVal.textContent = d;
  const r = rates[currentStyle];
  const transport = r.transport * t;
  const hotel = r.hotel * d * Math.ceil(t/2);
  const food = r.food * t * d;
  const activities = r.activities * t * d;
  const total = transport + hotel + food + activities;

  animateCount('outTransport', transport);
  animateCount('outHotel', hotel);
  animateCount('outFood', food);
  animateCount('outActivities', activities);
  animateCount('outTotal', total);
}
function animateCount(id, target){
  const el = document.getElementById(id);
  const obj = {v: parseFloat(el.dataset.v || 0)};
  gsap.to(obj, { v: target, duration:.6, ease:'power2.out', onUpdate:()=>{ el.textContent = fmt(obj.v); }, onComplete:()=>{ el.dataset.v = target; } });
}
travelersEl.addEventListener('input', updateBudget);
daysEl.addEventListener('input', updateBudget);
document.querySelectorAll('.style-toggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.style-toggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentStyle = btn.dataset.style;
    updateBudget();
  });
});
updateBudget();

/* ---------- Leaflet map ---------- */
const map = L.map('map', { scrollWheelZoom:false }).setView([8.0785, 77.5432], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:'&copy; OpenStreetMap contributors', maxZoom:18
}).addTo(map);

const goldIcon = L.divIcon({
  className:'', html:'<div style="width:14px;height:14px;border-radius:50%;background:#c7a35d;border:2px solid #f6f2e6;box-shadow:0 0 0 3px rgba(199,163,93,.35);"></div>',
  iconSize:[14,14], iconAnchor:[7,7]
});

const spots = [
  {name:'Vivekananda Rock Memorial', desc:'Offshore memorial, reachable by ferry.', lat:8.0778, lng:77.5479},
  {name:'Thiruvalluvar Statue', desc:'133-ft statue beside the Rock Memorial.', lat:8.0774, lng:77.5487},
  {name:'Kumari Amman Temple', desc:'The town\'s namesake coastal temple.', lat:8.0793, lng:77.5417},
  {name:'Gandhi Memorial', desc:'Marks the spot where Gandhi\'s ashes were kept.', lat:8.0800, lng:77.5424},
  {name:'Vattakottai Fort', desc:'18th-century coastal Travancore fort.', lat:8.1121, lng:77.5347},
  {name:'Suchindram Temple', desc:'Famed for its musical stone pillars.', lat:8.1496, lng:77.4384},
  {name:'Padmanabhapuram Palace', desc:'Former wooden capital of Travancore.', lat:8.2434, lng:77.3251},
  {name:'Muttom Beach', desc:'Quiet beach with a working lighthouse.', lat:8.1223, lng:77.3167},
  {name:'Chothavilai Beach', desc:'Rocky shoreline, good for tide pools.', lat:8.1103, lng:77.4763},
  {name:'Thirparappu Waterfalls', desc:'Seasonal falls on the Kodayar river.', lat:8.3010, lng:77.3480}
];
spots.forEach(s=>{
  L.marker([s.lat,s.lng], {icon:goldIcon}).addTo(map)
    .bindPopup(`<h4>${s.name}</h4><p>${s.desc}</p>`);
});
