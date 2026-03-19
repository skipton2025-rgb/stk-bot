const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// CONFIG (REPLACE THESE)
const API_URL = "https://api.umspay.co.ke/api/v1/stkpush";
const API_KEY = "YOUR_API_KEY";
const SHORTCODE = "YOUR_SHORTCODE";

// Helper: delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Send STK push to one number
async function sendSTK(phone, amount, reference) {
    try {
        const response = await axios.post(API_URL, {
            phone_number: phone,
            amount: amount,
            account_reference: reference,
            shortcode: SHORTCODE
        }, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// API endpoint
app.post("/send-bulk", async (req, res) => {
    const { numbers, amount, reference, delayMs } = req.body;

    if (!numbers || numbers.length === 0) {
        return res.status(400).json({ error: "No numbers provided" });
    }

    let results = [];

    for (let i = 0; i < numbers.length; i++) {
        const phone = numbers[i];

        console.log(`Sending to ${phone}...`);

        const result = await sendSTK(phone, amount, reference);
        results.push({ phone, ...result });

        if (i < numbers.length - 1) {
            await delay(delayMs || 5000);
        }
    }

    res.json({
        message: "Completed",
        results
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
