// ui/a11y.js — HAND-MAINTAINED. Keyboard + screen-reader pass (#19).
// Chips and collapsible headers are <div>s with inline onclick handlers.
// This module gives them button semantics and Enter/Space activation,
// including content rendered after load (MutationObserver).
export function enhanceA11y(root = document) {
  root.querySelectorAll('[onclick]:not(button):not(a):not(input):not(select):not(textarea)').forEach((el) => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target && e.target.closest ? e.target.closest('[role="button"][tabindex]') : null;
    if (!t || !t.hasAttribute('onclick')) return;
    e.preventDefault();
    t.click();
  });
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (!n || n.nodeType !== 1) return;
        if (n.hasAttribute('onclick')) {
          if (!n.hasAttribute('tabindex')) n.setAttribute('tabindex', '0');
          if (!n.hasAttribute('role')) n.setAttribute('role', 'button');
        }
        enhanceA11y(n);
      });
    }
  });
  if (document.body) mo.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => enhanceA11y());
}
