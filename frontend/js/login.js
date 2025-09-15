// Controlador de la pantalla de login
// Responsabilidad: interacción con el DOM y uso de servicios.
import { loginRequest } from "./services/authService.js";

let token = "";

// Cache de elementos
const form = document.querySelector("form");
const outputEl = document.getElementById("output");
const loginBtn = document.getElementById("loginBtn");
const spinner = document.getElementById("loginSpinner");
const loginText = document.getElementById("loginText");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

function showMessage(msg, type = "error") {
  if (!outputEl) return;
  outputEl.textContent = msg;
  outputEl.classList.remove("hidden");
  outputEl.classList.toggle("border-red-300", type === "error");
  outputEl.classList.toggle("bg-red-50", type === "error");
  outputEl.classList.toggle("text-red-800", type === "error");
}

function clearMessage() {
  outputEl.classList.add("hidden");
  outputEl.textContent = "";
}

function setLoading(loading) {
  if (loading) {
    loginBtn.disabled = true;
    spinner.classList.remove("d-none");
    loginText.textContent = "Ingresando...";
  } else {
    loginBtn.disabled = false;
    spinner.classList.add("d-none");
    loginText.textContent = "Iniciar Sesión";
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  clearMessage();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    showMessage("Ingresá tu correo y contraseña.");
    return;
  }

  setLoading(true);
  const result = await loginRequest(email, password);
  setLoading(false);

  if (!result.ok) {
    showMessage(result.error || "Error al iniciar sesión.");
    return;
  }

  token = result.token;
  localStorage.setItem("token", token);
  if (result.userId) localStorage.setItem("userId", result.userId);
  window.location.href = "my_favorite_cities.html";
}

if (form) {
  form.addEventListener("submit", handleSubmit);
}
