const express = require('express');
const cors = require('cors');
const ping = require('ping');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Настройки пинга
const cfg = {
    timeout: 5, // Тайм-аут в секундах
    // Флаги для разных ОС (Windows: -n 1, Linux/Mac: -c 1)
    extra: process.platform === 'win32' ? ['-n', '1'] : ['-c', '1'] 
};

app.post('/scan', async (req, res) => {
    const { ips } = req.body;
    
    if (!ips || !Array.isArray(ips)) {
        return res.status(400).json({ error: 'No IPs provided' });
    }

    // Запускаем пинг всех адресов параллельно
    const promises = ips.map(ip => {
        return ping.promise.probe(ip, cfg).then(res => {
            return {
                ip: ip,
                alive: res.alive,
                // Если время неизвестно, возвращаем null
                time: res.time === 'unknown' ? null : Math.round(res.time)
            };
        });
    });

    try {
        const results = await Promise.all(promises);
        res.json(results);
    } catch (e) {
        console.error("Ping error:", e);
        res.status(500).json({ error: 'Internal Ping Error' });
    }
});

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║   NET MONITOR SERVER READY ON :3000      ║
    ║   -----------------------------------    ║
    ║   1. Keep this window open               ║
    ║   2. Open monitor.html in browser        ║
    ╚══════════════════════════════════════════╝
    `);
});