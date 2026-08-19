import express, { Request, Response } from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

// types 

type User = {
  username: string;
  password: string;
};

type Balance = {
  available: number;
  locked: number;
};

type UserBalances = {
  [asset: string]: Balance;
};

type Stock = {
  id: number;
  title: string;
  symbol: string;
};

type OrderSide = "BUY" | "SELL";
type OrderType = "LIMIT" | "MARKET";

type Order = {
  id: string;
  userId: string;
  side: OrderSide;
  type: OrderType;
  symbol: string;
  price?: number;
  qty: number;
  filledQty: number;
  status: "OPEN" | "FILLED" | "CANCELLED";
};

type Fill = {
  id: string;
  orderId: string;
  symbol: string;
  price: number;
  qty: number;
};

type PriceLevel = {
  [price: string]: number;
};

type OrderBookSide = {
  bids: PriceLevel;
  asks: PriceLevel;
};

type OrderBook = {
  [symbol: string]: OrderBookSide;
};

// --- In-memory state ---

let id: number = 1;

const USERS = new Map<string, User>();

const ORDERS: Order[] = [];

const FILLS: Fill[] = [];

const STOCKS: Stock[] = [
  {
    id: 1,
    title: "AXIS BANK",
    symbol: "AXIS",
  },
  {
    id: 2,
    title: "HDFC BANK",
    symbol: "HDFC",
  },
  {
    id: 3,
    title: "TATA Steel",
    symbol: "TATA",
  },
];

const BALANCES = new Map<string, UserBalances>();

const ORDERBOOK: OrderBook = {
  AXIS: {
    bids: {},
    asks: {},
  },

  HDFC: {
    bids: {},
    asks: {},
  },

  TATA: {
    bids: {},
    asks: {},
  },
};

// --- Auth ---
app.post("/signup", (req, res) => {

  // fetch data
  const { username, password } = req.body;

  // check if user exists 
  for (const user of USERS.values()) {
    if (user.username === username) {
      return res.status(409).json({
        error: "user already exists"
      })
    }
  }

  // generate user id 
  const id = crypto.randomUUID();

  // store user
  USERS.set(id, {
    username, password
  })

  // initialize balance
  BALANCES.set(id,{
    USD: {
      available: 10000,
      locked: 0
    }
  })

  res.status(201).json({
    userId: id,
  })
});

app.post("/login", (req, res) => {
  // 1. find user by username
  // 2. compare hashed password
  // 3. return JWT / session token
});

// --- Orders ---
app.post("/order", (req, res) => {
  // body: { userId, side: "BUY"|"SELL", type: "LIMIT"|"MARKET", symbol, price?, qty }
  // 1. validate input + stock exists
  // 2. check + lock balance (INR for BUY, stock for SELL)
  // 3. run matching engine against opposite side of ORDERBOOK
  // 4. write fills to FILLS, update filledQty + status on ORDERS
  // 5. if leftover qty and LIMIT, rest on book; if MARKET, cancel remainder
  // 6. settle balances on each fill (move locked -> other asset's available)
});

app.delete("/order/:orderId", (req, res) => {
  // 1. find order, check ownership
  // 2. remove from ORDERBOOK price level
  // 3. unlock remaining reserved balance
  // 4. mark status = CANCELLED
});

app.get("/orders", (req, res) => {
  // query: ?status=OPEN  (or all)
  // return current user's orders
});

// --- Market data ---
app.get("/orderbook/:symbol", (req, res) => {
  // return aggregated depth — totalQty per price level for bids and asks
  // (don't expose individual userIds to other users)
});

app.get("/fills/:symbol", (req, res) => {
  // recent trades for this stock — the "tape"
});

app.get("/stocks", (req, res) => {
  res.json(STOCKS);
});

// --- User data ---
app.get("/balance", (req, res) => {
  // return BALANCES[userId] for the authed user
});

app.listen(3000, () => console.log("CEX running on :3000"));