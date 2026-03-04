import { projectTypeOptions, useCaseOptionsByProject } from "./usecase-config.js";

function getProjectTypeIcon(id) {
  if (id === "financial-transaction") {
    return `
      <svg class="ucm-v1-type-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M2.25 6.75L9 3L15.75 6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.75 7.5V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M7.5 7.5V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M10.5 7.5V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M14.25 7.5V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M2.25 15H15.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;
  }

  if (id === "long-term-repository") {
    return `
      <svg class="ucm-v1-type-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M2.25 6.75C2.25 5.92157 2.92157 5.25 3.75 5.25H7.5L9 6.75H14.25C15.0784 6.75 15.75 7.42157 15.75 8.25V13.5C15.75 14.3284 15.0784 15 14.25 15H3.75C2.92157 15 2.25 14.3284 2.25 13.5V6.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;
  }

  return `
    <svg class="ucm-v1-type-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3.75 7.5H8.25V15H3.75V7.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M9.75 3.75H14.25V15H9.75V3.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M5.25 9.75H6.75M5.25 12H6.75M11.25 6.75H12.75M11.25 9H12.75M11.25 11.25H12.75" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  `;
}

const state = {
  screen: "home", // home | variant1 | variant2
  selectedProjectType: "financial-transaction",
  selectedUseCase: null,
  dropdownOpen: false,
  selectedProjectTypeV2: "",
  theme: localStorage.getItem("prototype-theme") || "light",
};

const app = document.getElementById("app");

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
}

function renderThemeToggle() {
  return `
    <button type="button" class="proto-theme-toggle ${state.theme === "dark" ? "is-dark" : ""}" data-action="toggle-theme" aria-label="Toggle dark theme">
      <span class="proto-theme-toggle-track">
        <span class="proto-theme-toggle-thumb"></span>
      </span>
      <span class="proto-theme-toggle-label">Dark theme</span>
    </button>
  `;
}

function renderHome() {
  return `
    <div class="proto-home-wrap">
      <div class="proto-home-card">
        <div class="proto-home-theme">${renderThemeToggle()}</div>
        <h1>Оберіть прототип</h1>
        <p>Одна сторінка з двома flow, як у Figma Final prototypes.</p>
        <div class="proto-home-actions">
          <button type="button" class="proto-choice" data-action="open-variant1">Варіант 1</button>
          <button type="button" class="proto-choice" data-action="open-variant2">Варіант 2</button>
        </div>
      </div>
    </div>
  `;
}

function renderVariantSwitcher(active) {
  return `
    <div class="proto-topbar">
      <button type="button" class="proto-topbar-back" data-action="go-home">← Назад</button>
      <div class="proto-topbar-tabs">
        <button type="button" class="proto-tab ${active === "variant1" ? "is-active" : ""}" data-action="open-variant1">Варіант 1</button>
        <button type="button" class="proto-tab ${active === "variant2" ? "is-active" : ""}" data-action="open-variant2">Варіант 2</button>
      </div>
      <div class="proto-topbar-theme">${renderThemeToggle()}</div>
    </div>
  `;
}

function renderVariant1() {
  const selectedUseCases = useCaseOptionsByProject[state.selectedProjectType] || [];

  return `
    ${renderVariantSwitcher("variant1")}
    <div class="ucm-overlay" role="presentation">
      <div class="ucm-modal ucm-modal--v1" role="dialog" aria-modal="true" aria-labelledby="ucm-title-v1">
        <header class="ucm-header">
          <h2 id="ucm-title-v1" class="ucm-title">Pick the project type you are working on</h2>
          <p class="ucm-subtitle">Your selection helps us prioritize what matters most to our clients</p>
        </header>

        <section class="ucm-v1-body">
          <div class="ucm-v1-types">
            ${projectTypeOptions
              .map((option, index) => {
                const selected = option.id === state.selectedProjectType;
                return `
                  <button type="button" class="ucm-v1-type ${selected ? "is-selected" : ""}" data-action="select-project" data-id="${option.id}" style="--item-index:${index + 1}">
                    <span class="ucm-v1-type-left" aria-hidden="true">
                      <span class="ucm-v1-type-icon-wrap">
                        ${getProjectTypeIcon(option.id)}
                      </span>
                    </span>
                    <span class="ucm-v1-type-content">
                      <span class="ucm-v1-type-title">${option.title}</span>
                      <span class="ucm-v1-type-description">${option.description}</span>
                    </span>
                  </button>
                `;
              })
              .join("")}
          </div>

          <div class="ucm-v1-usecases">
            ${selectedUseCases
              .map((option, index) => {
                const selected = option.id === state.selectedUseCase;
                return `
                  <button type="button" class="ucm-v1-usecase ${selected ? "is-selected" : ""}" data-action="select-usecase" data-id="${option.id}" style="--item-index:${index + 1}">
                    <img src="${option.icon}" alt="" class="ucm-v1-usecase-icon" />
                    <span class="ucm-v1-usecase-label">${option.title}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </section>

        <footer class="ucm-footer ucm-footer--spread">
          <button type="button" class="ucm-link-action" data-action="skip">Ask me later</button>
          <button type="button" class="ucm-primary-action ${state.selectedUseCase ? "" : "is-disabled"}" ${
            state.selectedUseCase ? "" : "disabled"
          } data-action="save-v1">Save &amp; go to project <span aria-hidden="true">&#x2192;</span></button>
        </footer>
      </div>
    </div>
  `;
}

function renderVariant2() {
  const selectLabel = state.selectedProjectTypeV2 || "Select";
  const selectTextClass = state.selectedProjectTypeV2 ? "is-value" : "is-placeholder";
  return `
    ${renderVariantSwitcher("variant2")}
    <div class="ucm-overlay" role="presentation">
      <div class="ucm-modal ucm-modal--v2" role="dialog" aria-modal="true" aria-labelledby="ucm-title-v2">
        <header class="ucm-header ucm-header--left">
          <h2 id="ucm-title-v2" class="ucm-title">Project type</h2>
          <p class="ucm-subtitle">Select project type to help us improve the product for your needs</p>
        </header>

        <section class="ucm-v2-body">
          <div class="ucm-v2-field-wrap">
            <p class="ucm-v2-label">Label</p>
            <button type="button" class="ucm-v2-select" data-action="toggle-dropdown">
              <span class="${selectTextClass}">${selectLabel}</span>
              <span class="ucm-v2-chevron ${state.dropdownOpen ? "is-open" : ""}">
                <svg class="ucm-v2-chevron-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
            ${
              state.dropdownOpen
                ? `<div class="ucm-v2-dropdown">
                    ${projectTypeOptions
                      .map(
                        (option) => `<button type="button" class="ucm-v2-option" data-action="select-project-v2" data-id="${option.title}">${option.title}</button>`
                      )
                      .join("")}
                  </div>`
                : ""
            }
            <p class="ucm-v2-hint">Hint</p>
          </div>
        </section>

        <footer class="ucm-footer ucm-footer--spread">
          <button type="button" class="ucm-link-action" data-action="skip">Ask me later</button>
          <button type="button" class="ucm-primary-action ${state.selectedProjectTypeV2 ? "" : "is-disabled"}" ${
            state.selectedProjectTypeV2 ? "" : "disabled"
          } data-action="save-v2">Save &amp; go to project <span aria-hidden="true">&#x2192;</span></button>
        </footer>
      </div>
    </div>
  `;
}

function render() {
  applyTheme();

  if (state.screen === "home") {
    app.innerHTML = renderHome();
    return;
  }

  if (state.screen === "variant2") {
    app.innerHTML = renderVariant2();
    return;
  }

  app.innerHTML = renderVariant1();
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.getAttribute("data-action");
  const id = target.getAttribute("data-id");

  if (action === "toggle-theme") {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("prototype-theme", state.theme);
    render();
    return;
  }

  if (action === "open-variant1") {
    state.screen = "variant1";
    state.dropdownOpen = false;
    render();
    return;
  }

  if (action === "open-variant2") {
    state.screen = "variant2";
    render();
    return;
  }

  if (action === "go-home") {
    state.screen = "home";
    state.dropdownOpen = false;
    render();
    return;
  }

  if (action === "select-project" && id) {
    state.selectedProjectType = id;
    state.selectedUseCase = null;
    render();
    return;
  }

  if (action === "select-usecase" && id) {
    state.selectedUseCase = id;
    render();
    return;
  }

  if (action === "toggle-dropdown") {
    state.dropdownOpen = !state.dropdownOpen;
    render();
    return;
  }

  if (action === "select-project-v2" && id) {
    state.selectedProjectTypeV2 = id;
    state.dropdownOpen = false;
    render();
    return;
  }

  if (action === "skip") {
    alert("Skipped. Continue to project.");
    return;
  }

  if (action === "save-v1") {
    if (!state.selectedUseCase) return;
    const selectedUseCases = useCaseOptionsByProject[state.selectedProjectType] || [];
    const selectedUseCaseOption = selectedUseCases.find((option) => option.id === state.selectedUseCase);
    alert(`Saved Variant 1: ${state.selectedProjectType} / ${selectedUseCaseOption ? selectedUseCaseOption.title : state.selectedUseCase}`);
    return;
  }

  if (action === "save-v2") {
    if (!state.selectedProjectTypeV2) return;
    alert(`Saved Variant 2: ${state.selectedProjectTypeV2}`);
  }
});

applyTheme();
render();
