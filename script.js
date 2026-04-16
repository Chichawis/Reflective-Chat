const storageKey = "nuestro-rinconcito-registro";

const state = {
  emotion: "Triste",
  intensity: 5,
  status: "Aún lo estoy pensando"
};

const textFields = [
  "situacion",
  "molestia",
  "silencio",
  "necesidad",
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

function activateStep(button) {
  document.querySelectorAll(".step-tab").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });

  document.querySelectorAll(".step-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === button.getAttribute("aria-controls"));
  });
}

function pickEmotion(value) {
  document.querySelectorAll(".feeling-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.emotion === value);
  });
  state.emotion = value;
  updateSummary();
}

function pickStatus(button) {
  document.querySelectorAll(".tag-button").forEach((item) => {
    item.classList.toggle("active", item === button);
  });
  state.status = button.textContent.trim();
}

function shortText(text, fallback) {
  if (!text || !text.trim()) {
    return fallback;
  }

  const compact = text.trim().replace(/\s+/g, " ");
  return compact.length > 170 ? `${compact.slice(0, 167)}...` : compact;
}

function getFormData() {
  return textFields.reduce((acc, id) => {
    acc[id] = document.getElementById(id).value.trim();
    return acc;
  }, {});
}

function updateSummary() {
  const data = getFormData();

  document.getElementById("summarySituation").textContent =
    shortText(data.situacion || data.molestia, "Aquí aparecerá un resumen de la situación.");

  document.getElementById("summaryEmotion").textContent =
    `${state.emotion} (${state.intensity}/10). ${shortText(data.silencio, "Aquí se verá reflejada tu emoción principal.")}`;

  document.getElementById("summaryNeed").textContent =
    shortText(data.necesidad || data.comprension, "Aquí se juntará lo más importante que quieras comunicar.");

  document.getElementById("summaryOpening").textContent =
    shortText(
      data.apertura || "Quiero hablar contigo de algo que me movió, porque prefiero decirlo con calma a guardármelo.",
      "Aquí aparecerá una frase base para empezar la conversación con más calma."
    );
}

function saveState() {
  const payload = {
    ...getFormData(),
    ...state
  };

  localStorage.setItem(storageKey, JSON.stringify(payload));
  showToast("Se guardó tu reflexión en este navegador.");
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
      pickEmotion(payload.emotion);
    }

    if (payload.intensity) {
      state.intensity = Number(payload.intensity);
      intensityRange.value = String(payload.intensity);
      intensityValue.textContent = String(payload.intensity);
    }

    if (payload.status) {
      state.status = payload.status;
      document.querySelectorAll(".tag-button").forEach((button) => {
        button.classList.toggle("active", button.textContent.trim() === payload.status);
      });
    }

    updateSummary();
  } catch {
    updateSummary();
  }
}

function clearForm() {
  textFields.forEach((id) => {
    document.getElementById(id).value = "";
  });

  state.emotion = "Triste";
  state.intensity = 5;
  state.status = "Aún lo estoy pensando";

  intensityRange.value = "5";
  intensityValue.textContent = "5";

  pickEmotion(state.emotion);
  document.querySelectorAll(".tag-button").forEach((button) => {
    button.classList.toggle("active", button.textContent.trim() === state.status);
  });

  localStorage.removeItem(storageKey);
  updateSummary();
  showToast("Se borró el contenido.");
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

document.querySelectorAll(".step-tab").forEach((button) => {
  button.addEventListener("click", () => activateStep(button));
});

document.querySelectorAll("[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

document.querySelectorAll(".feeling-button").forEach((button) => {
  button.addEventListener("click", () => pickEmotion(button.dataset.emotion));
});

document.querySelectorAll(".tag-button").forEach((button) => {
  button.addEventListener("click", () => pickStatus(button));
});

textFields.forEach((id) => {
  document.getElementById(id).addEventListener("input", updateSummary);
});

intensityRange.addEventListener("input", (event) => {
  state.intensity = Number(event.target.value);
  intensityValue.textContent = event.target.value;
  updateSummary();
});

document.getElementById("saveEntry").addEventListener("click", saveState);
document.getElementById("generateSummary").addEventListener("click", () => {
  updateSummary();
  showToast("Resumen actualizado.");
});
document.getElementById("clearForm").addEventListener("click", clearForm);

document.getElementById("themeToggle").addEventListener("click", (event) => {
  const active = document.body.classList.toggle("soft-mode");
  event.currentTarget.setAttribute("aria-pressed", String(active));
  event.currentTarget.textContent = active ? "Modo durazno" : "Modo suave";
});

initReveal();
loadState();
