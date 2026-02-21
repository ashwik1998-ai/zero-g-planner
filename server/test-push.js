require('dotenv').config();

const ONESIGNAL_APP_ID = process.env.VITE_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.error("❌ Missing OneSignal credentials in .env");
    process.exit(1);
}

async function sendTest() {
    console.log(`🚀 Sending test notification using App ID: ${ONESIGNAL_APP_ID}`);
    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                // Using "Total Subscriptions" or "Subscribed Users" segment targets all users who allowed push
                included_segments: ["Total Subscriptions"],
                headings: { en: "System Test 🚀" },
                contents: { en: "Commander, your communication link with Mission Control is fully operational!" }
            })
        });

        const data = await response.json();

        if (data.id) {
            console.log("✅ Success! Notification dispatched.");
            console.log("Response:", data);
        } else {
            console.log("⚠️ API rejected the request.");
            console.log("Response:", data);
        }
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

sendTest();
