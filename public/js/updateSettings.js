import axios from "axios";
import showAlert from "./alerts";

const updateUserData = async (name, email) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/me",
      data: {
        name: name,
        email: email,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "your data updated successfully");
      window.setTimeout(() => {
        window.location.href = "/";
      }, 800);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { updateUserData };
