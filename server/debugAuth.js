const mongoose = require("mongoose");
const Group = require("./models/Group");
const User = require("./models/User");

mongoose.connect("mongodb://localhost:27017/billsplitter");

async function run() {
  const group = await Group.findOne({ groupId: "YESf56DgkR" });
  const user = await User.findOne({ email: "sudheer3@gmail.com" });

  if (group && user) {
    console.log("Group CreatedBy type:", typeof group.createdBy, group.createdBy);
    console.log("User _id type:", typeof user._id, user._id);
    console.log("Comparison (toString):", group.createdBy.toString() === user._id.toString());
    console.log("Comparison (direct):", group.createdBy === user._id);
  } else {
    console.log("Group or User not found");
  }
  process.exit(0);
}

run();
