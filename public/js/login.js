/* eslint-env browser*/
/* global axios */

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
      alert("logged in successfuly");
      window.setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data.message);
  }
};

document.querySelector(".form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});
