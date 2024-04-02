import axios from "axios";
import showAlert from "./alerts";

const updateUserData = async (data) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/me",
      data,
    });

    console.log("as;dlfsd");
    if (res.data.status === "success") {
      showAlert("success", "your data updated successfully");
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

const updateUserPassword = async (
  password,
  newPassword,
  newPasswordConfirm
) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/updatePassword",
      data: {
        password,
        newPassword,
        newPasswordConfirm,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "your password updated successfully");
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export { updateUserData, updateUserPassword };
