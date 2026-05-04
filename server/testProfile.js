const axios = require("axios");

async function testProfile() {
  try {
    // 1. Login to get a token
    const resLogin = await axios.post("http://localhost:5000/api/auth/login", {
      email: "test@example.com",
      password: "password123"
    });
    const token = resLogin.data.token;
    console.log("Logged in!");

    // 2. Fetch profile
    const resProfile = await axios.get("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Profile fetched successfully!");
    console.log(resProfile.data.trips.length, "trips found.");
  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
    } else {
      console.error("Network Error:", err.message);
    }
  }
}

testProfile();
