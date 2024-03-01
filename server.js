const dotenv = require("dotenv");

// the main purpose of the server.js
// 1. to start the server
// 2. to load the environment variables

// environment variables are global variables specific to the environment (OS) in which a process can
// access and use them.
// when running a process you will have access to environment variables that are set by the system
// can be configured either from the terminal or
// pressing win + r -> type SystemPropertiesAdvanced  -> Environment Variables
// you can also set environment variables when you start a process
// SET PORT=3000&&node server.js -> this will set the port to 3000 that can be accessed by process.env.PORT

// when developing an app, you will need to store some environment variables, some to
// configure the app, some to store sensitive data like database passwords.
// the conventional way to store environment variables is to create a .env file
// in the root of the project and store the environment variables there.

// the .env file should not be committed to the repository, it should be added to the .gitignore file
// some frameworks have a built-in support for .env files, but express does not have that
// so we will use a package called dotenv to load the environment variables from the .env file

// note also there specific environment variable is used by many express packages
// called NODE_ENV, it is used to specify the environment in which the app is running
// it can have three values, development, production, test

// another note, if you specify the environment variable in terminal,
// it will override the value in the .env file

dotenv.config({ path: `${__dirname}/config.env` });

// to access the environment variables, you can use the process.env object
// console.log(process.env);

const app = require("./app");

// START THE SERVER
const port = process.env.PORt || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}, http://127.0.0.1:${port}`);
});
