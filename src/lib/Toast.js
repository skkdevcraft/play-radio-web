/* =========================================================
   TOAST
========================================================= */
export const Toast = (() => {
  let timer = null;
  const el = document.getElementById('toast');
  function show(msg, isError = false) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast is-visible' + (isError ? ' is-error' : '');
    clearTimeout(timer);
    timer = setTimeout(() => { if (el) el.className = 'toast'; }, 2500);
  }
  return { show };
})();
