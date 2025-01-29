const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { promisify } = require("util");
const { Redis } = require("@upstash/redis");

require("dotenv").config();



const app = express();

// Enable CORS for all origins

const corsOptions = {
  origin: "*", // Change this to your frontend URL in production
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization, x-client-api-key",
};


app.use(cors(corsOptions));
app.options("*", cors(corsOptions));



app.use(express.json());

const redis = new Redis({
  url: 'https://settled-lemur-58224.upstash.io',
  token: 'AeNwAAIjcDFjOTg4Mjc5YzVjMjM0MjVmOTdlOTBlNDVkZDZlZDMzOXAxMA',
})

//redis.on("error", (err) => {
  //console.error("Redis error:", err);
//});

// Promisify Redis methods for easier usage
//redis.on("error", (err) => console.error("Redis Client Error:", err));
//redis.on("connect", () => console.log("Connected to Redis!"));

// Connect to Redis
//(async () => {
  //  await redisClient.connect();
//})();

const PORT = process.env.PORT || 3000;

// Middleware for API key authentication
app.use((req, res, next) => {
  const clientApiKey = req.headers["x-client-api-key"];
  if (!clientApiKey || clientApiKey !== process.env.CLIENT_API_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }
  next();
});


const mintedWallets = new Set(); 
// /mint endpoint
app.post("/mint/:walletAddress/:starAddress", async (req, res) => {
  const { walletAddress } = req.params;
  

  const isMinted = await redis.get(starAddress);
  console.log(isMinted)
  if (isMinted) {
      return res.status(400).json({ message: "This wallet has already minted an NFT." });
  }


  try {
    const response = await axios.post(
      "https://www.crossmint.com/api/2022-06-09/collections/126abb71-f84e-44e8-b49e-2972ed3cf8b1/nfts",
      {
        templateId: "ece07f4b-dbc7-4a9e-a521-b80274d38434",
        recipient: `arbitrum:${walletAddress}`,
      },
      {
        headers: {
          "x-api-key": process.env.CROSSMINT_API_KEY,
        },
      }
    );

    if (response.status === 200) {
      // Store the wallet address in Redis after successful mint
      await redis.set(walletAddress, "true");
      return res.status(200).json({ message: "NFT minted successfully!" });
  } else {
      const error = await response.data;
      return res.status(response.status).json({ message: "Minting failed.", error });
  }

    
  } catch (error) {
    console.error("Error minting NFT:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to mint NFT",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/bar", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.crossmint.com/api/2022-06-09/collections/b2f34c67-c1b4-4d15-b9f0-db736b7bf36e/templates/5ed98848-5e77-4609-bc31-07b10e4b4d79",
      {
        headers: {
          "x-api-key": process.env.CROSSMINT_API_KEY,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in /bar:", error.message);
    res.status(500).json({ error: "Failed to fetch template details" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
