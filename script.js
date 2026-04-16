const storageKey = "entre-nosotros-registro";

const state = {
  emotion: "Tristeza",
  conversationNeed: "Escucha",
  status: "Estoy escribiendo",
  intensity: 6
};

const textFields = [
  "situacion",
  "molestia",
  "silencio",
  "necesidad",
  "fondo",
  "perspectiva",
  "apertura",
  "comprension",
  "acuerdo"
];

const toast = document.getElementById("toast");
const intensityRange = document.getElementById("intensityRange");
const intensityValue = document.getElementById("intensityValue");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
}

function activateTab(button) {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  tabContents.forEach((panel) => {
    const isActive = panel.id === button.getAttribute("aria-controls");
    panel.classList.toggle("active", isActive);
  });
}

function selectChoice(selector, value, key) {
  document.querySelectorAll(selector).forEach((button) => {
    const match = Object.values(button.dataset).includes(value);
    button.classList.toggle("selected", match);
  });

  state[key] = value;
  updateSummary();
}

function selectStatus(button) {
  document.querySelectorAll(".status-pill").forEach((pill) => {
    pill.classList.toggle("active", pill === button);
  });
  state.status = button.textContent.trim();
}

function buildSummaryLine(text, fallback) {
  if (!text || !text.trim()) {
    return fallback;
  }

  const compact = text.trim().replace(/\s+/g, " ");
  return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
}

function gatherFormData() {
  return textFields.reduce((accumulator, id) => {
    accumulator[id] = document.getElementById(id).value.trim();
    return accumulator;
  }, {});
}

function saveState() {
  const payload = {
    ...gatherFormData(),
    ...state
  };

  localStorage.setItem(storageKey, JSON.stringify(payload));
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    updateSummary();
    return;
  }

  try {
    const payload = JSON.parse(saved);

    textFields.forEach((id) => {
      if (payload[id]) {
        document.getElementById(id).value = payload[id];
      }
    });

    if (payload.emotion) {
      state.emotion = payload.emotion;
      selectChoice(".emotion-choices .choice-button", payload.emotion, "emotion");
    }

    if (payload.conversationNeed) {
      state.conversationNeed = payload.conversationNeed;
      selectChoice('.compact-field .choice-button', payload.conversationNeed, "conversationNeed");
    }

    if (payload.status) {
      state.status = payload.status;
      document.querySelectorAll(".status-pill").forEach((button) => {
        button.classList.toggle("active", button.textContent.trim() === payload.status);
      });
    }

    if (payload.intensity) {
      state.intensity = Number(payload.intensity);
      intensityRange.value = String(payload.intensity);
      intensityValue.textContent = String(payload.intensity);
    }

    updateSummary();
  } catch {
    updateSummary();
  }
}

function updateSummary() {
  const data = gatherFormData();

  document.getElementById("summarySituation").textContent =
    buildSummaryLine(data.situacion || data.molestia, "Cuando comiences a escribir, aquí aparecerá una síntesis de la situación.");

  document.getElementById("summaryEmotion").textContent =
    `${state.emotion} con una intensidad de ${state.intensity}/10. ${
      buildSummaryLine(data.silencio || data.fondo, "Todavía no has desarrollado cómo te impactó internamente.")
    }`;

  document.getElementById("summaryNeed").textContent =
    `${buildSummaryLine(data.necesidad, "Aún no has nombrado la necesidad principal.")} Necesitas sobre todo: ${state.conversationNeed.toLowerCase()}.`;

  document.getElementById("summaryOpening").textContent =
    buildSummaryLine(
      data.apertura || data.comprension,
      "Quiero hablar contigo de algo que me afectó, porque me importa que podamos entendernos mejor y cuidar nuestra relación."
    );
}

function clearForm() {
  textFields.forEach((id) => {
    document.getElementById(id).value = "";
  });

  state.emotion = "Tristeza";
  state.conversationNeed = "Escucha";
  state.status = "Estoy escribiendo";
  state.intensity = 6;

  intensityRange.value = "6";
  intensityValue.textContent = "6";

  selectChoice(".emotion-choices .choice-button", state.emotion, "emotion");
  selectChoice(".compact-field .choice-button", state.conversationNeed, "conversationNeed");

  document.querySelectorAll(".status-pill").forEach((button) => {
    button.classList.toggle("active", button.textContent.trim() === state.status);
  });

  localStorage.removeItem(storageKey);
  updateSummary();
  showToast("El registro se limpió.");
}

function initializeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => activateTab(button));
});

document.querySelectorAll("[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

document.querySelectorAll(".emotion-choices .choice-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectChoice(".emotion-choices .choice-button", button.dataset.emotion, "emotion");
  });
});

document.querySelectorAll(".compact-field .choice-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectChoice(".compact-field .choice-button", button.dataset.need, "conversationNeed");
  });
});

document.querySelectorAll(".status-pill").forEach((button) => {
  button.addEventListener("click", () => selectStatus(button));
});

textFields.forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    updateSummary();
  });
});

intensityRange.addEventListener("input", (event) => {
  state.intensity = Number(event.target.value);
  intensityValue.textContent = event.target.value;
  updateSummary();
});

document.getElementById("saveEntry").addEventListener("click", () => {
  saveState();
  showToast("Tu reflexión quedó guardada en este navegador.");
});

document.getElementById("clearForm").addEventListener("click", clearForm);
document.getElementById("generateSummary").addEventListener("click", () => {
  updateSummary();
  showToast("Resumen actualizado.");
});

document.getElementById("focusModeToggle").addEventListener("click", (event) => {
  const isActive = document.body.classList.toggle("focus-mode");
  event.currentTarget.setAttribute("aria-pressed", String(isActive));
  event.currentTarget.textContent = isActive ? "Desactivar modo calma" : "Activar modo calma";
});

initializeReveal();
loadState();
