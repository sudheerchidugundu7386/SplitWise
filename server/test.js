const axios = require("axios");

async function test() {
  try {
    const resReg = await axios.post("http://localhost:5000/api/auth/register", {
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    });
    console.log("Register Success:", resReg.data);
  } catch (err) {
    console.error("Register Error:", err.response?.data || err.message);
  }

  try {
    const resLogin = await axios.post("http://localhost:5000/api/auth/login", {
      email: "test@example.com",
      password: "password123"
    });
    console.log("Login Success:", resLogin.data);
  } catch (err) {
    console.error("Login Error:", err.response?.data || err.message);
  }
}

test();
