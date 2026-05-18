This repository contains a plain HTML/CSS/JavaScript web application.

There is:
- no build step
- no package manager
- no framework
- no transpilation
- no backend runtime
- no automated test suite

Agents should prioritize:
- simplicity
- readability
- browser compatibility
- minimal file count
- low complexity
- fast page load

Avoid introducing tooling or abstractions unless explicitly requested.

---

## Project Structure

Keep the structure shallow and easy to navigate.

Do not introduce:

* webpack
* vite
* react
* vue
* typescript
* npm
* bundlers
* transpilers

unless explicitly requested.

---

## HTML Rules

* Use semantic HTML whenever practical.
* Prefer native browser behavior over JavaScript solutions.
* Keep DOM depth reasonable.
* Use accessible markup:

  * labels for inputs
  * alt text for images
  * button elements for actions
  * proper heading hierarchy

Avoid unnecessary wrapper divs.

---

## CSS Rules

* Prefer simple reusable classes.
* Avoid deeply nested selectors.
* Prefer flexbox/grid over positioning hacks.
* Keep specificity low.
* Organize CSS by section/component.

Do not introduce:

* Tailwind
* Bootstrap
* CSS-in-JS
* Sass/Less

unless explicitly requested.

### Preferred CSS Style

```css
.card {
  padding: 1rem;
  border-radius: 8px;
}
```

Avoid:

```css
body div.main .container .card .content {
}
```

---

## JavaScript Rules

* Use modern vanilla JavaScript.
* Prefer small pure functions.
* Avoid global state where possible.
* Prefer `const` over `let`.
* Use event delegation when appropriate.
* Keep DOM queries centralized and minimal.

### Preferred Style

```js
const button = document.querySelector('.menu-toggle');

button?.addEventListener('click', toggleMenu);
```

### Avoid

```js
window.onclick = function () {
  // large anonymous logic block
};
```

Do not introduce:

* frameworks
* state managers
* reactive runtimes
* dependency injection systems

unless explicitly requested.

---

## Browser Compatibility

Target:

* latest Chrome
* latest Firefox
* latest Safari
* latest Edge

Avoid experimental APIs unless required.

Prefer progressive enhancement.

---

## Performance Guidelines

Agents should:

* minimize JavaScript payload size
* avoid unnecessary DOM updates
* lazy-load large images when useful
* avoid layout thrashing
* reduce render-blocking assets

Prefer CSS animations over JavaScript animations.

---

## Dependencies

This project intentionally avoids dependencies.

Before adding any third-party library:

1. verify the feature cannot be implemented simply in vanilla JS
2. justify the dependency clearly
3. prefer copy-paste utilities over large frameworks

Small standalone libraries are preferred over ecosystems.

---

## File Modification Rules

* Prefer editing existing files over creating new files.
* Avoid splitting files prematurely.
* Keep related logic together.
* Do not reorganize directories without a clear reason.

For small projects:

* one JS file is acceptable
* one CSS file is acceptable

Do not over-engineer structure.

---

## Debugging Workflow

When debugging:

1. identify the minimal failing behavior
2. inspect console errors first
3. verify DOM structure
4. verify event listeners
5. isolate CSS/layout issues separately

Prefer targeted fixes over rewrites.

---

## Accessibility

Agents should:

* preserve keyboard navigation
* maintain visible focus states
* avoid inaccessible custom controls
* ensure sufficient contrast
* avoid relying solely on color

Use native elements whenever possible.

---

## Responsive Design

Design should work on:

* mobile
* tablet
* desktop

Prefer fluid layouts.

Avoid:

* fixed-width layouts
* horizontal scrolling
* viewport-dependent hacks

---

## Forbidden Changes

Agents must NOT introduce:

* npm
* node_modules
* build pipelines
* transpilers
* Docker
* CI/CD systems
* test frameworks
* linting setups
* formatters
* monorepo tooling

unless explicitly requested.

---

## Preferred Workflow

1. Read existing code first
2. Preserve current style conventions
3. Make the smallest reasonable change
4. Verify behavior manually
5. Keep implementation understandable

---

## Code Quality Standard

Good changes are:

* small
* readable
* easy to debug
* dependency-free
* browser-friendly

Bad changes are:

* framework-driven rewrites
* abstraction-heavy patterns
* unnecessary tooling
* excessive file splitting
* speculative architecture

---

## Manual Verification

Since there is no automated testing:

Agents should manually verify:

* page loads without console errors
* interactions still function
* layout works at common screen sizes
* no obvious visual regressions exist

Do not claim tests were run.

Instead say:

```txt
Manually verified in browser.
```

if verification was performed.

---

## Escalation Rules

Request human review before:

* adding dependencies
* restructuring directories
* changing browser support targets
* rewriting major UI sections
* introducing persistence/storage changes

When uncertain, prefer the simpler implementation.
