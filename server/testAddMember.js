const axios = require("axios");

async function testAddMember() {
  try {
    // 1. Login
    const resLogin = await axios.post("http://localhost:5000/api/auth/login", {
      email: "sudheer3@gmail.com",
      password: "password123"
    });
    const token = resLogin.data.token;
    console.log("Logged in!");

    // 2. Add member to YESf56DgkR
    const res = await axios.post("http://localhost:5000/api/groups/YESf56DgkR/members", 
      { name: "NewGuy" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Member added successfully!");
    console.log(res.data.members);
  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
    } else {
      console.error("Network Error:", err.message);
    }
  }
}

testAddMember();
