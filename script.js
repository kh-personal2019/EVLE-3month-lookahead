const COLORS = {
  "SnoCo": "#2563eb",
  "Lynnwood": "#7c3aed",
  "Everett": "#0891b2",
  "Station Area Planning": "#16a34a",
  "Corridor Design": "#f59e0b",
  "IDT": "#dc2626",
  "Third-Party Prep": "#0f766e",
  "SnoPUD": "#ea580c",
  "WSDOT": "#475569",
  "Permitting Working Group": "#be185d",
  "IAG": "#9333ea",
  "CT/ET": "#0284c7",
  "PSE": "#64748b",
  "Fire Life Safety": "#b91c1c"
};
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const weekdayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
let allEvents = [];
let activeCategories = new Set();
let searchTerm = "";
function fmtDate(iso) {
  const [y,m,d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function categoryColor(cat) { return COLORS[cat] || "#334155"; }
function filteredEvents() {
  const term = searchTerm.trim().toLowerCase();
  return allEvents.filter(ev => activeCategories.has(ev.category) && (!term || `${ev.title} ${ev.category} ${ev.details.join(" ")}`.toLowerCase().includes(term)));
}
function renderLegend() {
  const cats = [...new Set(allEvents.map(e => e.category))].sort();
  const legend = document.querySelector("#legend");
  legend.innerHTML = "";
  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = activeCategories.has(cat) ? "active" : "";
    btn.style.background = activeCategories.has(cat) ? categoryColor(cat) : "#fff";
    btn.addEventListener("click", () => {
      if (activeCategories.has(cat)) activeCategories.delete(cat); else activeCategories.add(cat);
      render();
    });
    legend.appendChild(btn);
  });
}
function buildCalendar() {
  const year = 2026, month = 7;
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const prevLastDay = new Date(year, month, 0).getDate();
  const days = [];
  for (let i = startDow - 1; i >= 0; i--) days.push({ day: prevLastDay - i, out: true, iso: null });
  for (let d = 1; d <= lastDay; d++) days.push({ day: d, out: false, iso: `2026-08-${String(d).padStart(2,"0")}` });
  while (days.length % 7 !== 0) days.push({ day: days.length - startDow - lastDay + 1, out: true, iso: null });
  return days;
}
function renderCalendar() {
  const grid = document.querySelector("#calendar-grid");
  const events = filteredEvents();
  const byDate = events.reduce((acc, ev) => { (acc[ev.date] ||= []).push(ev); return acc; }, {});
  grid.innerHTML = "";
  buildCalendar().forEach(day => {
    const el = document.createElement("div");
    el.className = `day ${day.out ? "out" : ""}`;
    el.innerHTML = `<div class="day-number">${day.day}</div>`;
    if (day.iso && byDate[day.iso]) {
      byDate[day.iso].forEach(ev => {
        const e = document.createElement("div");
        e.className = "event";
        e.style.borderLeftColor = categoryColor(ev.category);
        e.innerHTML = `<div class="event-title">${ev.title}</div><div class="event-cat">${ev.category}</div>`;
        e.addEventListener("click", () => openModal(ev));
        el.appendChild(e);
      });
    }
    grid.appendChild(el);
  });
}
function renderAgenda() {
  const pane = document.querySelector("#agenda");
  const events = filteredEvents().sort((a,b) => a.date.localeCompare(b.date) || a.category.localeCompare(b.category));
  pane.innerHTML = "";
  events.forEach(ev => {
    const item = document.createElement("div");
    item.className = "agenda-item";
    item.style.borderLeftColor = categoryColor(ev.category);
    item.innerHTML = `<div class="agenda-date">${fmtDate(ev.date)}</div><div class="agenda-title">${ev.title}</div><div class="event-cat">${ev.category}</div>${ev.details.length ? `<ul>${ev.details.map(d => `<li>${d}</li>`).join("")}</ul>` : ""}`;
    item.addEventListener("click", () => openModal(ev));
    pane.appendChild(item);
  });
}
function renderStats() {
  const events = filteredEvents();
  document.querySelector("#event-count").textContent = events.length;
  document.querySelector("#category-count").textContent = new Set(events.map(e => e.category)).size;
}
function openModal(ev) {
  const modal = document.querySelector("#modal");
  document.querySelector("#modal-badge").textContent = ev.category;
  document.querySelector("#modal-badge").style.background = categoryColor(ev.category);
  document.querySelector("#modal-title").textContent = ev.title;
  document.querySelector("#modal-date").textContent = fmtDate(ev.date);
  const details = document.querySelector("#modal-details");
  details.innerHTML = ev.details.length ? ev.details.map(d => `<li>${d}</li>`).join("") : `<li>No additional detail listed in the source document.</li>`;
  modal.classList.add("open");
}
function closeModal() { document.querySelector("#modal").classList.remove("open"); }
function downloadJson() {
  const blob = new Blob([JSON.stringify(allEvents, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "august-2026-evle-events.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
function render() { renderLegend(); renderCalendar(); renderAgenda(); renderStats(); }
async function init() {
  document.querySelector("#month-title").textContent = `${monthNames[7]} 2026`;
  document.querySelector("#weekdays").innerHTML = weekdayNames.map(d => `<div>${d}</div>`).join("");
  allEvents = await fetch("./data/events.json").then(r => r.json());
  activeCategories = new Set(allEvents.map(e => e.category));
  document.querySelector("#search").addEventListener("input", e => { searchTerm = e.target.value; render(); });
  document.querySelector("#close").addEventListener("click", closeModal);
  document.querySelector("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
  document.querySelector("#download-json").addEventListener("click", downloadJson);
  render();
}
init();
