/* Whan-Hyuk Choi — personal homepage (v1, 2026-10-10)
   content/*.json 세 파일(profile·research·publications)을 읽어 화면을 그립니다.
   내용은 JSON(또는 Pages CMS)에서 고치고, 이 파일은 모양만 다룹니다. */
(function () {
  "use strict";
  var TYPES = [
    ["all", "All"], ["journal", "Journal & Preprints"], ["conference", "Talks"],
    ["patent", "Patents"], ["grant", "Grants"], ["award", "Awards"]
  ];
  var TAG = { journal: "Paper", conference: "Talk", patent: "Patent", grant: "Grant", award: "Award" };
  var ME = /(Whan-Hyuk\s+Choi|W\.?\s?-?\s?H\.?\s+Choi|WH\s+Choi|\bW\.?\s+Choi)/g;  /* 저자 목록에서 본인 이름을 굵게 */
  var state = { type: "all", q: "" }, D = {};

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function $(id) { return document.getElementById(id); }
  function get(n) { return fetch("content/" + n + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(n); return r.json(); }); }
  function link(url, label) { return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>" : ""; }
  function paras(t) { return String(t || "").split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }

  function profile(p) {
    var links = (p.links || []).filter(function (l) { return l.url; })
      .map(function (l) { return link(l.url, l.label); }).join("");
    $("profile").innerHTML =
      (p.photo ? '<img src="' + esc(p.photo.replace(/^\//, "")) + '" alt="Photo of ' + esc(p.name) + '">' : "") +
      "<h1>" + esc(p.name) + "</h1>" +
      (p.name_native ? '<div class="native">' + esc(p.name_native) + "</div>" : "") +
      '<div class="role"><b>' + esc(p.title) + "</b><br>" + esc(p.department) + "<br>" + esc(p.institution) + "</div>" +
      '<div class="chips">' + (p.interests || []).map(function (i) { return '<span class="chip">' + esc(i) + "</span>"; }).join("") + "</div>" +
      '<div class="plinks">' + (p.email ? '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a>" : "") + links + "</div>";
    $("about-body").innerHTML = paras(p.bio);
    $("contact-body").innerHTML =
      "<p>" + esc(p.department) + ", " + esc(p.institution) + "<br>" + esc(p.address) + "</p>" +
      (p.email ? '<p>Email: <a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a></p>" : "");
    var cv = "";
    if ((p.positions || []).length) {
      cv += "<h3>Positions</h3><ul class=\"tl\">" + p.positions.map(function (x) {
        return '<li><span class="when">' + esc(x.period) + '</span><span class="what"><b>' + esc(x.role) + "</b><span>" + esc(x.place) + "</span></span></li>";
      }).join("") + "</ul>";
    }
    if ((p.education || []).length) {
      cv += "<h3>Education</h3><ul class=\"tl\">" + p.education.map(function (x) {
        return '<li><span class="when">' + esc(x.year) + '</span><span class="what"><b>' + esc(x.degree) + "</b><span>" + esc(x.place) + "</span></span></li>";
      }).join("") + "</ul>";
    }
    $("cv-body").innerHTML = cv || '<p class="empty">Coming soon.</p>';
    $("foot").innerHTML = "© " + new Date().getFullYear() + " " + esc(p.name) + " · " + esc(p.institution);
  }

  function research(list) {
    $("research-body").innerHTML = list.map(function (r) {
      return '<div class="card"><h3>' + esc(r.title) + '</h3><div class="short">' + esc(r.short) + "</div>" +
        (r.detail ? "<details><summary>More</summary>" + paras(r.detail) + "</details>" : "") +
        ((r.keywords || []).length ? '<div class="kw">' + r.keywords.map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("") + "</div>" : "") +
        "</div>";
    }).join("");
  }

  function tabs() {
    var pubs = D.publications;
    $("pub-tabs").innerHTML = TYPES.map(function (t) {
      var n = t[0] === "all" ? pubs.length : pubs.filter(function (p) { return p.type === t[0]; }).length;
      if (!n) return "";
      return '<button type="button" data-t="' + t[0] + '"' + (state.type === t[0] ? ' class="on"' : "") + ">" + esc(t[1]) + '<span class="n">' + n + "</span></button>";
    }).join("");
  }

  function pubs() {
    var q = state.q.toLowerCase();
    var list = D.publications.filter(function (p) {
      if (state.type !== "all" && p.type !== state.type) return false;
      if (!q) return true;
      return (p.title + " " + p.authors + " " + p.venue + " " + p.year).toLowerCase().indexOf(q) >= 0;
    }).sort(function (a, b) { return b.year - a.year; });
    if (!list.length) { $("pub-body").innerHTML = '<p class="empty">No matching items.</p>'; return; }
    var html = "", y = null;
    list.forEach(function (p) {
      if (p.year !== y) { y = p.year; html += '<div class="year">' + esc(y) + "</div>"; }
      var ln = [link(p.doi, "DOI"), link(p.arxiv, "arXiv"), link(p.pdf, "PDF"), link(p.link, "Link")].filter(Boolean).join("");
      html += '<div class="pub"><span class="tag ' + esc(p.type) + '">' + esc(TAG[p.type] || p.type) + "</span><div>" +
        '<div class="t">' + esc(p.title) + "</div>" +
        (p.authors ? '<div class="a">' + esc(p.authors).replace(ME, '<span class="me">$1</span>') + "</div>" : "") +
        (p.venue ? '<div class="v">' + esc(p.venue) + "</div>" : "") +
        (ln ? '<div class="ln">' + ln + "</div>" : "") + "</div></div>";
    });
    $("pub-body").innerHTML = html;
  }

  function spy() {  /* 읽고 있는 절을 위 메뉴에 표시 */
    var links = Array.prototype.slice.call(document.querySelectorAll("#nav a"));
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section").forEach(function (s) { io.observe(s); });
  }

  Promise.all([get("profile"), get("research"), get("publications")]).then(function (r) {
    D.profile = r[0]; D.research = r[1]; D.publications = r[2];
    profile(D.profile); research(D.research); tabs(); pubs(); spy();
    $("pub-tabs").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.type = b.getAttribute("data-t"); tabs(); pubs();
    });
    $("pub-search").addEventListener("input", function (e) { state.q = e.target.value.trim(); pubs(); });
  }).catch(function (e) {
    $("about-body").innerHTML = '<p class="empty">Could not load content (' + esc(e.message) + ").</p>";
  });
})();
