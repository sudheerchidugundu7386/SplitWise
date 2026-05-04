const mongoose = require("mongoose");
const Group = require("./models/Group");
const Expense = require("./models/Expense");
const User = require("./models/User");

mongoose.connect("mongodb://localhost:27017/billsplitter", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  const users = await User.find();
  console.log("Users:");
  users.forEach(u => console.log(u.email, u.name, u._id));

  const groups = await Group.find();
  console.log("\nGroups:");
  for (let group of groups) {
    console.log("Group:", group.groupId, "CreatedBy:", group.createdBy);
    console.log("Members:", group.members.map(m => ({name: m.name, email: m.email})));
    
    const expenses = await Expense.find({ groupId: group.groupId });
    console.log("Expenses count:", expenses.length);
    expenses.forEach(e => {
        console.log(`  PaidBy: ${e.paidBy}, Amount: ${e.amount}`);
        console.log(`  Splits:`, e.splits.map(s => `${s.member}: ${s.amount}`));
    });
  }
  process.exit(0);
}

run();
