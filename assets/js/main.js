/* Whan-Hyuk Choi — personal homepage (v3, 2026-10-10: 디자인 개선)
   각 HTML 쪽은 <body data-page="home|research|publications|cv|contact"> 만 다르고,
   이 파일이 content/*.json 세 파일(profile·research·publications)을 읽어 그 쪽을 그립니다.
   내용은 JSON(또는 Pages CMS)에서 고치고, 이 파일은 모양만 다룹니다.
   모든 내용은 esc()로 글자 그대로 넣어, 입력란에 HTML을 적어도 실행되지 않습니다. */
(function () {
  "use strict";
  var NAV = [["index.html", "home", "Home"], ["research.html", "research", "Research"], ["publications.html", "publications", "Publications"],
             ["cv.html", "cv", "CV"], ["contact.html", "contact", "Contact"]];
  var TYPES = [["all", "All"], ["journal", "Papers"], ["conference", "Talks"], ["patent", "Patents"], ["grant", "Grants"], ["award", "Awards"]];
  var ME = /(Whan-Hyuk\s+Choi|W\.?\s?-?\s?H\.?\s+Choi|WH\s+Choi|\bW\.?\s+Choi)/g;  /* 저자 목록에서 본인 이름 표시 */
  var PAGE = document.body.getAttribute("data-page") || "home";
  var D = {}, state = { type: "all", q: "" };
  /* 작은 선 아이콘(바깥 파일 없이) */
  var ICON = {
    mail: '<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>',
    team: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><path d="M15 14.5c2.5 0 6 1.3 6 4.5"/>',
    arxiv: '<path d="M5 19 12 5l7 14"/><path d="M8 13h8"/>',
    scholar: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    orcid: '<circle cx="12" cy="12" r="9"/><path d="M9 8v8"/><path d="M12 8h2a4 4 0 0 1 0 8h-2z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + "</svg>"; }
  function iconFor(label) { var l = String(label).toLowerCase(); return l.indexOf("arxiv") >= 0 ? "arxiv" : l.indexOf("scholar") >= 0 ? "scholar" : l.indexOf("orcid") >= 0 ? "orcid" : l.indexOf("team") >= 0 ? "team" : "link"; }

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function $(id) { return document.getElementById(id); }
  function get(n) { return fetch("content/" + n + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(n); return r.json(); }); }
  function ext(url, label) { return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>" : ""; }
  function paras(t) { return String(t || "").split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }
  function pageHead(title, lead) { return '<header class="page-head"><h1>' + esc(title) + "</h1>" + (lead ? '<p class="lead">' + esc(lead) + "</p>" : "") + "</header>"; }
  function byYear(a, b) { return b.year - a.year; }
  function nameHtml(n) { var w = String(n || "").split(" "); var last = w.pop(); return esc(w.join(" ")) + " <b>" + esc(last) + "</b>"; }

  /* ---------- 밝은·어두운 화면 ---------- */
  function theme(t) {
    if (t) { document.documentElement.setAttribute("data-theme", t); try { localStorage.setItem("theme", t); } catch (e) {} }
    var b = $("theme-btn"); if (b) b.innerHTML = svg(document.documentElement.getAttribute("data-theme") === "dark" ? "sun" : "moon");
  }
  (function () {
    var t = null; try { t = localStorage.getItem("theme"); } catch (e) {}
    if (!t && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) t = "dark";
    document.documentElement.setAttribute("data-theme", t || "light");
  })();

  function topbar(name) {
    $("topbar").innerHTML = '<div class="wrap topbar-in"><a class="brand" href="index.html">' + nameHtml(name || "Whan-Hyuk Choi") + "</a><nav>" +
      NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[1] === PAGE ? ' class="on" aria-current="page"' : "") + ">" + n[2] + "</a>"; }).join("") +
      '<button class="theme" id="theme-btn" type="button" title="Light / dark" aria-label="Toggle light or dark theme"></button></nav></div>';
    theme();
    $("theme-btn").addEventListener("click", function () { theme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); });
  }

  /* ---------- 공통 조각 ---------- */
  function badge(p) {
    var t = p.type === "journal" && /arxiv|preprint/i.test(p.venue) ? "Preprint" :
      ({ journal: "Journal", conference: "Talk", patent: "Patent", grant: "Grant", award: "Award" })[p.type] || p.type;
    return '<span class="badge ' + esc(p.type) + '">' + esc(t) + "</span>";
  }
  var uid = 0;
  function pubItem(p) {
    var id = "p" + (uid++);
    var b = [ext(p.doi, "DOI"), ext(p.arxiv, "arXiv"), ext(p.pdf, "PDF"), ext(p.link, "Link"),
      p.abstract ? '<button type="button" data-box="' + id + 'a">Abs</button>' : "",
      p.bibtex ? '<button type="button" data-box="' + id + 'b">Bib</button>' : ""].filter(Boolean).join("");
    return '<div class="pub">' + badge(p) + "<div>" +
      '<div class="t">' + esc(p.title) + "</div>" +
      (p.authors ? '<div class="a">' + esc(p.authors).replace(ME, '<span class="me">$1</span>') + "</div>" : "") +
      (p.venue ? '<div class="v">' + esc(p.venue) + "</div>" : "") +
      (b ? '<div class="btns">' + b + "</div>" : "") +
      (p.abstract ? '<div class="box" id="' + id + 'a">' + esc(p.abstract) + "</div>" : "") +
      (p.bibtex ? '<div class="box" id="' + id + 'b">' + esc(p.bibtex) + "</div>" : "") + "</div></div>";
  }
  function boxes(root) {
    root.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-box]"); if (!b) return;
      var x = document.getElementById(b.getAttribute("data-box")); if (x) x.classList.toggle("open");
    });
  }
  function timeline(list, when, what, where) {
    return '<ul class="tl">' + list.map(function (x) {
      return '<li><span class="when">' + esc(x[when]) + '</span><span class="what"><b>' + esc(x[what]) + "</b><span>" + esc(x[where]) + "</span></span></li>";
    }).join("") + "</ul>";
  }

  /* ---------- 쪽마다 ---------- */
  var PAGES = {
    home: function () {
      var p = D.profile, pub = D.publications;
      var papers = pub.filter(function (x) { return x.type === "journal"; }).sort(byYear).slice(0, 5);
      var talks = pub.filter(function (x) { return x.type === "conference"; }).sort(byYear).slice(0, 5);
      var links = (p.email ? '<a href="mailto:' + esc(p.email) + '">' + svg("mail") + esc(p.email) + "</a>" : "") +
        (p.links || []).filter(function (l) { return l.url; }).map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + svg(iconFor(l.label)) + esc(l.label) + "</a>";
        }).join("");
      $("app").innerHTML =
        '<div class="hero"><div><h1>' + nameHtml(p.name) + (p.name_native ? '<span class="native">' + esc(p.name_native) + "</span>" : "") + "</h1>" +
        '<div class="sub"><b>' + esc(p.title) + "</b>, " + esc(p.department) + "<br>" + esc(p.institution) + "</div>" +
        paras(p.bio) + '<div class="icons">' + links + "</div></div>" +
        (p.photo ? '<figure class="portrait"><img src="' + esc(p.photo.replace(/^\//, "")) + '" alt="Photo of ' + esc(p.name) + '"><figcaption>' +
          esc(p.address) + "</figcaption></figure>" : "") + "</div>" +
        '<section><h2>Research interests</h2><ul class="interests">' + D.research.map(function (r) {
          return '<li><a href="research.html#' + esc(r.id) + '">' + esc(r.title) + "</a><span>" + esc(r.short) + "</span></li>";
        }).join("") + "</ul></section>" +
        '<section id="sel"><h2>Selected publications</h2>' + papers.map(pubItem).join("") +
        '<p class="more"><a href="publications.html">All publications and activities →</a></p></section>' +
        '<section><h2>Recent talks</h2><table class="news">' + talks.map(function (t) {
          return '<tr><td class="d">' + esc(t.year) + "</td><td>" + esc(t.title) + ' · <span class="vv">' + esc(t.venue) + "</span></td></tr>";
        }).join("") + '</table><p class="more"><a href="publications.html#conference">All talks →</a></p></section>';
      boxes($("sel"));
    },
    research: function () {
      $("app").innerHTML = pageHead("Research", "Algebraic coding theory and its applications to deletion channels, DNA-based data storage, and quantum information.") +
        D.research.map(function (r) {
          return '<div class="area" id="' + esc(r.id) + '"><h3>' + esc(r.title) + "</h3><div>" +
            '<p class="short">' + esc(r.short) + "</p>" + paras(r.detail) +
            ((r.keywords || []).length ? '<div class="kw">' + r.keywords.map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("") + "</div>" : "") +
            "</div></div>";
        }).join("");
      if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    },
    publications: function () {
      $("app").innerHTML = pageHead("Publications & Activities", "Papers, preprints, talks, patents, grants, and awards.") +
        '<div class="pub-tools"><div class="tabs" id="pub-tabs"></div>' +
        '<input id="pub-search" type="search" placeholder="Search title, author, venue…" aria-label="Search publications"></div>' +
        '<div id="pub-body"></div>';
      var t0 = (location.hash || "").slice(1);
      if (TYPES.some(function (t) { return t[0] === t0; })) state.type = t0;
      tabs(); pubs(); boxes($("pub-body"));
      $("pub-tabs").addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        state.type = b.getAttribute("data-t"); tabs(); pubs();
        history.replaceState(null, "", state.type === "all" ? "publications.html" : "#" + state.type);
      });
      $("pub-search").addEventListener("input", function (e) { state.q = e.target.value.trim(); pubs(); });
    },
    cv: function () {
      var p = D.profile, pub = D.publications;
      var count = function (t) { return pub.filter(function (x) { return x.type === t; }).length; };
      var awards = pub.filter(function (x) { return x.type === "award"; }).sort(byYear);
      var grants = pub.filter(function (x) { return x.type === "grant"; }).sort(byYear);
      var sec = function (title, body) { return '<section class="cv-sec"><h2>' + esc(title) + "</h2><div>" + body + "</div></section>"; };
      $("app").innerHTML = pageHead("Curriculum Vitae", p.name + " · " + p.title + ", " + p.department + ", " + p.institution) +
        ((p.positions || []).length ? sec("Positions", timeline(p.positions, "period", "role", "place")) : "") +
        ((p.education || []).length ? sec("Education", timeline(p.education, "year", "degree", "place")) : "") +
        (awards.length ? sec("Awards", timeline(awards, "year", "title", "venue")) : "") +
        (grants.length ? sec("Grants", timeline(grants, "year", "title", "venue")) : "") +
        sec("Publications", "<p>" + '<a href="publications.html#journal">' + count("journal") + " papers and preprints</a> · " +
          '<a href="publications.html#conference">' + count("conference") + " talks</a> · " +
          '<a href="publications.html#patent">' + count("patent") + " patents</a></p>");
    },
    contact: function () {
      var p = D.profile;
      $("app").innerHTML = pageHead("Contact") + '<div class="contact">' +
        "<div><h3>Office</h3><p>" + esc(p.department) + "<br>" + esc(p.address) + "</p></div>" +
        (p.email ? '<div><h3>Email</h3><p><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a></p></div>" : "") +
        '<div><h3>Research team</h3><p><a href="https://knu-ctl.github.io/" target="_blank" rel="noopener">KNU Coding Theory Team</a></p></div>' +
        "<div><h3>Prospective students</h3><p>Students interested in coding theory and quantum information are welcome to get in touch.</p></div></div>";
    }
  };

  function tabs() {
    var all = D.publications;
    $("pub-tabs").innerHTML = TYPES.map(function (t) {
      var n = t[0] === "all" ? all.length : all.filter(function (p) { return p.type === t[0]; }).length;
      if (!n) return "";
      return '<button type="button" data-t="' + t[0] + '"' + (state.type === t[0] ? ' class="on"' : "") + ">" + esc(t[1]) + '<span class="n">' + n + "</span></button>";
    }).join("");
  }
  function pubs() {
    var q = state.q.toLowerCase();
    var list = D.publications.filter(function (p) {
      if (state.type !== "all" && p.type !== state.type) return false;
      return !q || (p.title + " " + p.authors + " " + p.venue + " " + p.year).toLowerCase().indexOf(q) >= 0;
    }).sort(byYear);
    if (!list.length) { $("pub-body").innerHTML = '<p class="empty">No matching items.</p>'; return; }
    var html = "", y = null;
    list.forEach(function (p) {
      if (p.year !== y) { html += (y === null ? "" : "</div></div>") + '<div class="yblock"><div class="y">' + esc(p.year) + "</div><div>"; y = p.year; }
      html += pubItem(p);
    });
    $("pub-body").innerHTML = html + "</div></div>";
  }

  topbar();
  Promise.all([get("profile"), get("research"), get("publications")]).then(function (r) {
    D.profile = r[0]; D.research = r[1]; D.publications = r[2];
    topbar(D.profile.name);
    (PAGES[PAGE] || PAGES.home)();
    var lm = new Date(document.lastModified);
    $("foot").innerHTML = "© " + new Date().getFullYear() + " " + esc(D.profile.name) + " · " + esc(D.profile.institution) +
      (isNaN(lm) ? "" : " · Last updated " + lm.toISOString().slice(0, 10));
  }).catch(function (e) {
    $("app").innerHTML = '<p class="empty">Could not load content (' + esc(e.message) + ").</p>";
  });
})();
