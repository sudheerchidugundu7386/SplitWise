# SplitWise — Smart Group Bill Splitter

A full-stack web app for splitting shared expenses among friend groups, flat-mates, or trip groups. Settle dues instantly with **UPI payment links**. No login required — just share the link.

## ✨ Features

- **Create Groups** — Name your group, add 2–10 members, get a unique shareable URL
- **Add Expenses** — Track who paid, split equally or with custom amounts
- **Smart Settlements** — Minimum transactions algorithm reduces the number of payments needed
- **UPI Deep Links** — One-tap payments via any UPI app (GPay, PhonePe, Paytm, etc.)
- **PDF Export** — Download a complete expense summary as a styled PDF
- **No Login Required** — Anyone with the link can view and add expenses
- **Mobile-First UI** — Beautiful dark-mode interface with glassmorphism design

## 🛠 Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | React 19, Tailwind CSS 4, Vite |
| Backend    | Node.js, Express.js         |
| Database   | MongoDB + Mongoose           |
| PDF        | jsPDF                        |
| Icons      | Lucide React                 |
| IDs        | nanoid                       |

## 📁 Project Structure

```
├── server/                 # Backend API
│   ├── config/db.js        # MongoDB connection
│   ├── models/             # Mongoose schemas (Group, Expense)
│   ├── controllers/        # Business logic + settlement algorithm
│   ├── routes/             # Express route definitions
│   └── server.js           # Entry point
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # HomePage, GroupDashboard
│   │   ├── utils/          # API helpers, PDF export
│   │   └── index.css       # Tailwind + custom design system
│   └── index.html
├── .gitignore
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Clone & Install

```bash
# Server
cd server
cp .env.example .env     # Edit MONGODB_URI if needed
npm install

# Client
cd ../client
npm install
```

### 2. Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

### 3. Open the App

Visit **http://localhost:5173** in your browser.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create a new group |
| GET | `/api/groups/:groupId` | Get group details |
| POST | `/api/groups/:groupId/expenses` | Add an expense |
| GET | `/api/groups/:groupId/expenses` | List all expenses |
| DELETE | `/api/expenses/:expenseId` | Delete an expense |
| GET | `/api/groups/:groupId/balances` | Get balances & settlements |
| PUT | `/api/groups/:groupId/members/:name/upi` | Update member's UPI ID |

## 🧮 Settlement Algorithm

Uses a **greedy minimum transactions** approach:
1. Calculate net balance for each person (total paid − total owed)
2. Separate into creditors (+) and debtors (−)
3. Sort both by absolute value (descending)
4. Match largest debtor with largest creditor, transfer the minimum
5. Repeat until all balances are zero

This minimizes the total number of transactions needed to settle the group.

## 📱 UPI Deep Link Format

```
upi://pay?pa={upi_id}&pn={name}&am={amount}&cu=INR&tn=Group Bill Split
```

On mobile devices, tapping the "Pay via UPI" button opens the user's preferred UPI app.

## 📄 License

MIT
