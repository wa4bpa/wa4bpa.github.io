/* Whan-Hyuk Choi — personal homepage (v2, 2026-10-10: 메뉴별 페이지로 나눔)
   각 HTML 쪽은 <body data-page="home|research|publications|cv|contact"> 만 다르고,
   이 파일이 content/*.json 세 파일(profile·research·publications)을 읽어 그 쪽을 그립니다.
   내용은 JSON(또는 Pages CMS)에서 고치고, 이 파일은 모양만 다룹니다. */
(function () {
  "use strict";
  var NAV = [["index.html", "home", "Home"], ["research.html", "research", "Research"], ["publications.html", "publications", "Publications"],
             ["cv.html", "cv", "CV"], ["contact.html", "contact", "Contact"]];
  var TYPES = [["all", "All"], ["journal", "Journal & Preprints"], ["conference", "Talks"], ["patent", "Patents"], ["grant", "Grants"], ["award", "Awards"]];
  var TAG = { journal: "Paper", conference: "Talk", patent: "Patent", grant: "Grant", award: "Award" };
  var ME = /(Whan-Hyuk\s+Choi|W\.?\s?-?\s?H\.?\s+Choi|WH\s+Choi|\bW\.?\s+Choi)/g;  /* 저자 목록에서 본인 이름을 굵게 */
  var PAGE = document.body.getAttribute("data-page") || "home";
  var D = {}, state = { type: "all", q: "" };

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function $(id) { return document.getElementById(id); }
  function get(n) { return fetch("content/" + n + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(n); return r.json(); }); }
  function link(url, label) { return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>" : ""; }
  function paras(t) { return String(t || "").split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }
  function pageHead(title, lead) { return '<div class="page-head"><h1>' + esc(title) + "</h1>" + (lead ? '<p class="lead">' + esc(lead) + "</p>" : "") + "</div>"; }

  function topbar(name) {
    $("topbar").innerHTML = '<div class="wrap topbar-in"><a class="brand" href="index.html">' + esc(name || "Whan-Hyuk Choi") + "</a><nav>" +
      NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[1] === PAGE ? ' class="on" aria-current="page"' : "") + ">" + n[2] + "</a>"; }).join("") +
      "</nav></div>";
  }

  /* ---------- 공통 조각 ---------- */
  function profileCard(p) {
    var links = (p.links || []).filter(function (l) { return l.url; }).map(function (l) { return link(l.url, l.label); }).join("");
    return '<aside class="profile">' +
      (p.photo ? '<img src="' + esc(p.photo.replace(/^\//, "")) + '" alt="Photo of ' + esc(p.name) + '">' : "") +
      "<h1>" + esc(p.name) + "</h1>" + (p.name_native ? '<div class="native">' + esc(p.name_native) + "</div>" : "") +
      '<div class="role"><b>' + esc(p.title) + "</b><br>" + esc(p.department) + "<br>" + esc(p.institution) + "</div>" +
      '<div class="chips">' + (p.interests || []).map(function (i) { return '<span class="chip">' + esc(i) + "</span>"; }).join("") + "</div>" +
      '<div class="plinks">' + (p.email ? '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a>" : "") + links + "</div></aside>";
  }
  function pubItem(p) {
    var ln = [link(p.doi, "DOI"), link(p.arxiv, "arXiv"), link(p.pdf, "PDF"), link(p.link, "Link")].filter(Boolean).join("");
    return '<div class="pub"><span class="tag ' + esc(p.type) + '">' + esc(TAG[p.type] || p.type) + "</span><div>" +
      '<div class="t">' + esc(p.title) + "</div>" +
      (p.authors ? '<div class="a">' + esc(p.authors).replace(ME, '<span class="me">$1</span>') + "</div>" : "") +
      (p.venue ? '<div class="v">' + esc(p.venue) + "</div>" : "") +
      (ln ? '<div class="ln">' + ln + "</div>" : "") + "</div></div>";
  }
  function byYear(a, b) { return b.year - a.year; }
  function timeline(list, when, what, where) {
    return '<ul class="tl">' + list.map(function (x) {
      return '<li><span class="when">' + esc(x[when]) + '</span><span class="what"><b>' + esc(x[what]) + "</b><span>" + esc(x[where]) + "</span></span></li>";
    }).join("") + "</ul>";
  }

  /* ---------- 쪽마다 ---------- */
  var PAGES = {
    home: function () {
      var p = D.profile;
      var papers = D.publications.filter(function (x) { return x.type === "journal"; }).sort(byYear).slice(0, 5);
      $("app").innerHTML = '<div class="home">' + profileCard(p) + "<div>" +
        '<section><h2>About</h2>' + paras(p.bio) + "</section>" +
        '<section><h2>Research areas</h2><ul class="areas">' + D.research.map(function (r) {
          return '<li><a href="research.html#' + esc(r.id) + '">' + esc(r.title) + "</a><span>" + esc(r.short) + "</span></li>";
        }).join("") + "</ul></section>" +
        '<section><div class="sec-head"><h2>Recent papers</h2><a href="publications.html">All publications →</a></div>' +
        papers.map(pubItem).join("") + "</section></div></div>";
    },
    research: function () {
      $("app").innerHTML = pageHead("Research", "Algebraic coding theory and its applications to deletion channels, DNA-based data storage, and quantum information.") +
        D.research.map(function (r) {
          return '<section class="area" id="' + esc(r.id) + '"><h2>' + esc(r.title) + '</h2><p class="lead">' + esc(r.short) + "</p>" + paras(r.detail) +
            ((r.keywords || []).length ? '<div class="kw">' + r.keywords.map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("") + "</div>" : "") +
            "</section>";
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
      tabs(); pubs();
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
      $("app").innerHTML = pageHead("Curriculum Vitae", p.name + " · " + p.title + ", " + p.department + ", " + p.institution) +
        ((p.positions || []).length ? "<section><h2>Positions</h2>" + timeline(p.positions, "period", "role", "place") + "</section>" : "") +
        ((p.education || []).length ? "<section><h2>Education</h2>" + timeline(p.education, "year", "degree", "place") + "</section>" : "") +
        (awards.length ? "<section><h2>Awards</h2>" + timeline(awards, "year", "title", "venue") + "</section>" : "") +
        (grants.length ? "<section><h2>Research grants</h2>" + timeline(grants, "year", "title", "venue") + "</section>" : "") +
        '<section><h2>Publications</h2><p>' +
        '<a href="publications.html#journal">' + count("journal") + " journal papers and preprints</a> · " +
        '<a href="publications.html#conference">' + count("conference") + " talks</a> · " +
        '<a href="publications.html#patent">' + count("patent") + " patents</a></p></section>";
    },
    contact: function () {
      var p = D.profile;
      $("app").innerHTML = pageHead("Contact") + '<div class="contact">' +
        '<div class="ccard"><h3>Office</h3><p>' + esc(p.department) + "<br>" + esc(p.address) + "</p></div>" +
        (p.email ? '<div class="ccard"><h3>Email</h3><p><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a></p></div>" : "") +
        '<div class="ccard"><h3>Research team</h3><p><a href="https://knu-ctl.github.io/" target="_blank" rel="noopener">KNU Coding Theory Team</a><br>' +
        "Students interested in coding theory and quantum information are welcome.</p></div></div>";
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
      if (p.year !== y) { y = p.year; html += '<div class="year">' + esc(y) + "</div>"; }
      html += pubItem(p);
    });
    $("pub-body").innerHTML = html;
  }

  topbar();
  Promise.all([get("profile"), get("research"), get("publications")]).then(function (r) {
    D.profile = r[0]; D.research = r[1]; D.publications = r[2];
    topbar(D.profile.name);
    (PAGES[PAGE] || PAGES.home)();
    $("foot").innerHTML = "© " + new Date().getFullYear() + " " + esc(D.profile.name) + " · " + esc(D.profile.institution);
  }).catch(function (e) {
    $("app").innerHTML = '<p class="empty">Could not load content (' + esc(e.message) + ").</p>";
  });
})();
