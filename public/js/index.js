import "@babel/polyfill";
import { login, logout } from "./login";
import { updateUserData } from "./updateSettings";
import displayMap from "./leaflet";

const mapEl = document.getElementById("map");
const formLoginEl = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const formUserDataEl = document.querySelector(".form-user-data");

if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);
  displayMap(locations);
}

if (formLoginEl) {
  formLoginEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (formUserDataEl) {
  formUserDataEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    updateUserData(name, email);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", logout);
}
