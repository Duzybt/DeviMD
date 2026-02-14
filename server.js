const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Safely load settings
let settings = {};
try {
    settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
} catch (e) {
    settings = { 
        customMessage: "Hello 💕 I’m Devi MD Bot!", 
        footer: "> Devi MD ❤️✨",
        keywords: {} 
    };
}

function saveSettings() {
    fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2));
}

const botID = "DMD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
const serial = "DEVIMD-2026-" + Math.floor(Math.random() * 9999);

let qrImage = "";
let status = "Waiting for QR Scan...";

// Added flags for cloud environments like Render/Koyeb
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    qrImage = await QRCode.toDataURL(qr);
    status = "Scan the QR to connect";
});

client.on('ready', () => {
    status = "Connected 💖";
    console.log("Bot is ready!");
});

client.on('message', async msg => {
    if (msg.fromMe) return;
    
    // Reply with custom message + footer
    let replyText = settings.customMessage + "\n" + settings.footer;
    msg.reply(replyText);
});

client.initialize();

app.get('/info', (req, res) => {
    res.json({ botID, serial, qrImage, status, settings });
});

app.post('/save', (req, res) => {
    // MERGE: This prevents keywords from being deleted when saving the message
    settings = { ...settings, ...req.body };
    saveSettings();
    res.json({ success: true });
});

app.listen(port, () => console.log(`Server running on port ${port}`));