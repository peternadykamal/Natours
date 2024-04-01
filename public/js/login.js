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
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export default login;
