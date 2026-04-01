/**
 * PruittHealth — main navigation + FAQ hero (vanilla JS).
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------ Navigation ------------------------------ */

  const header = document.getElementById("site-header");
  const mqDesktop = window.matchMedia("(min-width: 1169px)");
  const navDesktop = document.getElementById("nav-desktop");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileNavInner = document.getElementById("mobile-nav-inner");
  const menuToggle = document.querySelector(".menu-toggle");

  const SCROLL_THRESHOLD = 9;
  let lastScrollY = window.scrollY;
  let scrollHidden = false;
  let openDropdownId = null;
  let mobileOpen = false;

  function pauseHide() {
    return openDropdownId !== null || mobileOpen;
  }

  function updateFaqSectionPickerStuck() {
    var picker = document.getElementById("faq-section-picker");
    if (!picker) return;
    var cs = window.getComputedStyle(picker);
    if (cs.display === "none") {
      picker.classList.remove("is-stuck");
      return;
    }
    var stickyTop = parseFloat(cs.top);
    if (Number.isNaN(stickyTop)) stickyTop = 0;
    var rect = picker.getBoundingClientRect();
    var tol = 2;
    var isStuck = Math.abs(rect.top - stickyTop) <= tol;
    picker.classList.toggle("is-stuck", isStuck);
  }

  function updateScrollHiddenClass() {
    if (!header) return;
    const shouldHide = scrollHidden && !pauseHide();
    header.classList.toggle("is-scroll-hidden", shouldHide);
    updateFaqSectionPickerStuck();
  }

  function onScroll() {
    if (pauseHide()) return;
    const current = window.scrollY;
    const delta = current - lastScrollY;
    if (Math.abs(delta) < SCROLL_THRESHOLD) return;
    scrollHidden = delta > 0 && current > 8;
    lastScrollY = current;
    updateScrollHiddenClass();
  }

  function setDesktopDropdown(idOrNull) {
    openDropdownId = idOrNull;
    document.querySelectorAll(".nav-desktop .nav-trigger[data-dropdown]").forEach(function (btn) {
      const id = btn.getAttribute("data-dropdown");
      const open = id === idOrNull;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      const panel = document.getElementById("dropdown-" + id);
      if (panel) {
        if (open) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      }
    });
    updateScrollHiddenClass();
  }

  function closeDesktopDropdown() {
    setDesktopDropdown(null);
  }

  function closeMobileSubMenus() {
    document.querySelectorAll(".nav-mobile .nav-item.is-open").forEach(function (item) {
      item.classList.remove("is-open");
    });
    document.querySelectorAll(".nav-mobile .nav-trigger[data-dropdown]").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
  }

  function closeMobileMenu() {
    mobileOpen = false;
    if (mobileMenu) {
      mobileMenu.classList.remove("is-open");
      mobileMenu.setAttribute("aria-hidden", "true");
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      const icon = menuToggle.querySelector(".menu-toggle__icon");
      if (icon) icon.textContent = "\u2261";
    }
    closeMobileSubMenus();
    document.body.classList.remove("is-mobile-menu-open");
    updateNavAria();
    updateScrollHiddenClass();
  }

  function openMobileMenu() {
    mobileOpen = true;
    if (mobileMenu) {
      mobileMenu.classList.add("is-open");
      mobileMenu.setAttribute("aria-hidden", "false");
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
      const icon = menuToggle.querySelector(".menu-toggle__icon");
      if (icon) icon.textContent = "\u2715";
    }
    closeDesktopDropdown();
    document.body.classList.add("is-mobile-menu-open");
    updateNavAria();
    updateScrollHiddenClass();
  }

  function updateNavAria() {
    const isDesktop = mqDesktop.matches;
    if (navDesktop) {
      navDesktop.setAttribute("aria-hidden", isDesktop ? "false" : "true");
    }
    const mobileHidden = isDesktop || !mobileOpen;
    if (mobileMenu) {
      mobileMenu.setAttribute("aria-hidden", mobileHidden ? "true" : "false");
    }
    if (mobileNavInner) {
      mobileNavInner.setAttribute("aria-hidden", mobileHidden ? "true" : "false");
    }
  }

  function initNav() {
    if (!header) return;

    window.addEventListener("scroll", onScroll, { passive: true });
    lastScrollY = window.scrollY;

    document.querySelectorAll(".nav-desktop .nav-trigger[data-dropdown]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-dropdown");
        if (openDropdownId === id) closeDesktopDropdown();
        else setDesktopDropdown(id);
      });
    });

    document.addEventListener("mousedown", function (e) {
      if (!openDropdownId) return;
      if (!header.contains(e.target)) closeDesktopDropdown();
    });

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", function () {
        if (mobileOpen) closeMobileMenu();
        else openMobileMenu();
      });
    }

    document.querySelectorAll(".nav-mobile .nav-trigger[data-dropdown]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const li = btn.closest(".nav-item");
        const isCurrentlyOpen = li && li.classList.contains("is-open");

        document.querySelectorAll(".nav-mobile .nav-item").forEach(function (item) {
          item.classList.remove("is-open");
        });
        document.querySelectorAll(".nav-mobile .nav-trigger[data-dropdown]").forEach(function (b) {
          b.setAttribute("aria-expanded", "false");
        });

        if (!isCurrentlyOpen && li) {
          li.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    mqDesktop.addEventListener("change", function (e) {
      updateNavAria();
      if (e.matches && mobileOpen) closeMobileMenu();
    });
    updateNavAria();

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (openDropdownId) {
        closeDesktopDropdown();
        return;
      }
      if (document.querySelector(".nav-mobile .nav-item.is-open")) {
        closeMobileSubMenus();
        return;
      }
      if (mobileOpen) closeMobileMenu();
    });
  }

  initNav();

  function initBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;

    var revealAt = 400;

    function updateVisibility() {
      var show = window.scrollY > revealAt;
      btn.classList.toggle("is-visible", show);
      btn.setAttribute("aria-hidden", show ? "false" : "true");
      btn.tabIndex = show ? 0 : -1;
    }

    window.addEventListener(
      "scroll",
      function () {
        updateVisibility();
      },
      { passive: true }
    );
    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
    updateVisibility();
  }

  initBackToTop();

  /* ------------------------------ FAQ hero ------------------------------ */

  function filterFAQ(query) {
    const items = document.querySelectorAll(".faq-item");
    const q = query.trim().toLowerCase();

    items.forEach(function (item) {
      item.classList.remove("faq-item--match");
      if (!q) {
        item.classList.remove("faq-item--hidden");
        return;
      }

      const summary = item.querySelector("summary");
      const body = item.querySelector(".faq-item__body");
      const keywords = (item.getAttribute("data-faq-keywords") || "").toLowerCase();
      const text = (
        (summary && summary.textContent) +
        " " +
        (body && body.textContent) +
        " " +
        keywords
      ).toLowerCase();

      if (text.includes(q)) {
        item.classList.remove("faq-item--hidden");
        item.classList.add("faq-item--match");
      } else {
        item.classList.add("faq-item--hidden");
      }
    });
  }

  function initFAQSearch() {
    const form = document.getElementById("faq-hero-search-form");
    const input = document.getElementById("faq-hero-search-input");
    if (!form || !input) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      filterFAQ(input.value);
      const firstVisible = document.querySelector(".faq-item:not(.faq-item--hidden)");
      if (firstVisible) {
        firstVisible.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  }

  function initPhotoFallback() {
    const photo = document.querySelector(".faq-hero__photo");
    if (!photo) return;
    photo.addEventListener(
      "error",
      function onPhotoError() {
        if (photo.dataset.fallbackApplied) return;
        photo.dataset.fallbackApplied = "1";
        photo.removeEventListener("error", onPhotoError);
        photo.src =
          "https://images.unsplash.com/photo-1576765607924-3b7e37d7a96c?w=1200&q=80&auto=format&fit=crop";
      },
      { once: true }
    );
  }

  function initSmoothScrollForHeroLinks() {
    document.querySelectorAll('.faq-hero__row[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (target.tagName === "DETAILS") {
          target.open = true;
        }
        window.requestAnimationFrame(function () {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        });
      });
    });
  }

  function initFAQDeepLinkFromHash() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var target = document.querySelector(hash);
    if (!target || target.tagName !== "DETAILS") return;
    target.open = true;
  }

  function initFAQHero() {
    if (!document.querySelector(".faq-hero")) return;
    initFAQSearch();
    initPhotoFallback();
    initSmoothScrollForHeroLinks();
    initFAQDeepLinkFromHash();
  }

  initFAQHero();

  /* ------------------------------ FAQ answers (two-column) ------------------------------ */

  function initFAQAccordion() {
    document.querySelectorAll(".faq-answers__group").forEach(function (group) {
      group.querySelectorAll("details.faq-group__item").forEach(function (detail) {
        detail.addEventListener("toggle", function () {
          if (!detail.open) return;
          group.querySelectorAll("details.faq-group__item").forEach(function (other) {
            if (other !== detail) other.open = false;
          });
        });
      });
    });
  }

  function openFirstDetailsInGroup(sectionEl) {
    var items = sectionEl.querySelectorAll("details.faq-group__item");
    if (!items.length) return;
    items.forEach(function (d, i) {
      d.open = i === 0;
    });
  }

  function initFAQAnswersNav() {
    var root = document.querySelector(".faq-answers");
    if (!root) return;

    root.addEventListener("click", function (e) {
      var link = e.target.closest("a.faq-answers__nav-link[href^='#']");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href || href.length < 2) return;
      var id = href.slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (target.tagName === "DETAILS") {
        target.open = true;
        var sectionEl = target.closest(".faq-answers__group");
        if (sectionEl) {
          sectionEl.querySelectorAll("details.faq-group__item").forEach(function (other) {
            if (other !== target) other.open = false;
          });
        }
        window.requestAnimationFrame(function () {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        });
      } else if (target.classList && target.classList.contains("faq-answers__group")) {
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        openFirstDetailsInGroup(target);
      }
    });

    document.querySelectorAll('.faq-answers__group-action[href="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  function initFAQSectionPicker() {
    var picker = document.getElementById("faq-section-picker");
    if (!picker) return;

    var btn = picker.querySelector(".faq-answers__section-picker-btn");
    var panel = document.getElementById("faq-section-picker-panel");
    var label = picker.querySelector(".faq-answers__section-picker-label");
    if (!btn || !panel || !label) return;

    function openPicker() {
      btn.setAttribute("aria-expanded", "true");
      panel.removeAttribute("hidden");
    }

    function closePicker() {
      btn.setAttribute("aria-expanded", "false");
      panel.setAttribute("hidden", "");
    }

    function setLabel(text) {
      label.textContent = text;
    }

    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) closePicker();
      else openPicker();
    });

    // Close on outside click
    document.addEventListener("mousedown", function (e) {
      if (!picker.contains(e.target)) closePicker();
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePicker();
    });

    // Handle link clicks: close panel, jump to section, open first accordion item
    panel.addEventListener("click", function (e) {
      var link = e.target.closest(".faq-answers__section-picker-link");
      if (!link) return;
      e.preventDefault();

      var href = link.getAttribute("href");
      var target = href ? document.querySelector(href) : null;
      if (!target) return;

      // Update button label to show current section
      setLabel(link.textContent.trim());

      // Update active state in panel
      panel.querySelectorAll(".faq-answers__section-picker-link").forEach(function (l) {
        l.classList.toggle("is-active", l === link);
      });

      closePicker();

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      // Open first accordion item in the target group
      openFirstDetailsInGroup(target);
    });

    // Keep button label in sync with scroll spy
    // Call this from initFAQScrollSpy when active section changes on mobile
    window._updateSectionPickerLabel = function (sectionId) {
      var activeLink = panel.querySelector('a[href="#' + sectionId + '"]');
      if (activeLink) {
        setLabel(activeLink.textContent.trim());
        panel.querySelectorAll(".faq-answers__section-picker-link").forEach(function (l) {
          l.classList.toggle("is-active", l === activeLink);
        });
      }
    };

    var stuckTicking = false;
    function scheduleStuckUpdate() {
      if (stuckTicking) return;
      stuckTicking = true;
      window.requestAnimationFrame(function () {
        stuckTicking = false;
        updateFaqSectionPickerStuck();
      });
    }
    window.addEventListener("scroll", scheduleStuckUpdate, { passive: true });
    window.addEventListener("resize", scheduleStuckUpdate, { passive: true });
    scheduleStuckUpdate();
  }

  function initFAQScrollSpy() {
    var sections = document.querySelectorAll(".faq-answers__group[id]");
    var navLinks = document.querySelectorAll("a.faq-answers__nav-link[href^='#']");
    if (!sections.length || !navLinks.length) return;

    var faqAnswersRoot = document.querySelector(".faq-answers");

    function closeAllFaqNavDetails() {
      if (!faqAnswersRoot) return;
      var nav = faqAnswersRoot.querySelector(".faq-answers__nav");
      if (!nav) return;
      nav.querySelectorAll("details.faq-answers__nav-details").forEach(function (d) {
        d.open = false;
      });
    }

    // section id -> nav links whose target (article or FAQ details) lives in that section
    var linkMap = {};
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      var hash = href.indexOf("#");
      var id = hash === -1 ? "" : href.slice(hash + 1);
      if (!id) return;
      var targetEl = document.getElementById(id);
      if (!targetEl) return;
      var section = targetEl.closest(".faq-answers__group");
      if (!section || !section.id) return;
      if (!linkMap[section.id]) linkMap[section.id] = [];
      linkMap[section.id].push(link);
    });

    function activeDetailInSection(sectionEl, threshold) {
      var details = sectionEl.querySelectorAll("details.faq-group__item");
      var last = null;
      details.forEach(function (d) {
        var top = window.scrollY + d.getBoundingClientRect().top;
        if (top <= threshold + 4) last = d;
      });
      return last;
    }

    function updateActive() {
      document.querySelectorAll(".faq-answers__nav-summary.has-active-child").forEach(function (s) {
        s.classList.remove("has-active-child");
      });
      closeAllFaqNavDetails();
      var headerEl = document.getElementById("site-header");
      var headerHeight = headerEl ? headerEl.offsetHeight : 0;
      var threshold = window.scrollY + headerHeight + 32;
      var firstSec = sections[0];
      var firstTop = window.scrollY + firstSec.getBoundingClientRect().top;

      /* Above the first FAQ group (e.g. hero / featured): no nav item should stay active */
      if (threshold < firstTop) {
        navLinks.forEach(function (l) {
          l.classList.remove("is-active");
        });
        return;
      }

      var chosen = null;
      var i;
      for (i = sections.length - 1; i >= 0; i--) {
        var sec = sections[i];
        var top = window.scrollY + sec.getBoundingClientRect().top;
        if (top <= threshold) {
          chosen = sec;
          break;
        }
      }
      var docEl = document.documentElement;
      var maxScroll = docEl.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY >= maxScroll - 2) {
        chosen = sections[sections.length - 1];
      }
      if (!chosen) {
        chosen = firstSec;
      }
      navLinks.forEach(function (l) {
        l.classList.remove("is-active");
      });
      var group = linkMap[chosen.id];
      if (group) {
        var sidebarNav = faqAnswersRoot ? faqAnswersRoot.querySelector(".faq-answers__nav") : null;
        var pillsContainer = faqAnswersRoot ? faqAnswersRoot.querySelector(".faq-answers__pills") : null;

        var sidebarLinksInGroup = group.filter(function (l) {
          return sidebarNav && sidebarNav.contains(l);
        });
        var sidebarSubs = sidebarLinksInGroup.filter(function (l) {
          return l.classList.contains("faq-answers__nav-link--sub");
        });

        var activeDetail = activeDetailInSection(chosen, threshold);
        var activeDetailId = activeDetail && activeDetail.id ? activeDetail.id : null;

        group.forEach(function (link) {
          var inSidebar = sidebarNav && sidebarNav.contains(link);
          var inPills = pillsContainer && pillsContainer.contains(link);

          if (inSidebar) {
            if (sidebarSubs.length) {
              if (link.classList.contains("faq-answers__nav-link--sub")) {
                var subHref = link.getAttribute("href") || "";
                var subId = subHref.indexOf("#") === 0 ? subHref.slice(1) : "";
                if (activeDetailId && subId === activeDetailId) {
                  link.classList.add("is-active");
                }
              }
            } else {
              link.classList.add("is-active");
            }
            return;
          }

          if (inPills) {
            var href = link.getAttribute("href");
            var sameHrefPills = group.filter(function (l) {
              return pillsContainer.contains(l) && l.getAttribute("href") === href;
            });
            if (sameHrefPills.length > 1 && link !== sameHrefPills[sameHrefPills.length - 1]) {
              return;
            }
            link.classList.add("is-active");
            return;
          }

          link.classList.add("is-active");
        });

        var summariesSeen = new WeakSet();
        group.forEach(function (link) {
          if (!link.classList.contains("faq-answers__nav-link--sub")) return;
          if (!link.classList.contains("is-active")) return;
          var parentDetails = link.closest(".faq-answers__nav-details");
          if (!parentDetails) return;
          parentDetails.open = true;
          var summary = parentDetails.querySelector(".faq-answers__nav-summary");
          if (summary && !summariesSeen.has(summary)) {
            summariesSeen.add(summary);
            summary.classList.add("has-active-child");
          }
        });
      }

      // Keep mobile section picker label in sync
      if (window._updateSectionPickerLabel) {
        window._updateSectionPickerLabel(chosen.id);
      }
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    requestAnimationFrame(function () {
      requestAnimationFrame(updateActive);
    });
  }

  function initFAQSidebarAccordion() {
    var nav = document.querySelector(".faq-answers__nav");
    if (!nav) return;

    nav.addEventListener("click", function (e) {
      var summary = e.target.closest(".faq-answers__nav-summary");
      if (!summary) return;
      var clickedDetails = summary.closest(".faq-answers__nav-details");
      if (!clickedDetails) return;

      // Close all other open details in this nav before this one opens
      nav.querySelectorAll(".faq-answers__nav-details").forEach(function (d) {
        if (d !== clickedDetails) d.open = false;
      });
    });
  }

  initFAQAccordion();
  initFAQAnswersNav();
  initFAQSectionPicker();
  initFAQScrollSpy();
  initFAQSidebarAccordion();
})();
