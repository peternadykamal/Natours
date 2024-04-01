import axios from "axios";
import showAlert from "./alerts";

const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "logged in successfuly");
      window.setTimeout(() => {
        window.location.href = "/";
      }, 800);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });

    if (res.data.status === "success") {
      window.location.reload(true);
    }
  } catch (error) {
    showAlert("error", "Error logging out! Try again.");
  }
};

export { login, logout };
