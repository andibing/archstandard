// Sidebar anchor scroll-spy.
//
// Starlight's left sidebar matches active state by pathname only. Sidebar
// items written as anchors within a single page (e.g. "5.1 ... → /standard/
// 5-lifecycle/#51-software-development--cicd") never get the active
// indicator out of the box.
//
// This script:
//   1. On load and on `hashchange`, marks the sidebar item whose `link`
//      matches the current URL hash as active.
//   2. On scroll (throttled), tracks which H2/H3 is closest to the top of
//      the viewport and marks the corresponding sidebar anchor as active.
//   3. Clears the active indicator from the section's pathname-matched
//      "(overview)" item while a more specific anchor is active, then
//      restores it when scrolled to the very top.
//
// Vanilla JS, no dependencies. Tiny, defers cleanly, no-ops if the page
// has no anchor sub-items in the sidebar.

(function () {
	'use strict';

	const ACTIVE_ATTR = 'data-anchor-active';

	function getSidebarAnchorLinks() {
		// Sidebar links whose href contains a hash (e.g. /v1/standard/.../#xx)
		// AND whose pathname matches the current page. These are the anchor
		// sub-items for the currently visible section.
		const all = document.querySelectorAll(
			'a[href*="#"]:not([href^="#"])'
		);
		const here = location.pathname;
		const matches = [];
		for (const a of all) {
			try {
				const u = new URL(a.href, location.origin);
				if (u.pathname === here && u.hash && u.hash.length > 1) {
					// Only consider links inside the sidebar nav, not in main content.
					if (a.closest('nav') || a.closest('starlight-sidebar')) {
						matches.push({ el: a, hash: u.hash });
					}
				}
			} catch (_) { /* ignore malformed */ }
		}
		return matches;
	}

	function getOverviewSidebarLink() {
		// The "Section X (overview)" item that lives in the sidebar — its href
		// matches the current pathname exactly with no hash.
		const here = location.pathname;
		const all = document.querySelectorAll('a[aria-current="page"]');
		for (const a of all) {
			try {
				const u = new URL(a.href, location.origin);
				if (u.pathname === here && !u.hash) {
					if (a.closest('nav') || a.closest('starlight-sidebar')) {
						return a;
					}
				}
			} catch (_) { /* ignore */ }
		}
		return null;
	}

	let anchorLinks = [];
	let overviewLink = null;
	let observedHeadings = [];

	function setActiveByHash(hash) {
		// Remove previous anchor-active state
		for (const { el } of anchorLinks) {
			el.removeAttribute(ACTIVE_ATTR);
		}
		// If no hash, restore overview link as the visible "current"
		if (!hash) {
			if (overviewLink) overviewLink.setAttribute('aria-current', 'page');
			return;
		}
		// Find matching sidebar anchor and mark it active
		let matched = false;
		for (const { el, hash: h } of anchorLinks) {
			if (h === hash) {
				el.setAttribute(ACTIVE_ATTR, 'true');
				matched = true;
				break;
			}
		}
		// When a sub-anchor is active, dim the overview "(overview)" indicator
		// — there's only one "you are here" at a time.
		if (matched && overviewLink) {
			overviewLink.removeAttribute('aria-current');
		} else if (overviewLink) {
			overviewLink.setAttribute('aria-current', 'page');
		}
	}

	let ticking = false;
	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			ticking = false;
			if (anchorLinks.length === 0) return;

			// Find the heading closest to (but at-or-above) the viewport top
			// with a small margin so the user sees the section heading just
			// before its content scrolls into prominence.
			const margin = 96; // px, allows for sticky header height
			let active = null;
			for (const h of observedHeadings) {
				const rect = h.getBoundingClientRect();
				if (rect.top - margin <= 0) {
					active = h;
				} else {
					break;
				}
			}
			if (active) {
				setActiveByHash('#' + active.id);
			} else {
				// Above all headings — clear sub-anchor active, restore overview
				setActiveByHash('');
			}
		});
	}

	function init() {
		anchorLinks = getSidebarAnchorLinks();
		overviewLink = getOverviewSidebarLink();
		if (anchorLinks.length === 0) return; // no anchor items here, nothing to do

		// Headings to watch — match the IDs referenced by sidebar anchors
		const wantedIds = new Set(anchorLinks.map((x) => x.hash.slice(1)));
		observedHeadings = [];
		const allHeadings = document.querySelectorAll('main h2[id], main h3[id]');
		for (const h of allHeadings) {
			if (wantedIds.has(h.id)) observedHeadings.push(h);
		}

		// Initial state from URL hash, then attach listeners
		setActiveByHash(location.hash || '');
		window.addEventListener('hashchange', () => setActiveByHash(location.hash || ''));
		window.addEventListener('scroll', onScroll, { passive: true });
		// Also re-evaluate on resize (sticky header may change height)
		window.addEventListener('resize', onScroll);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
