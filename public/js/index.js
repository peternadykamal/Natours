import "@babel/polyfill";
import { login, logout } from "./login";
import { updateUserData, updateUserPassword } from "./updateSettings";
import bookTour from "./stripe";
import displayMap from "./leaflet";

const mapEl = document.getElementById("map");
const formLoginEl = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const formUserDataEl = document.querySelector(".form-user-data");
const formUserPasswordEl = document.querySelector(".form-user-settings");
const bookTourBtn = document.getElementById("book-tour");

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
    const formObj = new FormData();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const photo = document.getElementById("photo").files[0];

    formObj.append("name", name);
    formObj.append("email", email);
    formObj.append("photo", photo);

    updateUserData(formObj);
  });
}

if (formUserPasswordEl) {
  formUserPasswordEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const passwordUpdateBtn = document.querySelector(".btn--save-password");
    const passwordCurrentEl = document.getElementById("password-current");
    const passwordEl = document.getElementById("password");
    const passwordConfirmEl = document.getElementById("password-confirm");

    passwordUpdateBtn.textContent = "Updating....";

    await updateUserPassword(
      passwordCurrentEl.value,
      passwordEl.value,
      passwordConfirmEl.value
    );

    passwordCurrentEl.value = "";
    passwordEl.value = "";
    passwordConfirmEl.value = "";
    passwordUpdateBtn.textContent = "Save password";
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", logout);
}

if (bookTourBtn) {
  bookTourBtn.addEventListener("click", async (e) => {
    e.target.textContent = "Processing...";
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
    e.target.textContent = "Book tour now!";
  });
}
