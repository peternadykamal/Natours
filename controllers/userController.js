const notDefinedRoute = function (req, res) {
  res.status(500).json({
    status: "errer",
    message: "This route is not yet defined",
  });
};

const getAllUsers = notDefinedRoute;
const createUser = notDefinedRoute;
const getUser = notDefinedRoute;
const updateUser = notDefinedRoute;
const deleteUser = notDefinedRoute;

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
