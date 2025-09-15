// Controlador de la pantalla de registro
import { registerUser } from "./services/accountService.js";

// Cache de elementos del DOM
const form = document.getElementById("registerForm");
const btn = document.getElementById("registerBtn");
const spinner = document.getElementById("registerSpinner");
const btnText = document.getElementById("registerText");
const msgBox = document.getElementById("registerMsg");

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

function setLoading(loading) {
  if (loading) {
    btn.disabled = true;
    spinner.classList.remove("hidden");
    btnText.textContent = "Creando...";
  } else {
    btn.disabled = false;
    spinner.classList.add("hidden");
    btnText.textContent = "Crear Cuenta";
  }
}

function resetMsgBox() {
  msgBox.className = "hidden mt-4 p-3 rounded-lg text-sm font-medium";
  msgBox.textContent = "";
}

function showMessage(text, type = "error") {
  msgBox.textContent = text;
  msgBox.className = "mt-4 p-3 rounded-lg text-sm font-medium";
  if (type === "error") {
    msgBox.classList.add(
      "bg-red-50",
      "border",
      "border-red-300",
      "text-red-700"
    );
  } else if (type === "success") {
    msgBox.classList.add(
      "bg-green-50",
      "border",
      "border-green-300",
      "text-green-700"
    );
  } else {
    msgBox.classList.add(
      "bg-gray-50",
      "border",
      "border-gray-300",
      "text-gray-700"
    );
  }
  msgBox.classList.remove("hidden");
}

function validateInputs() {
  const name = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!name || !email || !password || !confirmPassword) {
    return { valid: false, error: "Todos los campos son obligatorios." };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: "Las contraseñas no coinciden." };
  }
  if (password.length < 6) {
    return {
      valid: false,
      error: "La contraseña debe tener al menos 6 caracteres.",
    };
  }
  // Validación simple de email
  const emailRegex = /.+@.+\..+/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Formato de correo no válido." };
  }
  return { valid: true, data: { name, email, password } };
}

async function handleSubmit(e) {
  e.preventDefault();
  resetMsgBox();

  const { valid, error, data } = validateInputs();
  if (!valid) {
    showMessage(error);
    return;
  }

  setLoading(true);
  const token = localStorage.getItem("token");
  const result = await registerUser({ ...data, token });
  setLoading(false);

  if (!result.ok) {
    if (
      result.error?.toLowerCase().includes("no autorizado") ||
      result.error?.toLowerCase().includes("401")
    ) {
      showMessage(
        "No autorizado. Inicia sesión primero o habilita registro público."
      );
    } else {
      showMessage(result.error || "Error al crear la cuenta.");
    }
    return;
  }

  showMessage(
    "Cuenta creada correctamente. Redirigiendo al login...",
    "success"
  );
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

if (form) {
  form.addEventListener("submit", handleSubmit);
}
