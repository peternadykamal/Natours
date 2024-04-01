import "@babel/polyfill";
import login from "./login";
import displayMap from "./leaflet";

const mapEl = document.getElementById("map");
const formEl = document.querySelector(".form");

if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);
  displayMap(locations);
}

if (formEl) {
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}
