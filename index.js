const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();



const app = express();

// Enable CORS for all origins
app.use(cors());


app.use(express.json());

const PORT = process.env.PORT || 3000;

// Middleware for API key authentication
app.use((req, res, next) => {
  const clientApiKey = req.headers["x-client-api-key"];
  if (!clientApiKey || clientApiKey !== process.env.CLIENT_API_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }
  next();
});

// /mint endpoint
app.post("/mint/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const response = await axios.post(
      "https://www.crossmint.com/api/2022-06-09/collections/b2f34c67-c1b4-4d15-b9f0-db736b7bf36e/nfts",
      {
        templateId: "c9f40d97-32a5-4fdc-b4a2-195b0fdcf9f4",
        recipient: `base:${walletAddress}`,
      },
      {
        headers: {
          "x-api-key": process.env.CROSSMINT_API_KEY,
        },
      }
    );

    res.status(200).json(response.data);
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
      "https://www.crossmint.com/api/2022-06-09/collections/b2f34c67-c1b4-4d15-b9f0-db736b7bf36e/templates/c9f40d97-32a5-4fdc-b4a2-195b0fdcf9f4",
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
