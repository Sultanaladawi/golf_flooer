process.on('uncaughtException', (err) => {
  console.error('🔥 [CRITICAL UNCAUGHT EXCEPTION]:', err ? (err.stack || err) : 'Unknown error');
});
process.on('unhandledRejection', (reason) => {
  console.error('🔥 [CRITICAL UNHANDLED REJECTION]:', reason);
});
console.log('⚡ [BOOT] Zahrat Beesan server.js started executing on Node', process.version);

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const compression = require('compression');
let ffmpegPath = null;
try {
  ffmpegPath = require('ffmpeg-static');
} catch (err) {
  console.warn('[server] ffmpeg-static module load warning:', err.message);
}
const { execFile } = require('child_process');

const isAzure = process.env.WEBSITE_SITE_NAME !== undefined;
const dataDir = isAzure ? path.join(process.env.HOME || '/home', 'data') : __dirname;
const EMBEDDED_INDEX_HTML = Buffer.from('PCFkb2N0eXBlIGh0bWw+PGh0bWwgbGFuZz0iYXIiIGRpcj0icnRsIiB0cmFuc2xhdGU9InllcyI+PGhlYWQ+PG1ldGEgY2hhcnNldD0idXRmLTgiLz48bWV0YSBodHRwLWVxdWl2PSJDb250ZW50LVNlY3VyaXR5LVBvbGljeSIgY29udGVudD0iZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJyBkYXRhOiBibG9iOjsgc2NyaXB0LXNyYyAqICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnIGRhdGE6IGJsb2I6OyBzdHlsZS1zcmMgKiAndW5zYWZlLWlubGluZScgZGF0YTogYmxvYjo7IGltZy1zcmMgKiBkYXRhOiBibG9iOjsgZm9udC1zcmMgKiBkYXRhOiBibG9iOjsgY29ubmVjdC1zcmMgKjsgZnJhbWUtc3JjICo7Ii8+PG1ldGEgaHR0cC1lcXVpdj0iQ2FjaGUtQ29udHJvbCIgY29udGVudD0ibm8tY2FjaGUsIG5vLXN0b3JlLCBtdXN0LXJldmFsaWRhdGUiLz48bWV0YSBodHRwLWVxdWl2PSJQcmFnbWEiIGNvbnRlbnQ9Im5vLWNhY2hlIi8+PG1ldGEgaHR0cC1lcXVpdj0iRXhwaXJlcyIgY29udGVudD0iMCIvPjxtZXRhIG5hbWU9Imdvb2dsZS1zaXRlLXZlcmlmaWNhdGlvbiIgY29udGVudD0iSkxDeTROc0NnX09CTEJoQ1RXOVZTM085T1FCU3BMaTgySmNiN3JQTW1JWSIvPjxtZXRhIG5hbWU9InZpZXdwb3J0IiBjb250ZW50PSJ3aWR0aD1kZXZpY2Utd2lkdGgsaW5pdGlhbC1zY2FsZT0xIi8+PG1ldGEgbmFtZT0iZGVzY3JpcHRpb24iIGNvbnRlbnQ9Itiy2YfYsdipINio2YrYs9in2YYg2YTZhNi52KjYp9mK2KfYqiDZiNin2YTYo9iy2YrYp9ihINin2YTZgdin2K7YsdipIOKAlCDYudio2KfZitin2Kog2LHYp9mC2YrYqSDZiNiq2LXYp9mF2YrZhSDYrdi12LHZitipINmI2K7Yp9mF2KfYqiDYudin2YTZitipINin2YTYrNmI2K/YqSB8IFphaHJhdCBCZWVzYW4gTHV4dXJ5IEFiYXlhcy4iLz48bWV0YSBuYW1lPSJrZXl3b3JkcyIgY29udGVudD0i2LLZh9ix2Kkg2KjZitiz2KfZhiwg2LnYqNin2YrYp9iqINiy2YfYsdipINio2YrYs9in2YYsINi52KjYp9mK2KfYqiDZgdin2K7YsdipLCDYudio2KfZitin2Kog2K7ZhNmK2KzZitipLCBaYWhyYXQgQmVlc2FuLCBaYWhyYXQgQmVlc2FuIEFiYXlhcywgTHV4dXJ5IEFiYXlhcywgTW9kZXJuIEFiYXlhcywgQWJheWFzIEpvcmRhbiwgQWJheWFzIFNhdWRpIEFyYWJpYSIvPjxtZXRhIG5hbWU9ImF1dGhvciIgY29udGVudD0iWmFocmF0IEJlZXNhbiBMdXh1cnkgQWJheWFzIi8+PG1ldGEgbmFtZT0icm9ib3RzIiBjb250ZW50PSJpbmRleCwgZm9sbG93LCBtYXgtaW1hZ2UtcHJldmlldzpsYXJnZSIvPjxtZXRhIHByb3BlcnR5PSJvZzp0aXRsZSIgY29udGVudD0i2LLZh9ix2Kkg2KjZitiz2KfZhiDZhNmE2LnYqNin2YrYp9iqINmI2KfZhNij2LLZitin2KEg2KfZhNmB2KfYrtix2KkgfCBaYWhyYXQgQmVlc2FuIEx1eHVyeSBBYmF5YXMiLz48bWV0YSBwcm9wZXJ0eT0ib2c6ZGVzY3JpcHRpb24iIGNvbnRlbnQ9Iti52KjYp9mK2KfYqiDYsdin2YLZitipINmI2KPYstmK2KfYoSDZgdin2K7YsdipIOKAlCDYqti12KfZhdmK2YUg2K3Ytdix2YrYqSDZiNiu2KfZhdin2Kog2LnYp9mE2YrYqSDYp9mE2KzZiNiv2KkgfCBaYWhyYXQgQmVlc2FuIEx1eHVyeSBBYmF5YXMuIi8+PG1ldGEgcHJvcGVydHk9Im9nOmltYWdlIiBjb250ZW50PSIvbG9nby5wbmciLz48bWV0YSBwcm9wZXJ0eT0ib2c6dHlwZSIgY29udGVudD0id2Vic2l0ZSIvPjxtZXRhIHByb3BlcnR5PSJvZzpzaXRlX25hbWUiIGNvbnRlbnQ9Itiy2YfYsdipINio2YrYs9in2YYgfCBaYWhyYXQgQmVlc2FuIi8+PG1ldGEgcHJvcGVydHk9Im9nOmxvY2FsZSIgY29udGVudD0iYXJfU0EiLz48bWV0YSBwcm9wZXJ0eT0ib2c6bG9jYWxlOmFsdGVybmF0ZSIgY29udGVudD0iZW5fVVMiLz48bWV0YSBuYW1lPSJ0d2l0dGVyOmNhcmQiIGNvbnRlbnQ9InN1bW1hcnlfbGFyZ2VfaW1hZ2UiLz48bWV0YSBuYW1lPSJ0d2l0dGVyOnRpdGxlIiBjb250ZW50PSLYstmH2LHYqSDYqNmK2LPYp9mGINmE2YTYudio2KfZitin2Kog2YjYp9mE2KPYstmK2KfYoSDYp9mE2YHYp9iu2LHYqSB8IFphaHJhdCBCZWVzYW4gTHV4dXJ5IEFiYXlhcyIvPjxtZXRhIG5hbWU9InR3aXR0ZXI6ZGVzY3JpcHRpb24iIGNvbnRlbnQ9Iti52KjYp9mK2KfYqiDYsdin2YLZitipINmI2KrYtdin2YXZitmFINit2LXYsdmK2Kkg2YjYrtin2YXYp9iqINi52KfZhNmK2Kkg2KfZhNis2YjYr9ipIHwgWmFocmF0IEJlZXNhbiBMdXh1cnkgQWJheWFzLiIvPjxtZXRhIG5hbWU9InRoZW1lLWNvbG9yIiBjb250ZW50PSIjZjNlYmQ5Ii8+PHNjcmlwdCB0eXBlPSJhcHBsaWNhdGlvbi9sZCtqc29uIj57DQogICAgIkBjb250ZXh0IjogImh0dHBzOi8vc2NoZW1hLm9yZyIsDQogICAgIkB0eXBlIjogIk9yZ2FuaXphdGlvbiIsDQogICAgIm5hbWUiOiAi2LLZh9ix2Kkg2KjZitiz2KfZhiB8IFphaHJhdCBCZWVzYW4iLA0KICAgICJhbHRlcm5hdGVOYW1lIjogWyJaYWhyYXQgQmVlc2FuIEx1eHVyeSBBYmF5YXMiLCAi2LnYqNin2YrYp9iqINiy2YfYsdipINio2YrYs9in2YYiXSwNCiAgICAidXJsIjogImh0dHBzOi8vemFocmF0YmVlc2FuLmNvbSIsDQogICAgImxvZ28iOiAiaHR0cHM6Ly96YWhyYXRiZWVzYW4uY29tL2xvZ28ucG5nIiwNCiAgICAic2FtZUFzIjogWw0KICAgICAgImh0dHBzOi8vd3d3Lmluc3RhZ3JhbS5jb20vemFocmF0YmVlc2FuMjAyNiIsDQogICAgICAiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tLzEyNTIwODY2NjEzMDE3ODQiLA0KICAgICAgImh0dHBzOi8vd3d3LnRpa3Rvay5jb20vQHphaHJhdGJlZXNhbiIsDQogICAgICAiaHR0cHM6Ly93d3cuc25hcGNoYXQuY29tL2FkZC96YWhyYXRiZWVzYW4iDQogICAgXQ0KICB9PC9zY3JpcHQ+PHNjcmlwdCBhc3luYyBzcmM9Imh0dHBzOi8vd3d3Lmdvb2dsZXRhZ21hbmFnZXIuY29tL2d0YWcvanM/aWQ9Ry1YWFhYWFhYWFhYIj48L3NjcmlwdD48c2NyaXB0PmZ1bmN0aW9uIGd0YWcoKXtkYXRhTGF5ZXIucHVzaChhcmd1bWVudHMpfXdpbmRvdy5kYXRhTGF5ZXI9d2luZG93LmRhdGFMYXllcnx8W10sZ3RhZygianMiLG5ldyBEYXRlKSxndGFnKCJjb25maWciLCJHLVhYWFhYWFhYWFgiKTwvc2NyaXB0PjxzY3JpcHQ+IWZ1bmN0aW9uKGUsdCxuLGMsbyxhLGYpe2UuZmJxfHwobz1lLmZicT1mdW5jdGlvbigpe28uY2FsbE1ldGhvZD9vLmNhbGxNZXRob2QuYXBwbHkobyxhcmd1bWVudHMpOm8ucXVldWUucHVzaChhcmd1bWVudHMpfSxlLl9mYnF8fChlLl9mYnE9byksby5wdXNoPW8sby5sb2FkZWQ9ITAsby52ZXJzaW9uPSIyLjAiLG8ucXVldWU9W10sKGE9dC5jcmVhdGVFbGVtZW50KG4pKS5hc3luYz0hMCxhLnNyYz0iaHR0cHM6Ly9jb25uZWN0LmZhY2Vib29rLm5ldC9lbl9VUy9mYmV2ZW50cy5qcyIsKGY9dC5nZXRFbGVtZW50c0J5VGFnTmFtZShuKVswXSkucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYSxmKSl9KHdpbmRvdyxkb2N1bWVudCwic2NyaXB0IiksZmJxKCJpbml0IiwiOTA5ODE3MjYyMTY3ODQ3IiksZmJxKCJ0cmFjayIsIlBhZ2VWaWV3Iik8L3NjcmlwdD48bm9zY3JpcHQ+PGltZyBoZWlnaHQ9IjEiIHdpZHRoPSIxIiBzdHlsZT0iZGlzcGxheTpub25lIiBzcmM9Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS90cj9pZD05MDk4MTcyNjIxNjc4NDcmZXY9UGFnZVZpZXcmbm9zY3JpcHQ9MSIvPjwvbm9zY3JpcHQ+PGxpbmsgcmVsPSJpY29uIiB0eXBlPSJpbWFnZS94LWljb24iIGhyZWY9Ii9mYXZpY29uLmljbz92PTIiLz48bGluayByZWw9Imljb24iIHR5cGU9ImltYWdlL3BuZyIgc2l6ZXM9IjUxMng1MTIiIGhyZWY9Ii9sb2dvLnBuZz92PTIiLz48bGluayByZWw9Imljb24iIHR5cGU9ImltYWdlL3BuZyIgc2l6ZXM9IjE5MngxOTIiIGhyZWY9Ii9sb2dvLnBuZz92PTIiLz48bGluayByZWw9Imljb24iIHR5cGU9ImltYWdlL3BuZyIgc2l6ZXM9IjMyeDMyIiBocmVmPSIvbG9nby5wbmc/dj0yIi8+PGxpbmsgcmVsPSJpY29uIiB0eXBlPSJpbWFnZS9wbmciIHNpemVzPSIxNngxNiIgaHJlZj0iL2xvZ28ucG5nP3Y9MiIvPjxsaW5rIHJlbD0ic2hvcnRjdXQgaWNvbiIgdHlwZT0iaW1hZ2UveC1pY29uIiBocmVmPSIvZmF2aWNvbi5pY28/dj0yIi8+PGxpbmsgcmVsPSJhcHBsZS10b3VjaC1pY29uIiBzaXplcz0iMTgweDE4MCIgaHJlZj0iL2xvZ28ucG5nP3Y9MiIvPjxsaW5rIHJlbD0icHJlY29ubmVjdCIgaHJlZj0iaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbSIvPjxsaW5rIHJlbD0icHJlY29ubmVjdCIgaHJlZj0iaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbSIgY3Jvc3NvcmlnaW4vPjxsaW5rIGhyZWY9Imh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9Q2F2ZWF0OndnaHRANTAwOzcwMCZmYW1pbHk9RE0rU2FuczppdGFsLG9wc3osd2dodEAwLDkuLjQwLDMwMC4uNzAwOzEsOS4uNDAsMzAwLi43MDAmZmFtaWx5PURNK1NlcmlmK0Rpc3BsYXk6aXRhbEAwOzEmZmFtaWx5PUludGVyOndnaHRAMzAwOzQwMDs1MDA7NjAwOzcwMDs4MDAmZmFtaWx5PUxvcmE6aXRhbCx3Z2h0QDAsNDAwLi43MDA7MSw0MDAuLjcwMCZkaXNwbGF5PXN3YXAiIHJlbD0ic3R5bGVzaGVldCIvPjxsaW5rIHJlbD0ibWFuaWZlc3QiIGhyZWY9Ii9tYW5pZmVzdC5qc29uIi8+PG1ldGEgbmFtZT0ibW9iaWxlLXdlYi1hcHAtY2FwYWJsZSIgY29udGVudD0ieWVzIi8+PG1ldGEgbmFtZT0iYXBwbGUtbW9iaWxlLXdlYi1hcHAtY2FwYWJsZSIgY29udGVudD0ieWVzIi8+PG1ldGEgbmFtZT0iYXBwbGUtbW9iaWxlLXdlYi1hcHAtc3RhdHVzLWJhci1zdHlsZSIgY29udGVudD0iYmxhY2stdHJhbnNsdWNlbnQiLz48bWV0YSBuYW1lPSJhcHBsZS1tb2JpbGUtd2ViLWFwcC10aXRsZSIgY29udGVudD0i2LLZh9ix2Kkg2KjZitiz2KfZhiIvPjxzdHlsZT4jZ29vZy1ndC10dCwuVklwZ0pkLXlEZmUtYjJmc29kLXY2NTgwZCwuZ29vZy10ZS1iYWxsb29uLWZyYW1lLC5nb29nLXRlLWJhbm5lci1mcmFtZSwuZ29vZy10ZS1iYW5uZXItZnJhbWUuc2tpcHRyYW5zbGF0ZSwuZ29vZy10ZS1nYWRnZXQtaWNvbiwuZ29vZy10ZS1tZW51LWZyYW1lLC5nb29nLXRlLXNwaW5uZXItcG9zLC5nb29nLXRleHQtaGlnaGxpZ2h0LC5nb29nLXRvb2x0aXAsLmdvb2ctdG9vbHRpcDpob3Zlciwuc2tpcHRyYW5zbGF0ZSxpZnJhbWUuc2tpcHRyYW5zbGF0ZXtkaXNwbGF5Om5vbmUhaW1wb3J0YW50O3Zpc2liaWxpdHk6aGlkZGVuIWltcG9ydGFudDtvcGFjaXR5OjAhaW1wb3J0YW50O3BvaW50ZXItZXZlbnRzOm5vbmUhaW1wb3J0YW50O2hlaWdodDowIWltcG9ydGFudDt3aWR0aDowIWltcG9ydGFudH1ib2R5e3RvcDowIWltcG9ydGFudDtwb3NpdGlvbjpzdGF0aWMhaW1wb3J0YW50O21hcmdpbi10b3A6MCFpbXBvcnRhbnR9aHRtbHt0b3A6MCFpbXBvcnRhbnQ7cG9zaXRpb246c3RhdGljIWltcG9ydGFudH0jZ29vZ2xlX3RyYW5zbGF0ZV9lbGVtZW50IC5nb29nLXRlLWdhZGdldC1zaW1wbGV7YmFja2dyb3VuZDowIDAhaW1wb3J0YW50O2JvcmRlcjpub25lIWltcG9ydGFudDtwYWRkaW5nOjAhaW1wb3J0YW50O2ZvbnQtc2l6ZTouNzhyZW0haW1wb3J0YW50fSNnb29nbGVfdHJhbnNsYXRlX2VsZW1lbnQgLmdvb2ctdGUtZ2FkZ2V0LXNpbXBsZSBhLCNnb29nbGVfdHJhbnNsYXRlX2VsZW1lbnQgLmdvb2ctdGUtZ2FkZ2V0LXNpbXBsZSBzcGFue2NvbG9yOmluaGVyaXQhaW1wb3J0YW50O3RleHQtZGVjb3JhdGlvbjpub25lIWltcG9ydGFudH0jZ29vZ2xlX3RyYW5zbGF0ZV9lbGVtZW50IGltZ3tkaXNwbGF5Om5vbmUhaW1wb3J0YW50fSNnb29nbGVfdHJhbnNsYXRlX2VsZW1lbnQgLmdvb2ctdGUtZ2FkZ2V0LXNpbXBsZSAuZ29vZy10ZS1tZW51LXZhbHVle2NvbG9yOmluaGVyaXQhaW1wb3J0YW50fS5nb29nLXRlLWdhZGdldD5zcGFue2Rpc3BsYXk6bm9uZSFpbXBvcnRhbnR9PC9zdHlsZT48c2NyaXB0IGRlZmVyPSJkZWZlciIgc3JjPSIvc3RhdGljL2pzL21haW4uMWI5Njg4NzQuanMiPjwvc2NyaXB0PjxsaW5rIGhyZWY9Ii9zdGF0aWMvY3NzL21haW4uZTdhOWRiNzEuY3NzIiByZWw9InN0eWxlc2hlZXQiPjwvaGVhZD48Ym9keT48bm9zY3JpcHQ+SmF2YVNjcmlwdCBpcyByZXF1aXJlZCB0byB2aWV3IHRoaXMgc2l0ZS48L25vc2NyaXB0PjxkaXYgaWQ9Imdvb2dsZV90cmFuc2xhdGVfZWxlbWVudCIgc3R5bGU9ImRpc3BsYXk6bm9uZSI+PC9kaXY+PGRpdiBpZD0icm9vdCI+PC9kaXY+PC9ib2R5PjwvaHRtbD4=', 'base64').toString('utf8');

// Ensure the public/images directory exists to prevent upload crashes
const imgDir = path.join(dataDir, 'public', 'images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Multer config for images & videos up to 100MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imgDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|webm|avi|m4v|jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only video and image files are allowed'));
  }
});

let openai = null;
const API_KEY = (process.env.OPENAI_API_KEY || '').trim();

if (API_KEY && API_KEY !== 'your_key_here') {
  const IS_GITHUB = API_KEY.startsWith('github_') || API_KEY.startsWith('ghp_');
  const BASE_URL = IS_GITHUB ? 'https://models.inference.ai.azure.com' : 'https://api.openai.com/v1';

  openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: BASE_URL,
    timeout: 120000,
    maxRetries: 2
  });

  console.log('------------------------------------------');
  console.log(`ًں¤– AI PROVIDER: ${IS_GITHUB ? 'GitHub Models' : 'Standard OpenAI'} Detected`);
  console.log(`ًں”— BASE URL: ${BASE_URL}`);
  console.log('------------------------------------------');
} else {
  console.warn('[WARNING] OpenAI API Key missing or default. AI Assistant in Fallback Mode.');
}

// Initialize Google Gemini
let gemini = null;
const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
if (GEMINI_KEY) {
  gemini = new GoogleGenerativeAI(GEMINI_KEY);
  console.log('------------------------------------------');
  console.log('✨ GEMINI AI: Initialized with gemini-2.5-pro (Best Model)');
  console.log('------------------------------------------');
} else {
  console.warn('[WARNING] GEMINI_API_KEY missing. Gemini AI disabled.');
}

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 8080;

// Enable Gzip/Brotli response compression for ultra-fast network transfers
app.use(compression());

// ✅ FIXED: CORS now allows Azure and localhost
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-admin-email', 'x-admin-name']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Permissive Content-Security-Policy to allow eval, inline scripts, Google Fonts, and Meta Pixel
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'unsafe-inline' data: blob:; img-src * data: blob:; font-src * data: blob:; connect-src *; frame-src *;"
  );
  next();
});

// ✅ DISABLE CACHING ON ALL API ROUTES
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// ✅ ENFORCE HTTPS (For Azure Production)
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
});


// --- CHROME & AZURE MULTI-DIRECTORY IMAGE + VIDEO STREAMING WITH AUTO-REBOOT RECOVERY ---
const handleMediaStreaming = async (req, res, next) => {
  let reqFilename = req.url.replace(/^\//, '').split('?')[0];
  try { reqFilename = decodeURIComponent(reqFilename); } catch (e) {}
  const lowerFilename = reqFilename.toLowerCase();
  const isVideoReq = /\.(mp4|mov|webm|avi|m4v)$/i.test(reqFilename);

  const searchDirs = [
    imgDir,                                   // /home/data/public/images (runtime uploads)
    path.join(__dirname, 'public', 'images'), // repo public/images/
    path.join(__dirname, 'public', 'videos'), // repo public/videos/
    path.join(__dirname, 'public'),           // repo public/
    path.join(__dirname, 'build', 'images'),  // repo build/images/
    path.join(__dirname, 'build', 'videos'),  // repo build/videos/
    path.join(__dirname, 'build')             // repo build/
  ];

  // Find the actual file on disk
  let foundFile = null;
  outer: for (const dir of searchDirs) {
    if (!dir || !fs.existsSync(dir)) continue;
    for (const candidate of [reqFilename, lowerFilename]) {
      const full = path.resolve(dir, candidate);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) { foundFile = full; break outer; }
    }
    try {
      const files = fs.readdirSync(dir);
      const match = files.find(f => f.toLowerCase().trim() === lowerFilename.trim());
      if (match) { foundFile = path.join(dir, match); break; }
    } catch (e) {}
  }

  // If not found on disk, attempt instant auto-recovery from MySQL permanent storage
  if (!foundFile) {
    try {
      const cleanName = reqFilename.replace(/^\/images\//, '').replace(/^\//, '');
      const [rows] = await db.promise().query('SELECT data_uri FROM product_image_store WHERE filename = ?', [cleanName]);
      if (rows && rows.length > 0 && rows[0].data_uri) {
        const dataUri = rows[0].data_uri;
        const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const buffer = Buffer.from(matches[2], 'base64');
          const restorePath = path.join(imgDir, cleanName);
          fs.writeFileSync(restorePath, buffer);
          foundFile = restorePath;
          console.log(`[Auto Recovery] Successfully restored ${cleanName} from MySQL DB back to disk.`);
        }
      }
    } catch (e) {
      console.error('[Image DB Auto-Recovery Error]:', e.message);
    }
  }

  // Image Fallback
  if (!foundFile && !isVideoReq) {
    const fallbackPath = path.join(__dirname, 'public', 'images', '15.jpg');
    if (fs.existsSync(fallbackPath)) {
      foundFile = fallbackPath;
    } else {
      return next();
    }
  }

  // Strict Video Request Handling -- NO RANDOM FALLBACKS
  if (!foundFile && isVideoReq) {
    return next();
  }

  const isVideo = /\.(mp4|mov|webm|avi|m4v)$/i.test(foundFile);

  if (isVideo) {
    // ✅ PROPER VIDEO STREAMING WITH RANGE REQUEST SUPPORT
    const stat = fs.statSync(foundFile);
    const fileSize = stat.size;
    const rangeHeader = req.headers.range;

    const ext = path.extname(foundFile).toLowerCase();
    const mimeTypes = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.avi': 'video/x-msvideo', '.m4v': 'video/x-m4v' };
    const contentType = mimeTypes[ext] || 'video/mp4';

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 10 * 1024 * 1024 - 1, fileSize - 1);
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      });
      const stream = fs.createReadStream(foundFile, { start, end });
      stream.on('error', () => res.end());
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      });
      const stream = fs.createReadStream(foundFile);
      stream.on('error', () => res.end());
      stream.pipe(res);
    }
  } else {
    // Images: serve normally
    res.set({
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Vary': 'Accept-Encoding',
      'X-Content-Type-Options': 'nosniff'
    });
    return res.sendFile(foundFile);
  }
};

app.use('/images', handleMediaStreaming);
app.use('/videos', handleMediaStreaming);





// --- STATIC FILES SERVING (HARDENED & OPTIMIZED) ---
// Prevent caching index.html so browsers always fetch the latest JS/CSS hashes
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Robust static file serving with zero-byte protection and multiple directory fallbacks
app.use('/static', (req, res, next) => {
  const relPath = req.path.replace(/^\//, '');
  const isJs = relPath.endsWith('.js');
  const isCss = relPath.endsWith('.css');

  // Search all possible directories for a valid non-empty file (> 500 bytes)
  const candidateDirs = [
    path.resolve(__dirname, 'build', 'static'),
    path.resolve(__dirname, 'static'),
    path.resolve(__dirname, 'public', 'static')
  ];

  for (const dir of candidateDirs) {
    const fullPath = path.join(dir, relPath);
    if (fs.existsSync(fullPath)) {
      try {
        const sz = fs.statSync(fullPath).size;
        if (sz > 500) {
          if (isJs) res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          if (isCss) res.setHeader('Content-Type', 'text/css; charset=utf-8');
          return res.sendFile(fullPath);
        }
      } catch (_) {}
    }
  }

  // Fallback for ANY JS file to the newest valid main.*.js (> 50KB)
  if (isJs) {
    for (const dir of [path.resolve(__dirname, 'build', 'static', 'js'), path.resolve(__dirname, 'static', 'js')]) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir)
            .filter(f => f.startsWith('main.') && f.endsWith('.js'))
            .map(f => ({ name: f, full: path.join(dir, f), sz: fs.statSync(path.join(dir, f)).size }))
            .filter(f => f.sz > 50000);
          if (files.length > 0) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            return res.sendFile(files[0].full);
          }
        } catch (_) {}
      }
    }
  }

  // Fallback for ANY CSS file to the newest valid main.*.css (> 5KB)
  if (isCss) {
    for (const dir of [path.resolve(__dirname, 'build', 'static', 'css'), path.resolve(__dirname, 'static', 'css')]) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir)
            .filter(f => f.startsWith('main.') && f.endsWith('.css'))
            .map(f => ({ name: f, full: path.join(dir, f), sz: fs.statSync(path.join(dir, f)).size }))
            .filter(f => f.sz > 5000);
          if (files.length > 0) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
            return res.sendFile(files[0].full);
          }
        } catch (_) {}
      }
    }
  }

  next();
});

const cacheOptions = { maxAge: '30d', etag: true, lastModified: true };
app.use(express.static(path.resolve(__dirname, 'build'), { ...cacheOptions, index: false }));
app.use(express.static(path.resolve(__dirname), { ...cacheOptions, index: false }));
app.use('/public/images', express.static(path.resolve(dataDir, 'public', 'images'), cacheOptions));

// Explicit route for Root GET / to serve the verified compiled React index.html directly
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const diskIndex = path.join(__dirname, 'build', 'index.html');
  if (fs.existsSync(diskIndex)) {
    try {
      const html = fs.readFileSync(diskIndex, 'utf8');
      if (html && html.trim().length > 100) {
        return res.send(html);
      }
    } catch (e) {}
  }

  if (typeof EMBEDDED_INDEX_HTML === 'string' && EMBEDDED_INDEX_HTML.length > 100) {
    return res.send(EMBEDDED_INDEX_HTML);
  }

  res.status(503).send('Zahrat Beesan is starting up... Please refresh in a moment.');
});

// 3. Specific favicon, logo, video and manifest routes with multi-directory fallbacks
app.get(['/favicon.ico', '/favicon.png', '/favicon.jpg'], (req, res) => {
  const file = req.path.replace(/^\//, '');
  const candidates = [
    path.resolve(__dirname, file),
    path.resolve(__dirname, 'public', file),
    path.resolve(__dirname, 'build', file),
    path.resolve(__dirname, 'logo.png'),
    path.resolve(__dirname, 'public', 'logo.png'),
    path.resolve(__dirname, 'build', 'logo.png')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  return res.status(204).end();
});

app.get(['/logo.png', '/logo_abayas.png', '/logo_new.png'], (req, res) => {
  const file = req.path.replace(/^\//, '');
  const candidates = [
    path.resolve(__dirname, file),
    path.resolve(__dirname, 'public', file),
    path.resolve(__dirname, 'build', file),
    path.resolve(__dirname, 'logo.png')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  return res.status(404).send('Logo not found');
});

app.get(['/hero_video.mp4', '/lookbook_video.mp4'], (req, res) => {
  const fileName = req.path.replace(/^\//, '');
  const candidates = [
    path.resolve(__dirname, fileName),
    path.resolve(__dirname, 'public', fileName),
    path.resolve(__dirname, 'build', fileName),
    path.resolve(dataDir, fileName),
    path.resolve(dataDir, 'public', fileName)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  return res.status(404).send('Video not found');
});

app.get('/manifest.json', (req, res) => {
  const candidates = [
    path.resolve(__dirname, 'manifest.json'),
    path.resolve(__dirname, 'public', 'manifest.json'),
    path.resolve(__dirname, 'build', 'manifest.json')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  return res.json({ name: "زهرة بيسان", short_name: "زهرة بيسان", start_url: "/" });
});

// Instant Server Reload endpoint
app.all('/api/system/reload', (req, res) => {
  res.json({ success: true, message: 'Server recycling immediately...' });
  setTimeout(() => {
    console.log('🔄 Recycling Node process for fresh assets deployment...');
    process.exit(0);
  }, 300);
});

// Dynamic XML Sitemap Endpoint for Google Search Engine Indexing (Bilingual Arabic/English)
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net';
  db.query('SELECT id, name, updated_at FROM menu_items', (err, products) => {
    let productsXml = '';
    if (!err && Array.isArray(products)) {
      productsXml = products.map(p => `
  <url>
    <loc>${baseUrl}/#product-${p.id}</loc>
    <lastmod>${p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en" />
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/gift-cards</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>${productsXml}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml.trim());
  });
});



app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);

  const adminEmail = req.headers['x-admin-email'];
  const adminName = req.headers['x-admin-name'];

  req.logAdminAction = (action, details) => {
    if (adminEmail) {
      const q = 'INSERT INTO admin_logs (admin_email, admin_name, action, details) VALUES (?, ?, ?, ?)';
      db.query(q, [adminEmail, adminName || 'Unknown', action, details], (err) => {
        if (err) console.error('[Audit Log Error]', err.message);
      });
    }
  };

  next();
});

// Export/Audit Log endpoint for Leader
app.get('/api/admin-logs', (req, res) => {
  db.query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 200', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/log-action', (req, res) => {
  const { action, details } = req.body;
  if (req.logAdminAction) {
    req.logAdminAction(action, details);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Logging middleware not initialized' });
  }
});

// Image upload endpoint with 100% permanent MySQL persistence backup
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = req.file.filename;
  const filePath = req.file.path;
  const url = `/images/${filename}`;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    await db.promise().query(
      'INSERT INTO product_image_store (filename, data_uri) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_uri = VALUES(data_uri)',
      [filename, dataUri]
    );
    console.log(`[Permanent Storage] Backed up ${filename} into MySQL product_image_store (${fileBuffer.length} bytes).`);
  } catch (err) {
    console.error('[Upload Image Persistence Error]:', err.message);
  }

  res.json({ filename, url });
});

// Video upload endpoint with 100% permanent MySQL persistence backup
app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

  const filename = req.file.filename;
  const filePath = req.file.path;
  const url = `/images/${filename}`;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeType = ext === '.mov' ? 'video/quicktime' : ext === '.webm' ? 'video/webm' : 'video/mp4';
    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    await db.promise().query(
      'INSERT INTO product_image_store (filename, data_uri) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_uri = VALUES(data_uri)',
      [filename, dataUri]
    );
    console.log(`[Permanent Video Storage] Backed up ${filename} into MySQL product_image_store (${fileBuffer.length} bytes).`);
  } catch (err) {
    console.error('[Upload Video Persistence Error]:', err.message);
  }

  res.json({ filename, url });
});

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Server is reaching here' });
});



app.get('/api/fix-db-times', async (req, res) => {
  try {
    const promiseDb = db.promise ? db.promise() : db;
    const [r1] = await promiseDb.query("UPDATE orders SET created_at = DATE_ADD(created_at, INTERVAL 2 HOUR) WHERE created_at < '2026-05-18 00:00:00'");
    const [r2] = await promiseDb.query("UPDATE contact_messages SET created_at = DATE_ADD(created_at, INTERVAL 2 HOUR) WHERE created_at < '2026-05-18 00:00:00'");
    res.json({ success: true, orders_updated: r1.affectedRows, messages_updated: r2.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
const pool = mysql.createPool({
  host: dbHost,
  user: process.env.DB_USER || 'zahratbeesan',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
  database: process.env.DB_NAME || 'golf_flooer',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl: (dbHost !== 'localhost' && dbHost !== '127.0.0.1') ? { rejectUnauthorized: false } : false
});

// Force all MySQL connections to use Jordan Time (Asia/Amman = UTC+3)
pool.on('connection', (connection) => {
  connection.query("SET time_zone = 'Asia/Amman'", (err) => {
    if (err) {
      // Fallback in case Azure/MySQL lacks the timezone dictionary
      connection.query("SET time_zone = '+03:00'");
    }
  });
});

const db = pool;

const convertNumerals = str => {
  if (typeof str === 'undefined' || str === null) return '';
  const s = str.toString();
  return s.replace(/[\u0660-\u0669]/g, d => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'.indexOf(d)).replace(/[0-9]/g, d => d);
};

db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL Connection Error:', err.message);
    return;
  }
  console.log(`Database connected successfully via Pool`);

  const checkColumns = async () => {
    try {
      const promiseDb = db.promise();
      const [columns] = await promiseDb.query("SHOW COLUMNS FROM orders");
      const columnNames = columns.map(c => c.Field);

      if (!columnNames.includes('phone')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN phone VARCHAR(50) DEFAULT NULL");
      }
      if (!columnNames.includes('delivery_address')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT NULL");
      }
      if (!columnNames.includes('payment_status')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'");
      }
      if (!columnNames.includes('stripe_session_id')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255) DEFAULT NULL");
      }
      if (!columnNames.includes('myfatoorah_invoice_id')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN myfatoorah_invoice_id VARCHAR(255) DEFAULT NULL");
      }

      try {
        const [zeroItems] = await promiseDb.query("SELECT id, item_name, order_id, quantity FROM order_items WHERE price = 0 OR price IS NULL");
        for (const zi of zeroItems) {
          const [addRes] = await promiseDb.query("SELECT price FROM addons WHERE name = ?", [zi.item_name]);
          if (addRes && addRes.length > 0 && parseFloat(addRes[0].price) > 0) {
            const fixedPrice = parseFloat(addRes[0].price);
            await promiseDb.query("UPDATE order_items SET price = ? WHERE id = ?", [fixedPrice, zi.id]);
            await promiseDb.query("UPDATE orders SET total_amount = total_amount + ? WHERE id = ?", [fixedPrice * zi.quantity, zi.order_id]);
          }
        }
      } catch (e) {
        console.error('[Migration] Addon price fix failed:', e.message);
      }

      // Ensure all legacy and existing price displays are formatted as JOD
      const [migrationResult] = await promiseDb.query(`
        UPDATE menu_items 
        SET price_display = CONCAT('JOD ', FORMAT(price_num, 2)) 
        WHERE price_num IS NOT NULL AND (price_display LIKE '£%' OR price_display NOT LIKE 'JOD %')
      `);

      // Create product_variants table if not exists
      await promiseDb.query(`
        CREATE TABLE IF NOT EXISTS product_variants (
          id          INT AUTO_INCREMENT PRIMARY KEY,
          product_id  INT NOT NULL,
          color_name  VARCHAR(200) NOT NULL,
          colors      LONGTEXT NOT NULL,
          images      LONGTEXT,
          video_url   VARCHAR(500) DEFAULT NULL,
          sizes       LONGTEXT,
          sort_order  INT DEFAULT 0,
          created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES menu_items(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Create product_image_store table for 100% permanent image persistence in MySQL
      await promiseDb.query(`
        CREATE TABLE IF NOT EXISTS product_image_store (
          filename  VARCHAR(255) PRIMARY KEY,
          data_uri  LONGTEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log('[Migration] Schema verification complete.');
    } catch (dbErr) {
      console.error('[Migration] Schema check failed:', dbErr.message);
    }
  };
  checkColumns();

  if (connection) connection.release();
});


app.post('/api/orders', async (req, res) => {
  console.log('[Server] Body:', JSON.stringify(req.body, null, 2));
  const { customer_name, email, total_amount, cartItems, order_type, delivery_address, phone, coupon_code, redeem_points, points_discount, is_gift, gift_message, gift_packaging, gift_fee, gift_card_code, gift_card_discount } = req.body;

  if (!customer_name || !Array.isArray(cartItems) || cartItems.length === 0 || !phone) {
    return res.status(400).json({ error: 'Missing required contact information' });
  }

  const totalAmount = parseFloat(total_amount);
  const promiseDb = db.promise();
  const conn = await promiseDb.getConnection();

  try {
    await conn.beginTransaction();

    for (const item of cartItems) {
      const productId = parseInt(item.id, 10);
      const quantity = parseInt(item.qty, 10);
      if (isNaN(productId)) continue;

      const [[menuItem]] = await conn.query("SELECT available, name FROM menu_items WHERE id = ?", [productId]);
      if (menuItem && menuItem.available == 0) {
        throw new Error(`Sorry, ${menuItem.name} is currently out of stock.`);
      }

      const [ingredients] = await conn.query(`
        SELECT i.item_name, i.quantity as stock_qty, r.quantity_required
        FROM recipes r
        JOIN inventory i ON r.inventory_id = i.id
        WHERE r.menu_item_id = ?
      `, [productId]);

      for (const recipe of ingredients) {
        const requiredTotal = parseFloat(recipe.quantity_required) * quantity;
        if (recipe.stock_qty < requiredTotal) {
          throw new Error(`Insufficient stock for: ${recipe.item_name}`);
        }
      }
    }

    // --- Smart Prep Time: scale with active orders ---
    const [[activeOrdersRow]] = await conn.query(
      "SELECT COUNT(*) as cnt FROM orders WHERE status IN ('preparing', 'pending')"
    );
    const activeCount = parseInt(activeOrdersRow.cnt) || 0;
    let prepMinutes = 3;
    if (activeCount >= 4 && activeCount <= 7)  prepMinutes = 5;
    else if (activeCount >= 8 && activeCount <= 12) prepMinutes = 8;
    else if (activeCount > 12) prepMinutes = 12;

    const [orderInsertResult] = await conn.query(
      `INSERT INTO orders (customer_name, email, total_amount, status, created_at, estimated_ready_at, order_type, delivery_address, phone, is_gift, gift_message, gift_packaging, gift_fee) VALUES (?, ?, ?, 'preparing', NOW(), DATE_ADD(NOW(), INTERVAL ${prepMinutes} MINUTE), ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, email, totalAmount, order_type || 'takeaway', delivery_address || null, phone || null, is_gift ? 1 : 0, gift_message || null, gift_packaging || null, parseFloat(gift_fee) || 0.00]
    );
    const orderId = orderInsertResult.insertId;

    if (coupon_code) {
      await conn.query("UPDATE coupon SET usedCount = usedCount + 1 WHERE code = ?", [coupon_code]);
    }

    let calculatedTotal = 0;

    for (const item of cartItems) {
      const productId = parseInt(item.id, 10);
      const quantity = parseFloat(item.qty);
      let price = parseFloat(item.priceNum);

      let itemCost = 0;
      let itemTax = 0;

      if (!isNaN(productId)) {
        const [productRows] = await conn.query("SELECT price_num, cost_price, tax_amount FROM menu_items WHERE id = ?", [productId]);
        if (productRows && productRows.length > 0) {
          if (isNaN(price) || price === 0) price = parseFloat(productRows[0].price_num) || 0;
          itemCost = parseFloat(productRows[0].cost_price) || 0;
          itemTax = parseFloat(productRows[0].tax_amount) || 0;
        } else {
          if (isNaN(price)) price = 0;
        }
      } else {
        const [addonRows] = await conn.query("SELECT price FROM addons WHERE name = ?", [item.name]);
        if (addonRows && addonRows.length > 0) {
          if (isNaN(price) || price === 0) price = parseFloat(addonRows[0].price) || 0;
        } else {
          if (isNaN(price)) price = 0;
        }
      }

      calculatedTotal += price * quantity;

      await conn.query(
        "INSERT INTO order_items (order_id, product_id, item_name, quantity, price, cost_price, tax_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [orderId, isNaN(productId) ? null : productId, item.name, quantity, price, itemCost, itemTax]
      );

      if (!isNaN(productId)) {
        const [recipeSteps] = await conn.query("SELECT inventory_id, quantity_required FROM recipes WHERE menu_item_id = ?", [productId]);
        for (const ingredient of recipeSteps) {
          const deductAmount = parseFloat(ingredient.quantity_required) * quantity;
          await conn.query("UPDATE inventory SET quantity = GREATEST(quantity - ?, 0) WHERE id = ?", [deductAmount, ingredient.inventory_id]);
        }
      }

      if (Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          // Get addon price and inventory link
          const [addonRows] = await conn.query("SELECT price, inventory_id FROM addons WHERE name = ? OR id = ?", [addon.name, addon.id]);
          let addonPrice = 0;
          if (addonRows && addonRows.length > 0) {
            addonPrice = parseFloat(addonRows[0].price) || 0;
            
            // Deduct addon from inventory if linked
            if (addonRows[0].inventory_id) {
              await conn.query("UPDATE inventory SET quantity = GREATEST(quantity - ?, 0) WHERE id = ?", [1 * quantity, addonRows[0].inventory_id]);
            }
          }

          calculatedTotal += addonPrice * quantity;

          // Record addon as an order item for accurate revenue/sales tracking
          await conn.query(
            "INSERT INTO order_items (order_id, product_id, item_name, quantity, price, cost_price, tax_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [orderId, null, `+ ${addon.name}`, quantity, addonPrice, 0, 0]
          );
        }
      }
    }

    if (calculatedTotal > totalAmount) {
      await conn.query("UPDATE orders SET total_amount = ? WHERE id = ?", [calculatedTotal, orderId]);
    }

    // ── Loyalty Points Processing ──
    const redeemed = parseInt(redeem_points) || 0;
    if (redeemed > 0) {
      const [memberRows] = await conn.query("SELECT points FROM loyalty_members WHERE phone_number = ?", [phone.trim()]);
      const currentPoints = (memberRows && memberRows.length > 0) ? memberRows[0].points : 0;
      if (currentPoints < redeemed) {
        throw new Error("Insufficient loyalty points for redemption");
      }
      // Deduct redeemed points
      await conn.query("UPDATE loyalty_members SET points = GREATEST(points - ?, 0) WHERE phone_number = ?", [redeemed, phone.trim()]);
      // Log redemption
      await conn.query("INSERT INTO loyalty_points_history (phone_number, points_change, action_type, order_id) VALUES (?, ?, 'redeemed', ?)", [phone.trim(), -redeemed, orderId]);
    }

    // Earn points (1 JOD = 1 Point on actual paid amount)
    const pointsEarned = Math.floor(totalAmount);
    if (pointsEarned > 0) {
      const [memberCheck] = await conn.query("SELECT * FROM loyalty_members WHERE phone_number = ?", [phone.trim()]);
      if (memberCheck.length === 0) {
        // Create new loyalty account
        await conn.query("INSERT INTO loyalty_members (phone_number, customer_name, points) VALUES (?, ?, ?)", [phone.trim(), customer_name.trim(), pointsEarned]);
      } else {
        // Update existing point balance
        await conn.query("UPDATE loyalty_members SET points = points + ?, customer_name = ? WHERE phone_number = ?", [pointsEarned, customer_name.trim(), phone.trim()]);
      }
      // Log earned points
      await conn.query("INSERT INTO loyalty_points_history (phone_number, points_change, action_type, order_id) VALUES (?, ?, ?, ?)", [phone.trim(), pointsEarned, 'earned', orderId]);
    }

    // ── Gift Card Processing ──
    if (gift_card_code && gift_card_discount > 0) {
      await conn.query("UPDATE gift_cards SET balance = GREATEST(balance - ?, 0) WHERE code = ?", [gift_card_discount, gift_card_code]);
    }

    await conn.commit();

    // Send admin notification email to zahratbeesanshop@gmail.com
    const adminEmailToNotify = process.env.STORE_ADMIN_EMAIL || 'zahratbeesanshop@gmail.com';
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        transporter.sendMail({
          from: `"زهرة بيسان" <${process.env.SMTP_USER}>`,
          to: adminEmailToNotify,
          subject: `🛍️ طلب جديد بقيمة ${totalAmount} JOD من ${customer_name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
              <h2 style="color: #c5a880;">وصل طلب جديد على متجر زهرة بيسان!</h2>
              <p><b>رقم الطلب:</b> #${orderId}</p>
              <p><b>اسم العميلة:</b> ${customer_name}</p>
              <p><b>رقم الهاتف:</b> ${phone || 'غير مدخل'}</p>
              <p><b>البريد الإلكتروني:</b> ${email || 'غير مدخل'}</p>
              <p><b>عنوان التوصيل:</b> ${delivery_address || 'استلام'}</p>
              <p style="font-size: 1.2rem; color: #5c3d1e;"><b>المبلغ الإجمالي:</b> ${totalAmount} JOD</p>
            </div>
          `
        }).catch(e => console.error('[Order Notification Email Error]:', e.message));
      } catch (_) {}
    }

    res.status(201).json({ success: true, orderId });

  } catch (err) {
    console.error('[Server] CRITICAL Order Error:', err.message);
    await conn.rollback();
    const isOutOfStock = err.message.includes('out of stock') || err.message.includes('Insufficient stock');
    if (isOutOfStock) {
      return res.status(409).json({
        success: false,
        outOfStock: true,
        error: err.message
      });
    }
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

const getAutoStoreStatus = () => {
  // Use Jordan Time (Asia/Amman = UTC+3) for auto-calculation
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Amman' }));
  const day = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  if (day >= 1 && day <= 5) {
    return (currentTime >= 730 && currentTime < 1700) ? 'open' : 'closed';
  }
  if (day === 6) {
    return (currentTime >= 900 && currentTime < 1800) ? 'open' : 'closed';
  }
  if (day === 0) {
    return (currentTime >= 1000 && currentTime < 1600) ? 'open' : 'closed';
  }
  return 'closed';
};

app.get('/api/store-status', (req, res) => {
  db.query('SELECT value FROM site_settings WHERE `key` = ? LIMIT 1', ['store_status'], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    let mode = results.length > 0 ? results[0].value : 'auto';
    let currentState = mode;
    if (mode === 'auto') currentState = getAutoStoreStatus();
    else if (mode === 'manual_open') currentState = 'open';
    else if (mode === 'manual_closed') currentState = 'closed';
    res.json({ mode, status: currentState, display: mode === 'auto' ? `Automatic (${currentState.toUpperCase()})` : mode.replace('_', ' ').toUpperCase() });
  });
});

app.post('/api/store-status', (req, res) => {
  const { status } = req.body;
  // Use a two-step process to be 100% sure on all MySQL versions
  db.query('DELETE FROM site_settings WHERE `key` = ?', ['store_status'], (err) => {
    if (err) console.error('Delete old status error:', err);
    db.query('INSERT INTO site_settings (`key`, `value`) VALUES (?, ?)', ['store_status', status], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, mode: status });
    });
  });
});

db.query(`CREATE TABLE IF NOT EXISTS contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, message TEXT NOT NULL, status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure contact_messages table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS job_applications (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(60) DEFAULT NULL, position VARCHAR(255) DEFAULT NULL, cover_letter TEXT DEFAULT NULL, resume_url VARCHAR(1024) DEFAULT NULL, status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure job_applications table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS careers (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, type VARCHAR(100) DEFAULT 'Full-time', location VARCHAR(255) DEFAULT 'As-Salt', description TEXT, active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure careers table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS site_settings (\`key\` VARCHAR(255) PRIMARY KEY, \`value\` TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure site_settings table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS offers (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, discount_percent DECIMAL(5,2), active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure offers table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS social_pixels (
  id INT PRIMARY KEY DEFAULT 1,
  meta_pixel_id VARCHAR(255) DEFAULT '',
  snap_pixel_id VARCHAR(255) DEFAULT '',
  tiktok_pixel_id VARCHAR(255) DEFAULT '',
  meta_token TEXT,
  snap_token TEXT,
  tiktok_token TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure social_pixels table error:', err); });

db.query(`CREATE TABLE IF NOT EXISTS chat_messages (id INT AUTO_INCREMENT PRIMARY KEY, user_msg TEXT, ai_msg TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure chat_messages table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS ai_assistant_messages (id INT AUTO_INCREMENT PRIMARY KEY, admin_query TEXT, ai_response TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure ai_assistant_messages table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS loyalty_members (
  phone_number VARCHAR(60) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure loyalty_members table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS loyalty_points_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(60) NOT NULL,
  points_change INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  order_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure loyalty_points_history table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS pre_order_interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure pre_order_interests table error:', err); });
db.query("SHOW COLUMNS FROM menu_items LIKE 'pre_order'", (err, results) => {
  if (!err && results.length === 0) {
    db.query("ALTER TABLE menu_items ADD COLUMN pre_order TINYINT(1) DEFAULT 0", (errAlter) => {
      if (errAlter) console.error('Add pre_order column error:', errAlter);
    });
  }
});
db.query("SHOW COLUMNS FROM orders LIKE 'gift_fee'", (err, results) => {
  if (!err && results.length === 0) {
    // We use IGNORE or try to add them individually if they might exist.
    // However, since we know gift_fee is missing, we can add it. If is_gift is missing, we should add it too.
    db.query("ALTER TABLE orders ADD COLUMN is_gift TINYINT(1) DEFAULT 0", () => {});
    db.query("ALTER TABLE orders ADD COLUMN gift_message TEXT DEFAULT NULL", () => {});
    db.query("ALTER TABLE orders ADD COLUMN gift_packaging VARCHAR(100) DEFAULT NULL", () => {});
    db.query("ALTER TABLE orders ADD COLUMN gift_fee DECIMAL(10,2) DEFAULT 0.00", () => {});
  }
});

let categoryNameColumn = 'name';

db.query("SELECT * FROM categories", (err, categories) => {
  if (err) return console.error('Category Check Error:', err);

  if (categories.length === 0) {
    db.query("INSERT INTO categories (name) VALUES ('Coffee'), ('Drinks'), ('Food'), ('Sweets')", (iErr) => {
      if (!iErr) console.log('[Data Integrity] Initialized default categories.');
    });
  } else {
    const firstRow = categories[0];
    categoryNameColumn = Object.keys(firstRow).find(key =>
      ['name', 'label', 'title', 'category_name', 'name_ar'].includes(key.toLowerCase())
    ) || Object.keys(firstRow)[1];

    console.log(`[Data Integrity] Detected Category Name Column: '${categoryNameColumn}'`);

    const catMap = {
      'espresso': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('coffee'))?.id,
      'tea': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('tea'))?.id,
      'cold': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('cold'))?.id,
      'food': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('food'))?.id,
      'sweets': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('sweet'))?.id,
      'soft': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('soft'))?.id
    };

    Object.keys(catMap).forEach(oldKey => {
      const newId = catMap[oldKey];
      if (newId && newId != oldKey) {
        db.query("UPDATE menu_items SET category_id = ? WHERE category_id = ?", [newId, oldKey]);
      }
    });

    db.query("UPDATE menu_items SET category_id = ? WHERE category_id IS NULL OR category_id = ''", [categories[0].id]);
  }
});

db.query("SHOW COLUMNS FROM menu_items LIKE 'image_url'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN image_url VARCHAR(1024) DEFAULT NULL");
});
db.query("SHOW COLUMNS FROM menu_items LIKE 'size_chart'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN size_chart LONGTEXT DEFAULT NULL");
});
db.query("SHOW COLUMNS FROM menu_items LIKE 'video_url'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN video_url VARCHAR(1024) DEFAULT NULL");
});
db.query("SHOW COLUMNS FROM menu_items LIKE 'weight'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN weight VARCHAR(100) DEFAULT NULL");
});
db.query("SHOW COLUMNS FROM menu_items LIKE 'created_at'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
});
db.query(`CREATE TABLE IF NOT EXISTS product_reviews (id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, reviewer_name VARCHAR(255) DEFAULT NULL, comment TEXT DEFAULT NULL, rating TINYINT(1) DEFAULT 5, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES menu_items(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure product_reviews table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS general_feedback (id INT AUTO_INCREMENT PRIMARY KEY, reviewer_name VARCHAR(255) DEFAULT 'Anonymous', comment TEXT DEFAULT NULL, rating TINYINT(1) DEFAULT 5, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure general_feedback table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS store_reviews (id INT AUTO_INCREMENT PRIMARY KEY, reviewer_name VARCHAR(255) DEFAULT 'Anonymous', comment TEXT DEFAULT NULL, rating TINYINT(1) DEFAULT 5, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure store_reviews table error:', err); });
db.query("SELECT * FROM tags WHERE name LIKE '%COFFEE%' OR name LIKE '%TEA%' OR name LIKE '%HOT%' OR name = 'CLASSICCOFFEE'", (err, results) => {
  if (!err && results && results.length > 0) {
    db.query("DELETE FROM menu_item_tags");
    db.query("DELETE FROM tags");
    const fashionTags = ['عرائسي', 'قفطان', 'عبايات ملكية', 'مناسبات', 'فاخر', 'تطريز يدوي', 'جديد', 'الأكثر مبيعاً', 'تشكيلة العروس', 'حرير ناعم', 'كريب فاخر', 'مخمل ملوكي', 'طقم كامل'];
    fashionTags.forEach(tag => {
      db.query("INSERT IGNORE INTO tags (name) VALUES (?)", [tag]);
    });
    console.log("[Data Integrity] Purged legacy beverage tags and initialized fashion abaya tags.");
  }
});
db.query("SELECT * FROM addons WHERE name LIKE '%Shot%' OR name LIKE '%Syrup%' OR name LIKE '%Caramel%' OR name LIKE '%Vanilla%'", (err, results) => {
  if (!err && results && results.length > 0) {
    db.query("DELETE FROM menu_item_addons");
    db.query("DELETE FROM addons");
    db.query("UPDATE menu_items SET addons = NULL");
    const fashionAddons = [
      { name: 'طرحة حريرية مطابقة', price: 10.00 },
      { name: 'حزام ذهبي مطرز', price: 15.00 },
      { name: 'تغليف هدايا ملكي', price: 5.00 },
      { name: 'بطانة إضافية', price: 8.00 },
      { name: 'تعديل الطول مجاناً', price: 0.00 }
    ];
    fashionAddons.forEach(a => {
      db.query("INSERT INTO addons (name, price) VALUES (?, ?)", [a.name, a.price]);
    });
    console.log("[Data Integrity] Purged legacy beverage addons and initialized fashion abaya addons.");
  }
});
    // Enhanced migration check for Azure MySQL compatibility
    db.query("SHOW COLUMNS FROM orders LIKE 'estimated_ready_at'", (err, results) => {
      if (!err && results.length === 0) {
        db.query("ALTER TABLE orders ADD COLUMN estimated_ready_at DATETIME DEFAULT NULL", (err) => {
          if (!err) console.log("[Migration] Added estimated_ready_at to orders");
        });
      }
    });

    db.query("SHOW COLUMNS FROM orders LIKE 'delivery_address'", (err, results) => {
      if (!err && results.length === 0) {
        db.query("ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT NULL", (err) => {
          if (!err) console.log("[Migration] Added delivery_address to orders");
        });
      }
    });

    db.query("SHOW COLUMNS FROM orders LIKE 'phone'", (err, results) => {
      if (!err && results.length === 0) {
        db.query("ALTER TABLE orders ADD COLUMN phone VARCHAR(50) DEFAULT NULL", (err) => {
          if (!err) console.log("[Migration] Added phone to orders");
        });
      }
    });
db.query(`CREATE TABLE IF NOT EXISTS ai_insights_cache (id INT AUTO_INCREMENT PRIMARY KEY, topic VARCHAR(100) UNIQUE, content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure ai_insights_cache table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS admin_logs (id INT AUTO_INCREMENT PRIMARY KEY, admin_email VARCHAR(255) NOT NULL, admin_name VARCHAR(255) DEFAULT NULL, action VARCHAR(255) NOT NULL, details TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure admin_logs table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS blog_posts (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, content TEXT, excerpt TEXT, image_url VARCHAR(1024), author VARCHAR(100) DEFAULT 'إدارة زهرة بيسان', status VARCHAR(50) DEFAULT 'published', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure blog_posts table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS ai_assistant_logs (id INT AUTO_INCREMENT PRIMARY KEY, admin_query TEXT, ai_response TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure ai_assistant_logs table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS abandoned_carts (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), phone VARCHAR(60), cart_items JSON, total_price DECIMAL(10,2), status VARCHAR(50) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure abandoned_carts table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS tech_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  email VARCHAR(255) DEFAULT '',
  company VARCHAR(255) DEFAULT '',
  service VARCHAR(255) DEFAULT '',
  budget VARCHAR(100) DEFAULT '',
  details TEXT,
  estimated_quote VARCHAR(100) DEFAULT '',
  calculator_details TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure tech_leads table error:', err); });

db.query(`CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => {
  if (err) console.error('Ensure admin_users table error:', err);
  else {
    db.query('SELECT COUNT(*) as count FROM admin_users', (err, results) => {
      if (!err && results[0].count === 0) {
        db.query("INSERT INTO admin_users (name, email, password, role) VALUES ('Sultan', 'sultan@zahratbeesan.com', 'sultan2026', 'super_admin'), ('Zuhair', 'zuhair@zahratbeesan.com', 'zuhair2026', 'admin')");
      }
    });
  }
});
// Addons not used in Zahrat Beesan abaya store

// --- Calorie Migration: add calories_per_unit to inventory if missing ---
db.query("SHOW COLUMNS FROM inventory LIKE 'calories_per_unit'", (err, results) => {
  if (!err && results.length === 0) {
    db.query("ALTER TABLE inventory ADD COLUMN calories_per_unit DECIMAL(8,2) DEFAULT 0", (alterErr) => {
      if (!alterErr) {
        console.log('[Migration] Added calories_per_unit column to inventory.');
        // Seed intelligent default calorie values based on common ingredient names
        const calorieDefaults = [
          // Dairy
          { keyword: 'milk',          cal: 0.61  }, // kcal per ml
          { keyword: 'cream',         cal: 3.40  }, // kcal per ml
          { keyword: 'oat milk',      cal: 0.45  },
          { keyword: 'soy milk',      cal: 0.33  },
          { keyword: 'almond milk',   cal: 0.15  },
          { keyword: 'butter',        cal: 7.17  }, // kcal per gram
          // Coffee & Tea
          { keyword: 'espresso',      cal: 0.02  }, // kcal per ml brewed
          { keyword: 'coffee',        cal: 0.02  },
          { keyword: 'tea',           cal: 0.01  },
          // Sweeteners
          { keyword: 'sugar',         cal: 3.87  }, // kcal per gram
          { keyword: 'syrup',         cal: 2.60  },
          { keyword: 'honey',         cal: 3.04  },
          { keyword: 'vanilla',       cal: 2.88  },
          { keyword: 'caramel',       cal: 3.80  },
          { keyword: 'chocolate',     cal: 5.46  },
          { keyword: 'cocoa',         cal: 2.28  },
          // Proteins & Fats
          { keyword: 'egg',           cal: 1.43  }, // kcal per gram
          { keyword: 'flour',         cal: 3.64  },
          { keyword: 'oat',           cal: 3.89  },
          { keyword: 'almond',        cal: 5.79  },
          { keyword: 'protein',       cal: 4.00  },
          // Flavours & Syrups
          { keyword: 'matcha',        cal: 2.30  },
          { keyword: 'hazelnut',      cal: 6.28  },
          { keyword: 'cinnamon',      cal: 2.47  },
          { keyword: 'ginger',        cal: 0.80  },
        ];
        calorieDefaults.forEach(({ keyword, cal }) => {
          db.query(
            `UPDATE inventory SET calories_per_unit = 
               CASE 
                 WHEN LOWER(unit) IN ('kg', 'liters', 'l') THEN ? * 1000 
                 ELSE ? 
               END 
             WHERE calories_per_unit = 0 AND LOWER(item_name) LIKE ?`,
            [cal, cal, `%${keyword}%`]
          );
        });
        console.log('[Migration] Seeded default calorie values for inventory items.');
      } else {
        console.error('[Migration] Failed to add calories_per_unit:', alterErr.message);
      }
    });
  }
});

db.query("SHOW COLUMNS FROM categories", (err, columns) => {
  if (!err) {
    const names = columns.map(c => c.Field);
    categoryNameColumn = names.includes('label') ? 'label' : 'name';
    console.log(`[Data Integrity] Using Category Name Column: '${categoryNameColumn}'`);
  }
});

// Helper to send instant notification email to official store email
async function sendStoreNotificationEmail({ subject, title, senderName, senderEmail, senderPhone, content, detailsHtml = '' }) {
  const storeEmail = process.env.STORE_EMAIL || process.env.SMTP_USER || 'zahratbeesanshop@gmail.com';
  const smtpUser = process.env.SMTP_USER || 'zahratbeesanshop@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpPass) {
    console.log(`[Notification Info] Message logged in database and visible in /admin/messages. (Set SMTP_PASS in Azure app settings for automated Gmail forwarding).`);
    return false;
  }

  try {
    const emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await emailTransporter.sendMail({
      from: `"متجر زهرة بيسان" <${smtpUser}>`,
      to: storeEmail,
      replyTo: senderEmail || storeEmail,
      subject: subject,
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: right; background-color: #fcf9f5; padding: 25px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e8dfd8;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #b8943a; margin: 0; font-size: 22px;">👑 متجر زهرة بيسان الفاخر</h2>
            <p style="color: #555; font-size: 15px; font-weight: bold; margin-top: 5px;">${title}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 20px; line-height: 1.8;">
            <p style="margin: 6px 0;"><strong>👤 اسم العميل:</strong> ${senderName || 'غير محدد'}</p>
            <p style="margin: 6px 0;"><strong>📧 البريد الإلكتروني:</strong> <a href="mailto:${senderEmail}" style="color: #b8943a; font-weight: bold;">${senderEmail || 'غير محدد'}</a></p>
            ${senderPhone ? `<p style="margin: 6px 0;"><strong>📱 الهاتف:</strong> <a href="tel:${senderPhone}" style="color: #b8943a; font-weight: bold;">${senderPhone}</a></p>` : ''}
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
              <strong>📝 نص الرسالة:</strong>
              <p style="background: #fdfbf7; padding: 14px; border-radius: 6px; border-right: 4px solid #b8943a; white-space: pre-wrap; color: #222; margin-top: 8px; line-height: 1.6;">${content}</p>
            </div>
            ${detailsHtml}
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://zahratbeesan.com/admin/messages" style="background: #b8943a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
              فتح صندوق الرسائل في لوحة التحكم ←
            </a>
          </div>
          <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">تم إرسال هذا الإشعار تلقائياً من نظام متجر زهرة بيسان</p>
        </div>
      `
    });
    console.log(`[Email Sent] Instant message notification successfully forwarded to ${storeEmail}`);
    return true;
  } catch (err) {
    console.error(`[Email Sending Error]`, err.message);
    return false;
  }
}

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
  
  db.query('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)', [name, email, message], async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Asynchronously dispatch instant email notification to official store inbox
    sendStoreNotificationEmail({
      subject: `📬 رسالة تواصل جديدة من: ${name} (متجر زهرة بيسان)`,
      title: 'تم استلام استفسار / رسالة جديدة من نموذج التواصل',
      senderName: name,
      senderEmail: email,
      content: message
    }).catch(() => {});

    res.status(201).json({ success: true, id: result.insertId });
  });
});

app.get('/api/contact', (req, res) => {
  db.query('SELECT * FROM contact_messages ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/contact/:id/read', (req, res) => {
  const { is_read } = req.body;
  db.query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/contact/:id', (req, res) => {
  db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Message deleted successfully' });
  });
});

app.get('/api/feedback', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [generalFeedback] = await promiseDb.query('SELECT * FROM general_feedback ORDER BY created_at DESC');
    const [storeReviews] = await promiseDb.query('SELECT * FROM store_reviews ORDER BY created_at DESC');
    const [productReviews] = await promiseDb.query(`SELECT pr.*, m.name as product_name FROM review pr JOIN menu_items m ON pr.productId = m.id ORDER BY pr.createdAt DESC`);
    res.status(200).json({ general: generalFeedback, store: storeReviews, products: productReviews });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/feedback/general', (req, res) => {
  const { reviewer_name, comment, rating } = req.body;
  db.query('INSERT INTO general_feedback (reviewer_name, comment, rating) VALUES (?, ?, ?)', [reviewer_name || 'Anonymous', comment, rating || 5], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Feedback submitted successfully', id: result.insertId });
  });
});

app.post('/api/feedback/product', (req, res) => {
  const { product_id, reviewer_name, comment, rating } = req.body;
  if (!product_id) return res.status(400).json({ error: 'Product ID is required' });
  db.query('INSERT INTO product_reviews (product_id, reviewer_name, comment, rating) VALUES (?, ?, ?, ?)', [product_id, reviewer_name || 'Anonymous', comment, rating || 5], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Review submitted successfully', id: result.insertId });
  });
});

const MENU_ITEM_JOIN_CONDITION = `
  JOIN menu_items mi ON (
    TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = mi.name
    OR TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = TRIM(mi.name)
    OR REPLACE(TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)), '_', ' ') = mi.name
    OR (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = 'Hot Chocolate' AND mi.name = 'British Hot Chocolate')
    OR (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = 'Pour-Over Filter' AND mi.name = 'Pour-Over Filter Coffee')
  )
`;

app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [[products]] = await promiseDb.query("SELECT COUNT(*) as count FROM menu_items");
    const [[orders]] = await promiseDb.query("SELECT COUNT(*) as count FROM orders");
    const [[sales]] = await promiseDb.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders");
    const [lowStockItems] = await promiseDb.query("SELECT item_name, quantity, min_threshold FROM inventory WHERE quantity <= min_threshold");
    const [dailySales] = await promiseDb.query(`SELECT DATE(created_at) as date, SUM(total_amount) as total FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`);
    // Dynamically detect category column name to avoid 'Unknown column' errors
    const [catCols] = await promiseDb.query("SHOW COLUMNS FROM categories");
    const catColNames = catCols.map(c => c.Field);
    const resolvedCatCol = catColNames.includes('label') ? 'label' : (catColNames.includes('name') ? 'name' : catColNames[1] || 'name');
    const [categoryStats] = await promiseDb.query(`SELECT COALESCE(c.${resolvedCatCol}, 'Other') as name, SUM(oi.quantity) as count FROM order_items oi ${MENU_ITEM_JOIN_CONDITION} LEFT JOIN categories c ON mi.category_id = c.id GROUP BY COALESCE(c.${resolvedCatCol}, 'Other')`);
    const [[todayStats]] = await promiseDb.query("SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE DATE(created_at) = CURDATE()");
    const [[yesterdayStats]] = await promiseDb.query("SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)");
    const [[statusSetting]] = await promiseDb.query("SELECT value FROM site_settings WHERE `key` = 'store_status'");
    const mode = statusSetting ? statusSetting.value : 'auto';
    let currentState = mode;
    if (mode === 'auto') currentState = getAutoStoreStatus();
    else if (mode === 'manual_open') currentState = 'open';
    else if (mode === 'manual_closed') currentState = 'closed';

    const [topProducts] = await promiseDb.query(`
      SELECT mi.name as item_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      ${MENU_ITEM_JOIN_CONDITION}
      WHERE oi.item_name NOT IN (SELECT name FROM addons)
      GROUP BY mi.id, mi.name
      ORDER BY total_sold DESC
      LIMIT 6
    `);

    // Profit: sum(price_num - cost_price - tax_amount) for all products that have been sold
    const [[profitStats]] = await promiseDb.query(`
      SELECT
        COALESCE(SUM(oi.quantity * (mi.price_num - COALESCE(mi.cost_price,0) - COALESCE(mi.tax_amount,0))), 0) as totalProfit,
        COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURDATE() THEN oi.quantity * (mi.price_num - COALESCE(mi.cost_price,0) - COALESCE(mi.tax_amount,0)) ELSE 0 END), 0) as todayProfit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      ${MENU_ITEM_JOIN_CONDITION}
      WHERE mi.cost_price > 0
    `).catch(() => [[{ totalProfit: 0, todayProfit: 0 }]]);

    res.json({ 
      totalProducts: products.count, 
      totalOrders: orders.count, 
      totalSales: sales.total || 0, 
      todayOrders: todayStats.count || 0, 
      todaySales: todayStats.revenue || 0, 
      yesterdayOrders: yesterdayStats.count || 0, 
      yesterdaySales: yesterdayStats.revenue || 0, 
      storeStatus: currentState, 
      storeMode: mode, 
      lowStock: lowStockItems.length, 
      lowStockItems, 
      dailySales, 
      categoryStats,
      topProducts: topProducts || [],
      totalProfit: parseFloat(profitStats?.totalProfit || 0),
      todayProfit: parseFloat(profitStats?.todayProfit || 0)
    });
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// â”€â”€ Monthly Analytics API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /api/analytics-monthly?year=2026&month=5
app.get('/api/analytics-monthly', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);

    // Total revenue & orders for the month
    const [[monthStats]] = await promiseDb.query(
      `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_amount),0) as totalSales
       FROM orders WHERE YEAR(created_at)=? AND MONTH(created_at)=?`,
      [year, month]
    );

    const [[costStats]] = await promiseDb.query(
      `SELECT COALESCE(SUM(oi.quantity * oi.cost_price), 0) as totalCost, COALESCE(SUM(oi.quantity * oi.tax_amount), 0) as totalTax
       FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE YEAR(o.created_at)=? AND MONTH(o.created_at)=?`,
      [year, month]
    );

    // Active products count (unchanged, always current)
    const [[products]] = await promiseDb.query(`SELECT COUNT(*) as count FROM menu_items`);

    // Top products this month (name, units sold, revenue)
    const [topProducts] = await promiseDb.query(
      `SELECT mi.name as item_name,
              SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       ${MENU_ITEM_JOIN_CONDITION}
       WHERE YEAR(o.created_at)=? AND MONTH(o.created_at)=?
         AND oi.item_name NOT IN (SELECT name FROM addons)
       GROUP BY mi.id, mi.name
       ORDER BY total_sold DESC
       LIMIT 6`,
      [year, month]
    );

    // Daily sales within that month (for the bar chart)
    const [dailySales] = await promiseDb.query(
      `SELECT DATE(created_at) as date, SUM(total_amount) as total
       FROM orders WHERE YEAR(created_at)=? AND MONTH(created_at)=?
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [year, month]
    );

    // Category stats for that month
    // Dynamically detect category column name to avoid 'Unknown column' errors
    const [catColsM] = await promiseDb.query("SHOW COLUMNS FROM categories");
    const catColNamesM = catColsM.map(c => c.Field);
    const resolvedCatColM = catColNamesM.includes('label') ? 'label' : (catColNamesM.includes('name') ? 'name' : catColNamesM[1] || 'name');
    const [categoryStats] = await promiseDb.query(
      `SELECT COALESCE(c.${resolvedCatColM}, 'Other') as name, SUM(oi.quantity) as count 
       FROM order_items oi 
       ${MENU_ITEM_JOIN_CONDITION} 
       JOIN orders o ON oi.order_id = o.id
       LEFT JOIN categories c ON mi.category_id = c.id 
       WHERE YEAR(o.created_at)=? AND MONTH(o.created_at)=?
       GROUP BY COALESCE(c.${resolvedCatColM}, 'Other')`,
      [year, month]
    );

    const totalOrders = monthStats.totalOrders || 0;
    const totalSales  = parseFloat(monthStats.totalSales) || 0;

    res.json({
      totalOrders,
      totalSales,
      totalCost: costStats.totalCost || 0,
      totalTax: costStats.totalTax || 0,
      totalProfit: totalSales - (costStats.totalCost || 0) - (costStats.totalTax || 0),
      totalProducts: products.count,
      avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders) : 0,
      topProducts: topProducts || [],
      dailySales: dailySales || [],
      categoryStats: categoryStats || []
    });
  } catch (err) {
    console.error('[Monthly Analytics Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ Date-Range Analytics API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /api/analytics-range?from=2026-01-01&to=2026-05-15
app.get('/api/analytics-range', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const from = req.query.from || '2000-01-01';
    const to   = req.query.to   || new Date().toISOString().split('T')[0];

    const [[rangeStats]] = await promiseDb.query(
      `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_amount),0) as totalSales
       FROM orders WHERE DATE(created_at) BETWEEN ? AND ?`,
      [from, to]
    );

    const [[costStats]] = await promiseDb.query(
      `SELECT COALESCE(SUM(oi.quantity * oi.cost_price), 0) as totalCost, COALESCE(SUM(oi.quantity * oi.tax_amount), 0) as totalTax
       FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) BETWEEN ? AND ?`,
      [from, to]
    );

    const [dailySales] = await promiseDb.query(
      `SELECT DATE(created_at) as date, SUM(total_amount) as total
       FROM orders WHERE DATE(created_at) BETWEEN ? AND ?
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [from, to]
    );

    const [topProducts] = await promiseDb.query(
      `SELECT mi.name as item_name,
              SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       ${MENU_ITEM_JOIN_CONDITION}
       WHERE DATE(o.created_at) BETWEEN ? AND ?
         AND oi.item_name NOT IN (SELECT name FROM addons)
       GROUP BY mi.id, mi.name
       ORDER BY total_sold DESC
       LIMIT 6`,
      [from, to]
    );

    // Category stats for that range
    const [categoryStats] = await promiseDb.query(
      `SELECT COALESCE(c.${categoryNameColumn}, 'Other') as name, SUM(oi.quantity) as count 
       FROM order_items oi 
       ${MENU_ITEM_JOIN_CONDITION} 
       JOIN orders o ON oi.order_id = o.id
       LEFT JOIN categories c ON mi.category_id = c.id 
       WHERE DATE(o.created_at) BETWEEN ? AND ?
       GROUP BY COALESCE(c.${categoryNameColumn}, 'Other')`,
      [from, to]
    );

    const totalOrders = rangeStats.totalOrders || 0;
    const totalSales  = parseFloat(rangeStats.totalSales) || 0;

    res.json({
      totalOrders,
      totalSales,
      totalCost: costStats.totalCost || 0,
      totalTax: costStats.totalTax || 0,
      totalProfit: totalSales - (costStats.totalCost || 0) - (costStats.totalTax || 0),
      avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders) : 0,
      topProducts: topProducts || [],
      dailySales: dailySales || [],
      categoryStats: categoryStats || []
    });
  } catch (err) {
    console.error('[Range Analytics Error]', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics-all-sold-products', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const { from, to, year, month, mode } = req.query;
    let query = `
      SELECT mi.name as item_name, 
             COALESCE(AVG(oi.price), mi.price_num) as unit_price,
             COALESCE(SUM(oi.quantity), 0) as total_sold,
             COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
      FROM menu_items mi
      LEFT JOIN order_items oi ON (
        (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = mi.name
         OR TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = TRIM(mi.name)
         OR REPLACE(TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)), '_', ' ') = mi.name
         OR (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = 'Hot Chocolate' AND mi.name = 'British Hot Chocolate')
         OR (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = 'Pour-Over Filter' AND mi.name = 'Pour-Over Filter Coffee'))
        AND (oi.item_name NOT IN (SELECT name FROM addons) OR oi.item_name IS NULL)
      )
      LEFT JOIN orders o ON oi.order_id = o.id
    `;
    const params = [];
    if (mode === 'monthly') {
      query += ` AND YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?`;
      params.push(parseInt(year) || new Date().getFullYear(), parseInt(month) || (new Date().getMonth() + 1));
    } else if (mode === 'range') {
      query += ` AND DATE(o.created_at) BETWEEN ? AND ?`;
      params.push(from || '2000-01-01', to || new Date().toISOString().split('T')[0]);
    }
    query += ` GROUP BY mi.id, mi.name ORDER BY total_sold DESC`;
    const [results] = await promiseDb.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('[All Sold Products Error]', err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/offers', (req, res) => {
  db.query('SELECT * FROM offers ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/offers', (req, res) => {
  const { product_name, discount_percent, reason, end_date, active } = req.body;
  db.query('INSERT INTO offers (product_name, discount_percent, reason, end_date, active) VALUES (?, ?, ?, ?, ?)', [product_name, discount_percent, reason, end_date || null, active ?? 1], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Add Offer', `Added offer for ${product_name}`);
    res.json({ message: 'Offer created', id: result.insertId });
  });
});

app.put('/api/offers/:id', (req, res) => {
  const { id } = req.params;
  const { product_name, discount_percent, reason, end_date, active } = req.body;
  db.query('UPDATE offers SET product_name = ?, discount_percent = ?, reason = ?, end_date = ?, active = ? WHERE id = ?', [product_name, discount_percent, reason, end_date || null, active ?? 1, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Edit Offer', `Updated offer for ${product_name}`);
    res.json({ message: 'Offer updated' });
  });
});

app.delete('/api/offers/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM offers WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Delete Offer', `Deleted offer ID: ${id}`);
    res.json({ message: 'Offer deleted' });
  });
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);
  try {
    const [results] = await db.promise().query(
      `SELECT id, name, price, images, category_id FROM menu_items WHERE available=1 AND (name LIKE ? OR description LIKE ?) LIMIT 8`,
      [`%${q}%`, `%${q}%`]
    );
    res.json(results.map(r => ({
      ...r,
      images: (() => { try { return JSON.parse(r.images || '[]'); } catch(e) { return []; } })()
    })));
  } catch(err) {
    res.status(500).json([]);
  }
});

app.get('/api/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.json(results);
  });
});

// Addons API — not used in Zahrat Beesan abaya store
app.get('/api/addons',       (req, res) => res.json([]));
app.post('/api/addons',      (req, res) => res.status(404).json({ error: 'Not used' }));
app.put('/api/addons/:id',   (req, res) => res.status(404).json({ error: 'Not used' }));
app.delete('/api/addons/:id',(req, res) => res.status(404).json({ error: 'Not used' }));

app.get('/api/tags', (req, res) => {
  db.query('SELECT * FROM tags ORDER BY name ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/tags', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const [existing] = await db.promise().query('SELECT * FROM tags WHERE name = ?', [name]);
    if (existing.length > 0) return res.json(existing[0]);
    const [result] = await db.promise().query('INSERT INTO tags (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    await db.promise().query('UPDATE tags SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ success: true, id, name: name.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query('DELETE FROM menu_item_tags WHERE tag_id = ?', [id]);
    await db.promise().query('DELETE FROM tags WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Royal Gift Cards Store & APIs ---
let inMemoryGiftCards = [
  {
    id: 1,
    code: 'BEESAN-VIP-9821',
    buyer_contact: '+962796697413',
    recipient_name: 'الأميرة سمو العلا',
    recipient_phone: '+966501234567',
    initial_value: 100,
    balance: 100,
    message: 'مع أطيب التمنيات بإطلالة ملكية ساحرة من دار زهرة بيسان ✦',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    code: 'BEESAN-VIP-4410',
    buyer_contact: 'zahratbeesanshop@gmail.com',
    recipient_name: 'السيدة الجوهرة',
    recipient_phone: '+962791112233',
    initial_value: 50,
    balance: 50,
    message: 'هدية راقية بمناسبة عيد ميلادكِ السعيد 👑',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

app.get('/api/admin/gift-cards', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM gift_cards ORDER BY id DESC');
    res.json(rows.length > 0 ? rows : inMemoryGiftCards);
  } catch (err) {
    res.json(inMemoryGiftCards);
  }
});

app.post('/api/gift-cards/purchase', async (req, res) => {
  const { amount, buyerContact, recipientPhone, recipientName, message } = req.body;
  if (!amount || (!recipientPhone && !req.body.recipientEmail)) {
    return res.status(400).json({ error: 'يرجى تحديد قيمة الهدية ورقم هاتف / واتساب المستلم الدولي' });
  }

  const randomCode = 'BEESAN-VIP-' + Math.floor(1000 + Math.random() * 9000);
  const newCard = {
    id: Date.now(),
    code: randomCode,
    buyer_contact: buyerContact || '',
    recipient_name: recipientName || 'المستلم العزيز',
    recipient_phone: recipientPhone || req.body.recipientEmail || '',
    initial_value: parseFloat(amount),
    balance: parseFloat(amount),
    message: message || '',
    status: 'active',
    created_at: new Date().toISOString()
  };

  inMemoryGiftCards.unshift(newCard);

  try {
    await db.promise().query(
      `INSERT INTO gift_cards (code, buyer_contact, recipient_name, recipient_phone, initial_value, balance, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [randomCode, buyerContact || '', recipientName || '', recipientPhone || '', amount, amount, message || '']
    );
  } catch (err) { }

  res.json({
    success: true,
    code: randomCode,
    amount,
    recipientPhone: newCard.recipient_phone,
    recipientName: newCard.recipient_name,
    message: newCard.message,
    buyerContact: newCard.buyer_contact
  });
});

app.post('/api/admin/gift-cards', async (req, res) => {
  const { amount, recipientName, recipientPhone, buyerContact, message } = req.body;
  if (!amount || !recipientPhone) {
    return res.status(400).json({ error: 'يرجى إدخال قيمة البطاقة ورقم واتساب المستلم الدولي' });
  }

  const randomCode = 'BEESAN-VIP-' + Math.floor(1000 + Math.random() * 9000);
  const newCard = {
    id: Date.now(),
    code: randomCode,
    buyer_contact: buyerContact || 'إصدار الأدمن المباشر',
    recipient_name: recipientName || 'المستلم العزيز',
    recipient_phone: recipientPhone,
    initial_value: parseFloat(amount),
    balance: parseFloat(amount),
    message: message || '',
    status: 'active',
    created_at: new Date().toISOString()
  };

  inMemoryGiftCards.unshift(newCard);

  try {
    await db.promise().query(
      `INSERT INTO gift_cards (code, buyer_contact, recipient_name, recipient_phone, initial_value, balance, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [randomCode, newCard.buyer_contact, recipientName || '', recipientPhone, amount, amount, message || '']
    );
  } catch (err) { }

  res.json({ success: true, card: newCard });
});

app.put('/api/admin/gift-cards/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const card = inMemoryGiftCards.find(c => String(c.id) === String(id));
  if (card) {
    card.status = status;
    if (status === 'used') card.balance = 0;
  }

  try {
    await db.promise().query('UPDATE gift_cards SET status = ?, balance = ? WHERE id = ?', [status, status === 'used' ? 0 : card?.initial_value || 0, id]);
  } catch (err) { }

  res.json({ success: true, status });
});



// ── Loyalty Program APIs ──────────────────────────────────────────
app.get('/api/vip-customers', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        o.phone,
        o.customer_name,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        MAX(o.created_at) as last_order,
        COALESCE(lm.points, 0) as loyalty_points
      FROM orders o
      LEFT JOIN loyalty_members lm ON lm.phone_number = o.phone
      GROUP BY o.phone, o.customer_name
      ORDER BY total_spent DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/loyalty/members', async (req, res) => {
  try {
    const [members] = await db.promise().query('SELECT * FROM loyalty_members ORDER BY points DESC, created_at DESC');
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/loyalty/member/:phone', async (req, res) => {
  const { phone } = req.params;
  const cleanPhone = phone.trim();
  try {
    const [members] = await db.promise().query('SELECT * FROM loyalty_members WHERE phone_number = ?', [cleanPhone]);
    const [history] = await db.promise().query('SELECT * FROM loyalty_points_history WHERE phone_number = ? ORDER BY created_at DESC', [cleanPhone]);
    
    if (members.length === 0) {
      return res.json({ phone_number: cleanPhone, customer_name: '', points: 0, history: [] });
    }
    res.json({ ...members[0], history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loyalty/adjust', async (req, res) => {
  const { phone_number, customer_name, points_change, action_type } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'Phone number is required' });
  const cleanPhone = phone_number.trim();
  const change = parseInt(points_change) || 0;
  const action = action_type || 'admin_adjustment';
  const name = (customer_name || 'عميلة مميزة').trim();

  const promiseDb = db.promise();
  try {
    const [members] = await promiseDb.query('SELECT * FROM loyalty_members WHERE phone_number = ?', [cleanPhone]);
    if (members.length === 0) {
      const startingPoints = Math.max(0, change);
      await promiseDb.query('INSERT INTO loyalty_members (phone_number, customer_name, points) VALUES (?, ?, ?)', [cleanPhone, name, startingPoints]);
      if (startingPoints > 0) {
        await promiseDb.query('INSERT INTO loyalty_points_history (phone_number, points_change, action_type) VALUES (?, ?, ?)', [cleanPhone, startingPoints, action]);
      }
    } else {
      const newPoints = Math.max(0, members[0].points + change);
      await promiseDb.query('UPDATE loyalty_members SET points = ?, customer_name = ? WHERE phone_number = ?', [newPoints, name, cleanPhone]);
      await promiseDb.query('INSERT INTO loyalty_points_history (phone_number, points_change, action_type) VALUES (?, ?, ?)', [cleanPhone, change, action]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── Pre-Order System APIs ──────────────────────────────────────────
app.post('/api/pre-order/interest', async (req, res) => {
  const { product_id, customer_name, phone, email } = req.body;
  if (!product_id || !customer_name || !phone) {
    return res.status(400).json({ error: 'Missing required interest information' });
  }
  try {
    await db.promise().query(
      'INSERT INTO pre_order_interests (product_id, customer_name, phone, email) VALUES (?, ?, ?, ?)',
      [parseInt(product_id, 10), customer_name.trim(), phone.trim(), email ? email.trim() : null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pre-order/interests', async (req, res) => {
  try {
    const [interests] = await db.promise().query(`
      SELECT p.*, m.name as product_name, m.image_url 
      FROM pre_order_interests p
      JOIN menu_items m ON p.product_id = m.id
      ORDER BY p.created_at DESC
    `);
    res.json(interests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', (req, res) => {
  db.query("SELECT * FROM orders ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.status(200).json(results);
  });
});

app.get('/api/orders/:id', (req, res) => {
  db.query("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(results[0]);
  });
});

app.get('/api/order-status/:id', (req, res) => {
  const sql = `SELECT status, estimated_ready_at, GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), estimated_ready_at)) AS seconds_left FROM orders WHERE id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ status: results[0].status, seconds_left: results[0].seconds_left || 0 });
  });
});

app.put('/api/extend-order/:id', (req, res) => {
  const { id } = req.params;
  const { minutes } = req.body;
  if (!minutes) return res.status(400).json({ error: 'Minutes required' });
  const cleanMins = parseInt(minutes) || 2;
  const query = `UPDATE orders SET estimated_ready_at = DATE_ADD(GREATEST(COALESCE(estimated_ready_at, NOW()), NOW()), INTERVAL ${cleanMins} MINUTE), status = 'preparing' WHERE id = ?`;
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Extend Order Time', `Extended order #${id} by ${cleanMins} mins`);
    res.json({ success: true, message: `Preparation time extended by ${cleanMins} minutes` });
  });
});

app.put('/api/mark-ready/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });
  db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Update Order Status', `Marked order #${id} as ${status}`);
    res.json({ success: true, message: `Order status updated to ${status}` });

    // --- WhatsApp Auto-Notification ---
    const WA_TOKEN = process.env.WHATSAPP_TOKEN;
    const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    db.query("SELECT customer_name, phone FROM orders WHERE id = ?", [id], async (err2, rows) => {
      if (err2 || !rows.length) return;
      const order = rows[0];
      const rawPhone = order.phone ? order.phone.replace(/[^0-9]/g, '') : null;
      let message = null;
      if (status === 'shipped' || status === 'ready') {
        message = `مرحباً ${order.customer_name || ''} 🌸\n\nطلبك رقم #${id} من زهرة بيسان في طريقه إليكِ الآن! 🚚\n\nشكراً لثقتكِ بزهرة بيسان ✨`;
      } else if (status === 'delivered') {
        message = `مرحباً ${order.customer_name || ''} 🌸\n\nتم تسليم طلبك رقم #${id} بنجاح! 💛\n\nزهرة بيسان ✨`;
      } else if (status === 'cancelled') {
        message = `مرحباً ${order.customer_name || ''}\n\nنأسف، تم إلغاء طلبك رقم #${id}. للاستفسار تواصلي معنا.\n\nزهرة بيسان 🌸`;
      }
      if (message && rawPhone && WA_TOKEN && WA_PHONE_ID) {
        try {
          const phone = rawPhone.startsWith('962') ? rawPhone : `962${rawPhone.replace(/^0/, '')}`;
          const axios = require('axios');
          await axios.post(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`,
            { messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: message } },
            { headers: { 'Authorization': `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' } }
          );
          console.log(`[WhatsApp ✅] "${status}" sent to ${phone}`);
        } catch (waErr) {
          console.error('[WhatsApp ❌]', waErr.response?.data || waErr.message);
        }
      } else if (message) {
        console.log(`[WhatsApp - Add WHATSAPP_TOKEN & WHATSAPP_PHONE_ID to .env] Status: ${status}`);
      }
    });
  });
});

app.get('/api/order-items/:orderId', async (req, res) => {
  try {
    const [results] = await db.promise().query("SELECT oi.*, COALESCE(oi.item_name, m.name) as item_name FROM order_items oi LEFT JOIN menu_items m ON oi.product_id = m.id WHERE oi.order_id = ?", [req.params.orderId]);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/today-feature', async (req, res) => {
  try {
    const promiseDb = db.promise();
    // 1. Try to get the top-selling product
    const [topProducts] = await promiseDb.query(`
      SELECT mi.name, mi.description, c.${categoryNameColumn} as category_name, SUM(oi.quantity) as total_sold
      FROM order_items oi
      ${MENU_ITEM_JOIN_CONDITION}
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE oi.item_name NOT IN (SELECT name FROM addons)
      GROUP BY mi.id, mi.name, mi.description, c.${categoryNameColumn}
      ORDER BY total_sold DESC
      LIMIT 1
    `);

    if (topProducts && topProducts.length > 0) {
      const top = topProducts[0];
      return res.status(200).json({
        name: top.name,
        sub: `${top.category_name} · Specialty`
      });
    }

    // 2. If no sales exist, get the first available product
    const [firstProducts] = await promiseDb.query(`
      SELECT mi.name, mi.description, c.${categoryNameColumn} as category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.available = 1
      LIMIT 1
    `);

    if (firstProducts && firstProducts.length > 0) {
      const first = firstProducts[0];
      return res.status(200).json({
        name: first.name,
        sub: `${first.category_name} · Specialty`
      });
    }

    // 3. Fallback
    res.status(200).json({
      name: "Ethiopian Yirgacheffe",
      sub: "Pour-over · Single origin"
    });
  } catch (err) {
    console.error('Error fetching today feature:', err);
    res.status(200).json({
      name: "Ethiopian Yirgacheffe",
      sub: "Pour-over · Single origin"
    });
  }
});

app.get('/api/products', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {

    const promiseDb = db.promise();
    const [offers] = await promiseDb.query("SELECT * FROM offers WHERE active = 1 AND (end_date IS NULL OR end_date >= CURDATE())");
    const [allAddons] = await promiseDb.query('SELECT name, price FROM addons');
    const addonPriceMap = {};
    allAddons.forEach(a => { addonPriceMap[a.name.toLowerCase().trim()] = parseFloat(a.price); });

    // Fetch and parse all variants
    let variants = [];
    try {
      const [vRows] = await promiseDb.query('SELECT * FROM product_variants ORDER BY sort_order ASC, id ASC');
      variants = vRows.map(v => {
        try { v.colors = JSON.parse(v.colors || '[]'); } catch(e){ v.colors = []; }
        try { v.images = JSON.parse(v.images || '[]'); } catch(e){ v.images = []; }
        try { v.sizes = JSON.parse(v.sizes || '[]'); } catch(e){ v.sizes = []; }
        return v;
      });
    } catch(e) {
      console.error('Error fetching variants in products list:', e.message);
    }

    const [results] = await promiseDb.query(`
      SELECT m.*, 
        CASE WHEN m.available = 0 THEN 1 WHEN EXISTS (SELECT 1 FROM recipes r JOIN inventory i ON r.inventory_id = i.id WHERE r.menu_item_id = m.id AND i.quantity < r.quantity_required) THEN 1 ELSE 0 END as isOutOfStock,
        (SELECT GROUP_CONCAT(DISTINCT CONCAT(a.id, '|', a.name, '|', a.price)) FROM menu_item_addons mia JOIN addons a ON mia.addon_id = a.id WHERE mia.menu_item_id = m.id) as linked_addons,
        (SELECT GROUP_CONCAT(DISTINCT CONCAT(t.id, '|', t.name)) FROM menu_item_tags mit JOIN tags t ON mit.tag_id = t.id WHERE mit.menu_item_id = m.id) as linked_tags,
        (SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE product_id = m.id) as avg_rating,
        (SELECT COUNT(*) FROM product_reviews WHERE product_id = m.id) as total_reviews
      FROM menu_items m
      ORDER BY m.sort_order ASC
    `);

    const products = results.map(p => {
      const matchingOffer = offers.find(o => {
        const prodName = (p.name || '').toLowerCase();
        const offerProd = (o.product_name || '').toLowerCase();
        return prodName.includes(offerProd) || offerProd.includes(prodName) || offerProd === 'all';
      });
      let discountedPrice = null;
      if (matchingOffer && p.price_num) discountedPrice = parseFloat(p.price_num) * (1 - (matchingOffer.discount_percent / 100));

      let addonsArray = p.linked_addons ? p.linked_addons.split(',').map(pair => { const [id, name, price] = pair.split('|'); return { id, name, price: parseFloat(price) }; }) : [];
      if (addonsArray.length === 0 && p.addons) {
        addonsArray = p.addons.split(',').map((name, idx) => { const cleanName = name.trim(); return { id: `legacy-${idx}-${cleanName.replace(/\s+/g, '-')}`, name: cleanName, price: addonPriceMap[cleanName.toLowerCase()] || 0.50 }; });
      }
      const tagsArray = p.linked_tags ? p.linked_tags.split(',').map(pair => { const [id, name] = pair.split('|'); return { id, name }; }) : [];
      const prodVariants = variants.filter(v => v.product_id === p.id);
      const finalRating = p.avg_rating || (4.7 + ((p.id * 3) % 4) * 0.1);
      const finalReviewsCount = p.total_reviews || (Math.floor((p.id * 7) % 20) + 12);

      // Parse images JSON string to array safely
      let parsedImages = [];
      try {
        parsedImages = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
        if (!Array.isArray(parsedImages)) parsedImages = [];
      } catch(e) { parsedImages = []; }

      // Filter out dummy 12.png if real images exist
      const realParsedImages = parsedImages.filter(img => img && img !== '12.png' && img !== '/12.png');

      let canonicalImageUrl = null;
      if (p.image_url && typeof p.image_url === 'string' && p.image_url.trim() && p.image_url.trim() !== '12.png' && p.image_url.trim() !== '/12.png') {
        canonicalImageUrl = p.image_url.trim();
      } else if (realParsedImages.length > 0) {
        canonicalImageUrl = realParsedImages[0];
      } else if (p.image_url) {
        canonicalImageUrl = p.image_url.trim();
      } else if (parsedImages.length > 0) {
        canonicalImageUrl = parsedImages[0];
      }

      // Strictly deduplicate images based on normalized file path
      const normalizeImg = (s) => (s || '').trim().replace(/^\/+/, '').toLowerCase();
      const normCanonical = normalizeImg(canonicalImageUrl);
      const seenNorms = new Set();
      const uniqueImages = [];

      if (canonicalImageUrl) {
        seenNorms.add(normCanonical);
        uniqueImages.push(canonicalImageUrl);
      }

      realParsedImages.forEach(img => {
        const norm = normalizeImg(img);
        if (norm && !seenNorms.has(norm)) {
          seenNorms.add(norm);
          uniqueImages.push(img);
        }
      });


      return { 
        ...p,
        image_url: canonicalImageUrl || p.image_url || null,
        images: parsedImages,
        isOutOfStock: !!p.isOutOfStock, 
        linkedAddons: addonsArray, 
        linkedTags: tagsArray, 
        discounted_price: discountedPrice, 
        variants: prodVariants,
        avg_rating: parseFloat(finalRating),
        total_reviews: parseInt(finalReviewsCount)
      };

    });

    res.status(200).json(products);
  } catch (err) {
    console.error('Products Fetch Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/product/:id', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM menu_items WHERE id = ? AND available = 1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const p = rows[0];
    try { p.images = JSON.parse(p.images || '[]'); } catch(e) { p.images = []; }

    // Fetch product variants
    try {
      const [vRows] = await db.promise().query(
        'SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
        [p.id]
      );
      p.variants = vRows.map(v => {
        try { v.colors = JSON.parse(v.colors || '[]'); } catch(e){ v.colors = []; }
        try { v.images = JSON.parse(v.images || '[]'); } catch(e){ v.images = []; }
        try { v.sizes = JSON.parse(v.sizes || '[]'); } catch(e){ v.sizes = []; }
        return v;
      });
    } catch(e) { p.variants = []; }

    // Get reviews
    const [reviews] = await db.promise().query(
      'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 10',
      [p.id]
    );
    p.reviews = reviews || [];
    res.json(p);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inventory', (req, res) => {
  db.query("SELECT * FROM inventory", (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.status(200).json(results);
  });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });
  
  db.query('SELECT * FROM admin_users WHERE email = ? AND password = ?', [email.toLowerCase().trim(), password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (results.length > 0) {
      const user = results[0];
      db.query('INSERT INTO admin_logs (admin_email, admin_name, action, details) VALUES (?, ?, ?, ?)', [user.email, user.name, 'Login', 'Logged into the system'], () => { });
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// AI Cinematic Video Generator Endpoint (Image-to-Video Engine 12-15s, Watermark-Free)
// Dynamic HD Motion Video Generator for uploaded product images
function generateDynamicProductVideo(imagePaths, productName) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error('ffmpeg binary not found'));
    
    // Ensure all images are absolute local paths
    const validPaths = (Array.isArray(imagePaths) ? imagePaths : [imagePaths]).map(img => {
      if (!img || typeof img !== 'string') return null;
      if (img.startsWith('http')) return null;
      // Parse incoming "public/images/file.jpg" back to local path using dataDir
      const localP = path.join(dataDir, 'public', img.startsWith('/') ? img.slice(1) : img);
      return fs.existsSync(localP) ? localP : null;
    }).filter(Boolean);

    if (validPaths.length === 0) {
      return reject(new Error('لم يتم العثور على صورة محلية مضافة للمنتج لمعالجتها إلى فيديو'));
    }

    const videoFilename = `ai_video_${Date.now()}_${Math.floor(Math.random()*1000)}.mp4`;
    const outputPath = path.join(dataDir, 'public', 'images', videoFilename);
    const primaryImg = validPaths[0];

    // Ken Burns slow zoom-in & pan filter in 9:16 vertical HD (1080x1920) format
    const filterGraph = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0015,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1080x1920,fade=t=in:st=0:d=0.5,fade=t=out:st=5.5:d=0.5[v]`;

    const args = [
      '-loop', '1',
      '-i', primaryImg,
      '-vf', filterGraph,
      '-map', '[v]',
      '-t', '6',
      '-r', '30',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      '-y',
      outputPath
    ];

    execFile(ffmpegPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error('[ffmpeg] Video generation error:', stderr || error.message);
        return reject(error);
      }
      resolve(`/images/${videoFilename}`);
    });
  });
}

// AI Cinematic Video Generator Endpoint (Image-to-Video Engine, Watermark-Free)
app.post('/api/admin/generate-video', async (req, res) => {
  const { imageUrl, images, productName } = req.body;
  const imageList = Array.isArray(images) && images.length > 0 ? images : (imageUrl ? [imageUrl] : []);

  if (imageList.length === 0) {
    return res.status(400).json({ error: 'يرجى اختيار وتحديد صورة للمنتج أولاً لإنشاء الفيديو' });
  }

  const primaryImg = imageList[0];

  try {
    const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
    if (GEMINI_KEY) {
      let imageBase64, mimeType;
      if (primaryImg.startsWith('http')) {
        const imgFetch = await fetch(primaryImg);
        if (imgFetch.ok) {
          const imgBuffer = await imgFetch.arrayBuffer();
          imageBase64 = Buffer.from(imgBuffer).toString('base64');
          mimeType = imgFetch.headers.get('content-type') || 'image/jpeg';
        }
      } else {
        const localPath = path.join(dataDir, 'public', primaryImg.startsWith('/') ? primaryImg.slice(1) : primaryImg);
        if (fs.existsSync(localPath)) {
          const imgBuffer = fs.readFileSync(localPath);
          imageBase64 = imgBuffer.toString('base64');
          const ext = path.extname(primaryImg).toLowerCase().replace('.', '');
          mimeType = ext === 'jpg' ? 'image/jpeg' : (ext === 'png' ? 'image/png' : 'image/jpeg');
        }
      }

      if (imageBase64) {
        const imgBytes = Buffer.from(imageBase64, 'base64');
        const uploadRes = await fetch(
          `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': mimeType,
              'Content-Length': imgBytes.length,
              'X-Goog-Upload-Protocol': 'raw',
              'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: imgBytes
          }
        );
        const uploadData = await uploadRes.json();
        if (uploadData.file && uploadData.file.uri) {
          const fileUri = uploadData.file.uri;
          const prompt = `Elegant cinematic product video for a luxury abaya fashion item named "${productName || 'premium product'}". Smooth slow-motion camera pan, professional fashion lighting, ultra-HD quality, no watermark.`;

          const genRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning?key=${GEMINI_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instances: [{ prompt, image: { gcsUri: fileUri, mimeType } }],
                parameters: { aspectRatio: '9:16', durationSeconds: '8', sampleCount: 1, personGeneration: 'dont_allow' }
              })
            }
          );
          const genData = await genRes.json();
          if (genData.name) {
            const operationName = genData.name;
            let videoBytes = null;
            for (let i = 0; i < 36; i++) {
              await new Promise(r => setTimeout(r, 5000));
              const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${GEMINI_KEY}`);
              const pollData = await pollRes.json();
              if (pollData.done && !pollData.error) {
                const videoB64 = pollData.response?.predictions?.[0]?.bytesBase64Encoded;
                if (videoB64) { videoBytes = Buffer.from(videoB64, 'base64'); break; }
              }
            }

            if (videoBytes) {
              const videoFilename = `veo2_${Date.now()}.mp4`;
              const videoSavePath = path.join(dataDir, 'public', 'images', videoFilename);
              fs.writeFileSync(videoSavePath, videoBytes);

              return res.json({
                success: true,
                videoUrl: `/images/${videoFilename}`,
                duration: '8 seconds',
                model: 'Veo 2 AI'
              });
            }
          }
        }
      }
    }

    // Dynamic HD Motion Video Generation (Guaranteed custom video generated directly from the product image!)
    const generatedVideoUrl = await generateDynamicProductVideo(imageList, productName || 'عباية بيسان الملكية');
    return res.json({
      success: true,
      videoUrl: generatedVideoUrl,
      duration: '6 seconds',
      model: 'HD Product Video Engine'
    });

  } catch (err) {
    console.error('[generate-video] Engine Error:', err.message);
    try {
      const generatedVideoUrl = await generateDynamicProductVideo(imageList, productName || 'عباية بيسان الملكية');
      return res.json({
        success: true,
        videoUrl: generatedVideoUrl,
        duration: '6 seconds',
        model: 'HD Product Video Engine'
      });
    } catch (synthErr) {
      return res.status(500).json({ error: 'فشل توليد الفيديو من صورة المنتج: ' + synthErr.message });
    }
  }
});

// Admin Users CRUD (Staff Management)
app.get('/api/admin/users', (req, res) => {
  db.query('SELECT id, name, email, role, created_at FROM admin_users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/admin/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
  db.query('INSERT INTO admin_users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email.toLowerCase().trim(), password, role || 'admin'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  
  let q = 'UPDATE admin_users SET name = ?, email = ?, role = ?';
  let params = [name, email, role];
  
  if (password && password.trim() !== '') {
    q += ', password = ?';
    params.push(password);
  }
  
  q += ' WHERE id = ?';
  params.push(id);
  
  db.query(q, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM admin_users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ================= BLOG ENDPOINTS =================
// Public Get all published posts
app.get('/api/posts', (req, res) => {
  db.query("SELECT id, title, slug, excerpt, image_url, author, created_at FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Database Error' });
    res.json(results);
  });
});

// Public Get single post by id or slug
app.get('/api/posts/:slugOrId', (req, res) => {
  const param = req.params.slugOrId;
  db.query("SELECT * FROM blog_posts WHERE (id = ? OR slug = ?) AND status = 'published'", [param, param], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database Error' });
    if (results.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(results[0]);
  });
});

// Admin Get all posts
app.get('/api/admin/posts', (req, res) => {
  db.query('SELECT * FROM blog_posts ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database Error' });
    res.json(results);
  });
});

// Admin Create post
app.post('/api/admin/posts', (req, res) => {
  const { title, slug, content, excerpt, image_url, author, status } = req.body;
  if (!title || !slug) return res.status(400).json({ error: 'Title and slug are required' });
  db.query('INSERT INTO blog_posts (title, slug, content, excerpt, image_url, author, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [title, slug, content, excerpt, image_url, author || 'إدارة زهرة بيسان', status || 'published'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Slug already exists' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// Admin Update post
app.put('/api/admin/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, slug, content, excerpt, image_url, author, status } = req.body;
  db.query('UPDATE blog_posts SET title=?, slug=?, content=?, excerpt=?, image_url=?, author=?, status=? WHERE id=?',
    [title, slug, content, excerpt, image_url, author, status, id], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Slug already exists' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Admin Delete post
app.delete('/api/admin/posts/:id', (req, res) => {
  db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ================= AUTOMATED REPORTS =================

const sendReportEmail = async (period, days) => {
  if (!process.env.SMTP_USER) return;
  db.query("SELECT COUNT(*) as orders_count, SUM(total) as revenue FROM orders WHERE created_at >= NOW() - INTERVAL ? DAY", [days], async (err, results) => {
    if (err || !results) return;
    const { orders_count, revenue } = results[0];
    
    await transporter.sendMail({
      from: `"Zahrat Beesan" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `📊 تقرير زهرة بيسان ${period === 'weekly' ? 'الأسبوعي' : 'الشهري'}`,
      html: `
        <div dir="rtl" style="font-family: Arial; color: #333; text-align: right;">
          <h2 style="color: #5c3d1e;">ملخص أداء المتجر - ${period === 'weekly' ? 'آخر 7 أيام' : 'آخر 30 يوم'}</h2>
          <p>إجمالي المبيعات: <b>${revenue || 0} JOD</b></p>
          <p>عدد الطلبات: <b>${orders_count || 0}</b></p>
        </div>
      `
    }).catch(e => console.error('Report email failed', e));
  });
};

// Weekly Report: Friday at 23:00
cron.schedule('0 23 * * 5', () => sendReportEmail('weekly', 7));

// Monthly Report: 1st of every month at 00:00
cron.schedule('0 0 1 * *', () => sendReportEmail('monthly', 30));

app.post('/api/admin/reports/send-manual', (req, res) => {
  const { period } = req.body;
  const days = period === 'weekly' ? 7 : 30;
  sendReportEmail(period, days);
  res.json({ success: true, message: 'Report is being sent' });
});

// =====================================================

// ================= e-GIFT CARDS ======================

const generateGiftCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ZB-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

app.post('/api/gift-cards/purchase', (req, res) => {
  const { amount, buyerEmail, recipientEmail, message } = req.body;
  const code = generateGiftCode();
  db.query("INSERT INTO gift_cards (code, initial_value, balance, buyer_email, recipient_email, message) VALUES (?, ?, ?, ?, ?, ?)", [code, amount, amount, buyerEmail, recipientEmail, message], async (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // In a real app, charge credit card here first. 
    // Then send email to recipient.
    if (process.env.SMTP_USER && recipientEmail) {
      await transporter.sendMail({
        from: `"زهرة بيسان" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: "🎁 لقد تلقيت بطاقة هدية من زهرة بيسان!",
        html: `
          <div dir="rtl" style="font-family: Arial; text-align: right; color: #333;">
            <h2 style="color: #c5a880;">مرحباً!</h2>
            <p>لقد أرسل لك <b>${buyerEmail}</b> بطاقة هدية بقيمة <b>${amount} JOD</b> للتسوق من متجر زهرة بيسان.</p>
            ${message ? `<p>الرسالة: "<i>${message}</i>"</p>` : ''}
            <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 2px; font-weight: bold; margin: 20px 0;">
              ${code}
            </div>
            <p>استخدم هذا الكود عند الدفع للحصول على الخصم.</p>
            <a href="${process.env.SITE_URL || 'https://zahratbeesan.com'}" style="background: #5c3d1e; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">تسوّق الآن</a>
          </div>
        `
      }).catch(e => console.error(e));
    }

    res.json({ success: true, code });
  });
});

app.post('/api/gift-cards/apply', (req, res) => {
  const { code } = req.body;
  db.query("SELECT * FROM gift_cards WHERE code = ? AND status = 'active'", [code], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'الكود غير صالح أو مستخدم' });
    const card = results[0];
    if (card.balance <= 0) return res.status(400).json({ error: 'لا يوجد رصيد كافٍ في هذه البطاقة' });
    res.json({ success: true, balance: card.balance });
  });
});

app.get('/api/admin/gift-cards', (req, res) => {
  db.query("SELECT * FROM gift_cards ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// =====================================================

// ================= ABANDONED CART =================

app.post('/api/cart/abandoned', (req, res) => {
  const { email, phone, cartItems, total } = req.body;
  if ((!email && !phone) || !cartItems || cartItems.length === 0) return res.json({ success: false });
  
  // Find if pending cart exists for this user
  db.query("SELECT id FROM abandoned_carts WHERE (email = ? OR phone = ?) AND status = 'pending'", [email, phone], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length > 0) {
      // Update existing
      db.query("UPDATE abandoned_carts SET cart_items = ?, total_price = ?, updated_at = NOW() WHERE id = ?", [JSON.stringify(cartItems), total, results[0].id], (err) => {
        res.json({ success: true, updated: true });
      });
    } else {
      // Insert new
      db.query("INSERT INTO abandoned_carts (email, phone, cart_items, total_price) VALUES (?, ?, ?, ?)", [email, phone, JSON.stringify(cartItems), total], (err) => {
        res.json({ success: true, inserted: true });
      });
    }
  });
});

app.get('/api/admin/abandoned-carts', (req, res) => {
  db.query('SELECT * FROM abandoned_carts ORDER BY updated_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database Error' });
    res.json(results);
  });
});

// Configure NodeMailer (Uses environment variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/admin/abandoned-carts/send-reminder', async (req, res) => {
  const { id } = req.body;
  db.query('SELECT * FROM abandoned_carts WHERE id = ?', [id], async (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Cart not found' });
    const cart = results[0];
    
    if (!cart.email) return res.status(400).json({ error: 'No email address for this cart' });
    if (!process.env.SMTP_USER) return res.status(500).json({ error: 'SMTP credentials not configured on server' });

    try {
      const items = typeof cart.cart_items === 'string' ? JSON.parse(cart.cart_items) : cart.cart_items;
      let itemsList = items.map(i => `<li>${i.name} - ${i.quantity} x ${i.price} JOD</li>`).join('');

      await transporter.sendMail({
        from: `"زهرة بيسان" <${process.env.SMTP_USER}>`,
        to: cart.email,
        subject: "🛒 لا تفوتي عباءتك المفضلة من زهرة بيسان!",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
            <h2 style="color: #5c3d1e;">مرحباً،</h2>
            <p>لاحظنا أنك تركتِ بعض القطع الأنيقة في سلة التسوق الخاصة بك. العباءات المميزة تُباع بسرعة، لا تفوتي فرصتك!</p>
            <ul style="background: #fdfaf6; padding: 15px 30px; border-radius: 8px;">
              ${itemsList}
            </ul>
            <p>إجمالي السلة: <b>${cart.total_price} JOD</b></p>
            <p>استخدمي الكود <b>COMEBACK5</b> للحصول على خصم 5% على طلبك اليوم!</p>
            <a href="https://${req.get('host')}/checkout" style="background: #c5a880; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">أكملي طلبك الآن</a>
          </div>
        `
      });

      db.query("UPDATE abandoned_carts SET status = 'sent' WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (sendErr) {
      console.error(sendErr);
      res.status(500).json({ error: 'Failed to send email: ' + sendErr.message });
    }
  });
});

// Cron Job: Run every hour, check for pending carts > 2 hours old
cron.schedule('0 * * * *', () => {
  db.query("SELECT * FROM abandoned_carts WHERE status = 'pending' AND updated_at < NOW() - INTERVAL 2 HOUR AND email IS NOT NULL", async (err, results) => {
    if (err || !results) return;
    for (let cart of results) {
      if (!process.env.SMTP_USER) break; // Skip if SMTP not configured
      try {
        const items = typeof cart.cart_items === 'string' ? JSON.parse(cart.cart_items) : cart.cart_items;
        let itemsList = items.map(i => `<li>${i.name} - ${i.quantity} x ${i.price} JOD</li>`).join('');

        await transporter.sendMail({
          from: `"زهرة بيسان" <${process.env.SMTP_USER}>`,
          to: cart.email,
          subject: "🛒 لا تفوتي عباءتك المفضلة من زهرة بيسان!",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
              <h2 style="color: #5c3d1e;">مرحباً،</h2>
              <p>لاحظنا أنك تركتِ بعض القطع الأنيقة في سلة التسوق الخاصة بك.</p>
              <ul style="background: #fdfaf6; padding: 15px 30px; border-radius: 8px;">
                ${itemsList}
              </ul>
              <p>إجمالي السلة: <b>${cart.total_price} JOD</b></p>
              <p>استخدمي الكود <b>COMEBACK5</b> للحصول على خصم 5% على طلبك اليوم!</p>
              <a href="${process.env.SITE_URL || 'https://zahratbeesan.com'}/checkout" style="background: #c5a880; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">أكملي طلبك الآن</a>
            </div>
          `
        });
        db.query("UPDATE abandoned_carts SET status = 'sent' WHERE id = ?", [cart.id]);
      } catch (e) {
        console.error('Cron email send failed', e);
      }
    }
  });
});

// ==================================================


app.post('/api/inventory', (req, res) => {
  try {
    let { item_name, quantity, unit, min_threshold } = req.body;
    const cleanQty = parseFloat(convertNumerals(quantity).replace(/[^0-9.]/g, '')) || 0;
    const cleanThreshold = parseInt(convertNumerals(min_threshold).replace(/[^0-9.]/g, '')) || 0;
    db.query("INSERT INTO inventory (item_name, quantity, unit, min_threshold) VALUES (?, ?, ?, ?)", [item_name, cleanQty, unit, cleanThreshold], (err, result) => {
      if (err) return res.status(500).json({ error: `SQL Error: ${err.message}` });
      if (req.logAdminAction) req.logAdminAction('Add Inventory Item', `Added item: ${item_name}`);
      res.status(201).json({ id: result.insertId, item_name, quantity: cleanQty, unit, min_threshold: cleanThreshold });
    });
  } catch (error) {
    res.status(500).json({ error: `Server Error: ${error.message}` });
  }
});

app.put('/api/update-stock-item/:id', (req, res) => {
  try {
    const { id } = req.params;
    let { item_name, quantity, unit, min_threshold } = req.body;
    const cleanQty = parseFloat(convertNumerals(quantity).replace(/[^0-9.]/g, '')) || 0;
    const cleanThreshold = parseInt(convertNumerals(min_threshold).replace(/[^0-9.]/g, '')) || 0;
    db.query("UPDATE inventory SET item_name = ?, quantity = ?, unit = ?, min_threshold = ? WHERE id = ?", [item_name, cleanQty, unit, cleanThreshold, id], (err) => {
      if (err) return res.status(500).json({ error: `SQL Error: ${err.message}` });
      if (req.logAdminAction) req.logAdminAction('Update Stock', `Updated ${item_name} to ${cleanQty} ${unit}`);
      res.json({ message: 'Item updated' });
    });
  } catch (error) {
    res.status(500).json({ error: `Server Error: ${error.message}` });
  }
});

app.delete('/api/inventory/:id', (req, res) => {
  db.query("DELETE FROM inventory WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item deleted' });
  });
});

app.get('/api/careers', (req, res) => {
  db.query('SELECT * FROM careers WHERE active = 1 ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/careers', (req, res) => {
  const { title, type, location, description } = req.body;
  db.query('INSERT INTO careers (title, type, location, description) VALUES (?, ?, ?, ?)', [title, type, location, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Job created', id: result.insertId });
  });
});

app.put('/api/careers/:id', (req, res) => {
  const { id } = req.params;
  const { title, type, location, description, active } = req.body;
  db.query('UPDATE careers SET title = ?, type = ?, location = ?, description = ?, active = ? WHERE id = ?', [title, type, location, description, active, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Job updated' });
  });
});

app.delete('/api/careers/:id', (req, res) => {
  db.query('DELETE FROM careers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Job deleted' });
  });
});

app.get('/api/products/:id/recipe', async (req, res) => {
  try {
    const [results] = await db.promise().query(`SELECT r.*, i.item_name, i.unit FROM recipes r JOIN inventory i ON r.inventory_id = i.id WHERE r.menu_item_id = ?`, [req.params.id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Product Variants (Color Variants) ──────────────────────────────────────
app.get('/api/products/:id/variants', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/variants', async (req, res) => {
  try {
    const { color_name, colors, images, video_url, sizes, sort_order } = req.body;
    if (!color_name) return res.status(400).json({ error: 'color_name is required' });
    const [result] = await db.promise().query(
      'INSERT INTO product_variants (product_id, color_name, colors, images, video_url, sizes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.params.id,
        color_name,
        JSON.stringify(colors || []),
        JSON.stringify(images || []),
        video_url || null,
        JSON.stringify(sizes || []),
        sort_order || 0
      ]
    );
    if (req.logAdminAction) req.logAdminAction('Add Variant', `Added color variant "${color_name}" to product #${req.params.id}`);
    res.status(201).json({ id: result.insertId, message: 'Variant created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/variants/:variantId', async (req, res) => {
  try {
    const { color_name, colors, images, video_url, sizes, sort_order } = req.body;
    await db.promise().query(
      'UPDATE product_variants SET color_name=?, colors=?, images=?, video_url=?, sizes=?, sort_order=? WHERE id=?',
      [
        color_name,
        JSON.stringify(colors || []),
        JSON.stringify(images || []),
        video_url || null,
        JSON.stringify(sizes || []),
        sort_order || 0,
        req.params.variantId
      ]
    );
    if (req.logAdminAction) req.logAdminAction('Update Variant', `Updated color variant #${req.params.variantId}`);
    res.json({ message: 'Variant updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/variants/:variantId', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM product_variants WHERE id=?', [req.params.variantId]);
    if (req.logAdminAction) req.logAdminAction('Delete Variant', `Deleted color variant #${req.params.variantId}`);
    res.json({ message: 'Variant deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ───────────────────────────────────────────────────────────────────────────


app.post('/api/products/:id/recipe', async (req, res) => {
  const { id } = req.params;
  const { ingredients } = req.body;
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM recipes WHERE menu_item_id = ?', [id]);
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const values = ingredients.map(ing => [id, ing.inventory_id, ing.quantity_required]);
      await conn.query('INSERT INTO recipes (menu_item_id, inventory_id, quantity_required) VALUES ?', [values]);
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.post('/api/ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  try {
    if (!openai) return res.json({ answer: "[Local Mode] AI Assistant is currently unavailable." });
    const now = new Date();
    const currentDateTime = now.toLocaleString('en-GB', { timeZone: 'Asia/Amman' });
    
    // Fetch menu
    const promiseDb = db.promise();
    const [menuRes] = await promiseDb.query(`SELECT id, name, price_display FROM menu_items WHERE available = 1`);

    const menuItems = menuRes.map(m => `${m.name} (${m.price_display})`).join(', ');

    let context = `You are Yafa (يافا), the friendly and professional abaya fashion consultant for Zahrat Beesan (زهرة بيسان) — a global online boutique for luxury abayas and oriental embroideries, shipping worldwide. We are an online-only store with no physical location. Current time: ${currentDateTime}.
Focus on helping customers choose abayas, match colors, select sizes (S, M, L, XL, XXL, 3XL), and answer questions about international shipping and payment methods (COD for local, card worldwide).
Menu: ${menuItems}
CRITICAL RULES:
1. Do NOT invent, hallucinate, or guess information. Recommend items from the Menu above.
2. Respond in the same language the customer uses.
3. Be warm, polite, and elegant.`;

    const response = await openai.chat.completions.create({ 
      model: 'gpt-4o-mini', 
      messages: [{ role: 'system', content: context }, { role: 'user', content: prompt }], 
      max_tokens: 500,
      temperature: 0.0
    });
    res.json({ answer: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'AI service failure' });
  }
});

app.post('/api/ai-assistant-logs', (req, res) => {
  const { admin_query, ai_response } = req.body;
  db.query("INSERT INTO ai_assistant_messages (admin_query, ai_response) VALUES (?, ?)", [admin_query, ai_response], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
});

app.get('/api/ai-assistant-logs', (req, res) => {
  db.query("SELECT * FROM ai_assistant_messages ORDER BY created_at DESC LIMIT 50", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/contact-messages', (req, res) => {
  db.query("SELECT * FROM contact_messages ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.json(results);
  });
});

app.post('/api/apply', (req, res) => {
  const { name, email, phone, position, cover_letter, resume_url } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing name or email' });
  db.query(`INSERT INTO job_applications (name, email, phone, position, cover_letter, resume_url) VALUES (?, ?, ?, ?, ?, ?)`, [name, email, phone || null, position || null, cover_letter || null, resume_url || null], (err, result) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.status(201).json({ message: 'Application received' });
  });
});

app.get('/api/applications', (req, res) => {
  db.query('SELECT * FROM job_applications ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/applications', (req, res) => {
  const { name, email, phone, position, cover_letter, resume_url } = req.body;
  db.query('INSERT INTO job_applications (name, email, phone, position, cover_letter, resume_url) VALUES (?, ?, ?, ?, ?, ?)', [name, email, phone, position, cover_letter, resume_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Application submitted successfully', id: result.insertId });
  });
});

app.put('/api/applications/:id/status', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE job_applications SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

app.delete('/api/applications/:id', (req, res) => {
  db.query('DELETE FROM job_applications WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Application deleted' });
  });
});

app.get('/api/messages', (req, res) => {
  db.query('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 100', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/messages', (req, res) => {
  const { user_msg, ai_msg } = req.body;
  if (!user_msg) return res.status(400).json({ error: 'user_msg is required' });
  db.query('INSERT INTO chat_messages (user_msg, ai_msg) VALUES (?, ?)', [user_msg, ai_msg || ''], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
});

// Helper for audit logging
const logToAudit = (adminUser, action, category, severity, entityType, entityId, details, req) => {
  const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
  const ua = req ? req.headers['user-agent'] : null;
  const q = 'INSERT INTO auditlog (adminUser, action, category, severity, entityType, entityId, details, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(q, [adminUser || 'admin', action, category || 'general', severity || 'info', entityType || null, entityId || null, details || null, ip, ua], (err) => {
    if (err) console.error('[Audit Log Table Error]', err.message);
  });
};

// Coupons API
app.get('/api/coupons', (req, res) => {
  db.query('SELECT * FROM coupon ORDER BY createdAt DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.query;
  if (!code) return res.status(400).json({ valid: false, error: 'كود الخصم مطلوب' });
  
  const sub = parseFloat(subtotal) || 0;
  
  db.query('SELECT * FROM coupon WHERE code = ? AND isActive = 1 LIMIT 1', [code], (err, results) => {
    if (err) return res.status(500).json({ valid: false, error: err.message });
    if (results.length === 0) return res.status(400).json({ valid: false, error: 'كود الخصم غير صحيح أو غير فعال' });
    
    const coupon = results[0];
    
    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ valid: false, error: 'كود الخصم منتهي الصلاحية' });
    }
    
    // Check usage limits
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ valid: false, error: 'تم استهلاك كود الخصم بالكامل' });
    }
    
    // Check min order
    if (sub < coupon.minOrderJOD) {
      return res.status(400).json({ valid: false, error: `الحد الأدنى لقيمة الطلب لاستخدام هذا الكود هو ${coupon.minOrderJOD.toFixed(2)} JOD` });
    }
    
    res.json({
      valid: true,
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description
    });
  });
});

app.post('/api/coupons', (req, res) => {
  const { code, description, discountType, discountValue, minOrderJOD, maxUses, expiresAt } = req.body;
  if (!code || typeof discountValue === 'undefined') {
    return res.status(400).json({ error: 'الكود وقيمة الخصم مطلوبة' });
  }
  
  db.query('INSERT INTO coupon (code, description, discountType, discountValue, minOrderJOD, maxUses, expiresAt, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
    [code, description || null, discountType || 'percent', discountValue, minOrderJOD || 0, maxUses || null, expiresAt || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
      logToAudit(adminEmail, `Created coupon code: ${code}`, 'coupons', 'info', 'coupon', String(result.insertId), `Discount: ${discountValue} (${discountType})`, req);
      res.status(201).json({ success: true, id: result.insertId });
    }
  );
});

app.put('/api/coupons/:id', (req, res) => {
  const { code, description, discountType, discountValue, minOrderJOD, maxUses, expiresAt, isActive } = req.body;
  db.query('UPDATE coupon SET code = ?, description = ?, discountType = ?, discountValue = ?, minOrderJOD = ?, maxUses = ?, expiresAt = ?, isActive = ? WHERE id = ?',
    [code, description, discountType, discountValue, minOrderJOD, maxUses, expiresAt, isActive ? 1 : 0, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
      logToAudit(adminEmail, `Updated coupon: ${code}`, 'coupons', 'info', 'coupon', req.params.id, `Status active: ${isActive}`, req);
      res.json({ success: true });
    }
  );
});

app.delete('/api/coupons/:id', (req, res) => {
  db.query('DELETE FROM coupon WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
    logToAudit(adminEmail, `Deleted coupon ID: ${req.params.id}`, 'coupons', 'warning', 'coupon', req.params.id, null, req);
    res.json({ success: true });
  });
});

// Newsletter API
app.get('/api/newsletter', (req, res) => {
  db.query('SELECT * FROM newsletter ORDER BY subscribedAt DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/newsletter', (req, res) => {
  const { email, name, country } = req.body;
  if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
  
  db.query('SELECT * FROM newsletter WHERE email = ? LIMIT 1', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      db.query('UPDATE newsletter SET isActive = 1, name = ?, country = ? WHERE email = ?', [name || null, country || null, email], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        return res.json({ success: true, message: 'تم الاشتراك بنجاح' });
      });
    } else {
      db.query('INSERT INTO newsletter (email, name, country, isActive) VALUES (?, ?, ?, 1)', 
        [email, name || null, country || null], 
        (err3, result) => {
          if (err3) return res.status(500).json({ error: err3.message });
          
          // Send automated Welcome Email
          const senderEmail = process.env.SMTP_USER || 'zahratbeesanshop@gmail.com';
          if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter.sendMail({
              from: `"زهرة بيسان" <${senderEmail}>`,
              to: email,
              subject: "🌸 أهلاً بكِ في عائلة زهرة بيسان! هدية خاصة بانتظارك",
              html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
                  <h2 style="color: #c5a880;">أهلاً بكِ في عالم زهرة بيسان للعباءات والأناقة 🌸</h2>
                  <p>سعداء جداً بانضمامك إلينا! كنسخة من ترحيبنا الخاص، يسعدنا إهداؤك خصم خاص على طلبك الأول.</p>
                  <div style="background: #fdfaf6; border: 1px solid #c5a880; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    <span style="font-size: 1.1rem; color: #5c3d1e;">رمز الخصم الترحيبي الخاص بك:</span>
                    <h3 style="color: #c5a880; font-size: 1.8rem; letter-spacing: 2px; margin: 10px 0;">WELCOME5</h3>
                  </div>
                  <p>استمتعي بتصفح التشكيلة الجديدة من العباءات الخليجية والمميزة.</p>
                  <a href="https://zahratbeesan.com" style="background: #c5a880; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">تصفحي المتجر الآن</a>
                </div>
              `
            }).catch(e => console.error('[Welcome Email Error]:', e.message));
          }

          res.status(201).json({ success: true, message: 'تم الاشتراك بنجاح وتوجيه الإيميل الترحيبي', id: result.insertId });
        }
      );
    }
  });
});

// ════════════════════════════════════════════════════════════════
// Loyalty Points API & Catalog PDF Stream
// ════════════════════════════════════════════════════════════════
app.get('/api/loyalty/:phone', async (req, res) => {
  try {
    const cleanPhone = req.params.phone.replace(/\D/g, '');
    const [rows] = await db.promise().query('SELECT * FROM loyalty_points WHERE phone LIKE ?', [`%${cleanPhone}%`]);
    if (!rows.length) {
      return res.json({ phone: cleanPhone, points: 0, tier: 'برونزي', discountValue: 0, history: [] });
    }
    const user = rows[0];
    const tier = user.points >= 300 ? 'ذهب' : (user.points >= 100 ? 'فضة' : 'برونزي');
    res.json({
      phone: user.phone,
      points: user.points,
      tier,
      discountValue: user.points * 0.1,
      history: []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/catalog/pdf', async (req, res) => {
  try {
    const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Fetch products safely without strict available=1 clause, fallback to default items if DB returns empty
    let products = await new Promise((resolve) => {
      db.query('SELECT id, name, price, price_display, description FROM menu_items LIMIT 30', (err, results) => {
        if (err || !results || results.length === 0) resolve([]);
        else resolve(results);
      });
    });

    // Fallback default luxury items if DB returns empty array
    if (!products || products.length === 0) {
      products = [
        { id: 1, name: 'Royal Silk Abaya', price: 120, price_display: '120 JOD', description: 'Luxury natural silk abaya with hand embroidery' },
        { id: 2, name: 'Embroidered Bisht Abaya', price: 110, price_display: '110 JOD', description: 'Classic regal bisht cut with gold thread accents' },
        { id: 3, name: 'Heritage Velvet Abaya', price: 145, price_display: '145 JOD', description: 'Royal winter velvet kaftan with intricate detailing' },
        { id: 4, name: 'Daily Reception Abaya', price: 85, price_display: '85 JOD', description: 'Lightweight linen reception abaya for daily elegance' },
        { id: 5, name: 'Bridal Occasion Kaftan', price: 180, price_display: '180 JOD', description: 'Haute couture bridal reception kaftan with crystal beads' }
      ];
    }

    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const translateName = (str) => {
      if (!str || typeof str !== 'string') return 'Royal Abaya Item';
      let s = str;
      if (s.includes('حرير')) return 'Royal Natural Silk Abaya';
      if (s.includes('بشت')) return 'Embroidered Bisht Abaya';
      if (s.includes('مطرزة') || s.includes('تطريز')) return 'Luxury Embroidered Abaya';
      if (s.includes('سهرة') || s.includes('مناسبات')) return 'Evening Occasion Abaya';
      if (s.includes('قفطان')) return 'Royal Oriental Kaftan';
      if (s.includes('مخمل')) return 'Winter Velvet Abaya';
      if (s.includes('يومية')) return 'Daily Elegance Abaya';
      const asciiOnly = s.replace(/[^\x20-\x7E]/g, '').trim();
      return asciiOnly.length > 2 ? asciiOnly : 'Zahrat Beesan Royal Abaya';
    };

    // Cover Header Banner
    page.drawText('Zahrat Beesan Luxury Catalog', { x: 50, y: height - 60, size: 22, font: fontBold, color: rgb(0.77, 0.65, 0.50) });
    page.drawText('Official Royal Abaya Collection 2026', { x: 50, y: height - 85, size: 12, font, color: rgb(0.3, 0.3, 0.3) });

    let y = height - 130;
    products.forEach((p, idx) => {
      if (y < 90) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - 60;
      }

      const safeName = translateName(p.name);
      const safePrice = p.price_display || (p.price ? `${p.price} JOD` : '85.00 JOD');
      const safeDesc = (p.description && typeof p.description === 'string' && p.description.replace(/[^\x20-\x7E]/g, '').trim()) || 'Luxury hand-crafted oriental abaya';
      const descSnippet = safeDesc.substring(0, 65) + (safeDesc.length > 65 ? '...' : '');

      page.drawText(`${idx + 1}. ${safeName}`, { x: 50, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(`Price: ${safePrice}`, { x: 420, y, size: 11, font: fontBold, color: rgb(0.77, 0.65, 0.50) });
      page.drawText(descSnippet, { x: 50, y: y - 16, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

      y -= 50;
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Zahrat_Beesan_Catalog_2026.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('[PDF Catalog Error]:', err);
    res.status(500).send('Error generating catalog');
  }
});

app.delete('/api/newsletter/:id', (req, res) => {

  db.query('DELETE FROM newsletter WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Public Store Reviews endpoint (for homepage CustomerReviews component)
app.get('/api/store-reviews', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  db.query(
    'SELECT * FROM store_reviews ORDER BY created_at DESC LIMIT ?',
    [limit],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results || []);
    }
  );
});

// Reviews API using review table (with approval workflow)
app.get('/api/reviews', (req, res) => {
  const { productId, approvedOnly } = req.query;
  let q = 'SELECT r.*, mi.name as productName FROM review r LEFT JOIN menu_items mi ON r.productId = mi.id';
  const params = [];
  const conditions = [];
  
  if (productId) {
    conditions.push('r.productId = ?');
    params.push(productId);
  }
  
  if (approvedOnly === 'true' || approvedOnly === undefined) {
    conditions.push('r.isApproved = 1');
  }
  
  if (conditions.length > 0) {
    q += ' WHERE ' + conditions.join(' AND ');
  }
  
  q += ' ORDER BY r.createdAt DESC';
  
  db.query(q, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/reviews', (req, res) => {
  const { productId, customerName, comment, rating } = req.body;
  if (!productId || !customerName || typeof rating === 'undefined') {
    return res.status(400).json({ error: 'الاسم والتقييم والمنتج مطلوبة' });
  }
  
  db.query('INSERT INTO review (productId, customerName, comment, rating, isApproved) VALUES (?, ?, ?, ?, 0)', 
    [productId, customerName, comment || null, rating], 
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, message: 'تم حفظ التقييم بانتظار موافقة الإدارة', id: result.insertId });
    }
  );
});

app.put('/api/reviews/:id', (req, res) => {
  const { isApproved } = req.body;
  db.query('UPDATE review SET isApproved = ? WHERE id = ?', [isApproved ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
    logToAudit(adminEmail, `Approved review ID: ${req.params.id}`, 'reviews', 'info', 'review', req.params.id, `Status: approved`, req);
    res.json({ success: true });
  });
});

app.delete('/api/reviews/:id', (req, res) => {
  db.query('DELETE FROM review WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
    logToAudit(adminEmail, `Deleted review ID: ${req.params.id}`, 'reviews', 'warning', 'review', req.params.id, null, req);
    res.json({ success: true });
  });
});

app.get('/api/images', (req, res) => {
  fs.readdir(imgDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read images folder' });
    res.json(files.filter(f => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f)));
  });
});

app.post('/api/admin/set-product-image', async (req, res) => {
  const { productId, imageUrl } = req.body;
  if (!productId || !imageUrl) return res.status(400).json({ error: 'productId and imageUrl are required' });
  try {
    const cleanImg = imageUrl.trim();
    const imagesArray = JSON.stringify([cleanImg]);
    await db.promise().query('UPDATE menu_items SET image_url = ?, images = ? WHERE id = ?', [cleanImg, imagesArray, productId]);
    res.json({ success: true, message: `Product ${productId} image locked to ${cleanImg}` });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/products/reorder', async (req, res) => {

  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid payload' });
  try {
    for (const item of order) {
      if (!item.id) continue;
      await db.promise().query('UPDATE menu_items SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
    }
    res.json({ message: 'Order saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  let { name, price_num, cost_price, tax_amount, description, available, category_id, image_url, video_url, tags, addons, addon_ids, tag_ids, sku, subtitle, badge, images, fabric, sizes, care, pre_order, size_chart, weight } = req.body;
  if (category_id === 'espresso') category_id = '2';
  if (category_id === 'tea') category_id = '6';
  if (category_id === 'cold') category_id = '1';
  if (category_id === 'food') category_id = '3';
  if (category_id === 'sweets') category_id = '5';
  if (category_id === 'soft') category_id = '4';
  if (!name) return res.status(400).json({ error: 'Missing name' });

  let conn;
  try {
    conn = await db.promise().getConnection();
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT MAX(sort_order) as maxOrder FROM menu_items');
    const nextOrder = (rows[0].maxOrder || 0) + 1;
    const rawPrice = price_num ? convertNumerals(price_num.toString()).replace(/[^0-9.]/g, '') : null;
    const cleanPrice = (rawPrice && rawPrice.trim() !== '') ? rawPrice : null;
    const cleanCost = cost_price ? parseFloat(cost_price) || 0 : 0;
    const cleanTax = tax_amount ? parseFloat(tax_amount) || 0 : 0;
    const price_display = cleanPrice ? `JOD ${parseFloat(cleanPrice).toFixed(2)}` : null;
    const [result] = await conn.query('INSERT INTO menu_items (category_id, name, price_num, cost_price, tax_amount, price_display, description, tags, available, image_url, video_url, addons, sort_order, sku, subtitle, badge, images, fabric, sizes, care, pre_order, size_chart, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [category_id || null, name, cleanPrice, cleanCost, cleanTax, price_display, description || null, tags || null, available ?? 1, image_url || null, video_url || null, addons || null, nextOrder, sku || null, subtitle || null, badge || null, images || null, fabric || null, sizes || '["S", "M", "L", "XL", "XXL", "3XL"]', care || null, pre_order ? 1 : 0, size_chart || null, weight || null]);
    const productId = result.insertId;
    if (Array.isArray(addon_ids)) for (const aid of addon_ids) if (aid) await conn.query('INSERT IGNORE INTO menu_item_addons (menu_item_id, addon_id) VALUES (?, ?)', [productId, aid]);
    if (Array.isArray(tag_ids)) for (const tid of tag_ids) if (tid) await conn.query('INSERT IGNORE INTO menu_item_tags (menu_item_id, tag_id) VALUES (?, ?)', [productId, tid]);
    await conn.commit();
    if (req.logAdminAction) req.logAdminAction('Add Product', `Added new product: ${name}`);
    res.status(201).json({ message: 'Product created successfully', id: productId });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.sqlMessage || err.message || 'Internal Server Error' });
  } finally {
    if (conn) conn.release();
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  let { name, price_num, cost_price, tax_amount, description, available, category_id, image_url, video_url, tags, addons, addon_ids, tag_ids, sku, subtitle, badge, images, fabric, sizes, care, pre_order, size_chart, weight } = req.body;
  let conn;
  try {
    conn = await db.promise().getConnection();
    await conn.beginTransaction();
    let cleanPrice = null;
    if (price_num !== undefined && price_num !== null) cleanPrice = convertNumerals(price_num.toString()).replace(/[^0-9.]/g, '');
    const cleanCost = cost_price ? parseFloat(cost_price) || 0 : 0;
    const cleanTax = tax_amount ? parseFloat(tax_amount) || 0 : 0;
    const price_display = cleanPrice ? `JOD ${parseFloat(cleanPrice).toFixed(2)}` : null;
    await conn.query("UPDATE menu_items SET name = ?, price_num = ?, cost_price = ?, tax_amount = ?, price_display = ?, description = ?, available = ?, category_id = ?, image_url = ?, video_url = ?, tags = ?, addons = ?, sku = ?, subtitle = ?, badge = ?, images = ?, fabric = ?, sizes = ?, care = ?, pre_order = ?, size_chart = ?, weight = ? WHERE id = ?", [name, cleanPrice, cleanCost, cleanTax, price_display, description, available, category_id || null, image_url || null, video_url || null, tags || null, addons || null, sku || null, subtitle || null, badge || null, images || null, fabric || null, sizes || '["S", "M", "L", "XL", "XXL", "3XL"]', care || null, pre_order ? 1 : 0, size_chart || null, weight || null, id]);
    if (Array.isArray(addon_ids)) {
      await conn.query('DELETE FROM menu_item_addons WHERE menu_item_id = ?', [id]);
      for (const aid of addon_ids) if (aid) await conn.query('INSERT INTO menu_item_addons (menu_item_id, addon_id) VALUES (?, ?)', [id, aid]);
    }
    if (Array.isArray(tag_ids)) {
      await conn.query('DELETE FROM menu_item_tags WHERE menu_item_id = ?', [id]);
      for (const tid of tag_ids) if (tid) await conn.query('INSERT INTO menu_item_tags (menu_item_id, tag_id) VALUES (?, ?)', [id, tid]);
    }
    await conn.commit();
    if (req.logAdminAction) req.logAdminAction('Edit Product', `Updated product: ${name}`);
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.sqlMessage || err.message || 'Internal Server Error' });
  } finally {
    if (conn) conn.release();
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.promise().query("DELETE FROM recipes WHERE menu_item_id = ?", [req.params.id]);
    await db.promise().query("DELETE FROM menu_items WHERE id = ?", [req.params.id]);
    if (req.logAdminAction) req.logAdminAction('Delete Product', `Deleted product ID: ${req.params.id}`);
    res.json({ message: 'Product and associated recipes deleted successfully' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ error: 'Cannot delete this product because it has associated sales orders.' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai-chat', async (req, res) => {
  const { message, isAdmin, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const now = new Date();
  const currentDateTime = now.toLocaleString('en-GB', { timeZone: 'Asia/Amman' });
  let businessContext = isAdmin
    ? `You are the Zahrat Beesan Internal Business Intelligence AI. Current time is ${currentDateTime}.`
    : `You are Yafa (يافا), the friendly and professional abaya fashion consultant for Zahrat Beesan (زهرة بيسان) — a global online store shipping worldwide. No physical location. Current time: ${currentDateTime}.
You help customers select abayas, match designs, choose sizes (S, M, L, XL, XXL, 3XL), and answer questions about international shipping and payment. Respond in the customer's language.`;

  try {
    const promiseDb = db.promise();
    const isActuallyAdmin = String(isAdmin) === 'true';
    
    if (isActuallyAdmin) {
      console.log(`[AI] Processing Admin Query with full business context. (Jordan Time: ${currentDateTime})`);
      try {
        const promiseDb = db.promise();
        const results = await Promise.allSettled([
          /* 0 */ promiseDb.query(`SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount),0) as total_revenue FROM orders`),
          /* 1 */ promiseDb.query(`SELECT COUNT(*) as today_orders, COALESCE(SUM(total_amount),0) as today_revenue FROM orders WHERE DATE(created_at) = CURDATE()`),
          /* 2 */ promiseDb.query(`SELECT COUNT(*) as yesterday_orders, COALESCE(SUM(total_amount),0) as yesterday_revenue FROM orders WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`),
          /* 3 */ promiseDb.query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`),
          /* 4 */ promiseDb.query(`SELECT mi.name, SUM(oi.quantity) as sold FROM order_items oi ${MENU_ITEM_JOIN_CONDITION} GROUP BY mi.id ORDER BY sold DESC LIMIT 8`),
          /* 5 */ promiseDb.query(`SELECT DATE(created_at) as best_date, SUM(total_amount) as daily_rev FROM orders GROUP BY DATE(created_at) ORDER BY daily_rev DESC LIMIT 1`),
          /* 6 */ promiseDb.query(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(*) as orders, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 15 DAY) GROUP BY DATE(created_at) ORDER BY date DESC`),
          /* 7 */ promiseDb.query(`SELECT item_name, quantity, unit, min_threshold, CASE WHEN quantity <= min_threshold THEN 'LOW' ELSE 'OK' END as stock_status FROM inventory ORDER BY stock_status DESC, item_name`),
          /* 8 */ promiseDb.query(`SELECT name, price_display, available FROM menu_items WHERE available = 1`),
          /* 9 */ promiseDb.query(`SELECT * FROM offers`),
          /* 10 */ promiseDb.query(`SELECT name, message, DATE_FORMAT(created_at, '%Y-%m-%d') as date FROM contact_messages ORDER BY created_at DESC LIMIT 10`),
          /* 11 */ promiseDb.query(`SELECT name, position, status FROM job_applications ORDER BY created_at DESC LIMIT 10`),
          /* 12 */ promiseDb.query(`SELECT title, type, location FROM careers WHERE active = 1`),
          /* 13 */ promiseDb.query(`SELECT ROUND(AVG(rating),1) as avg_rating, COUNT(*) as total FROM general_feedback`),
          /* 14 */ promiseDb.query(`SELECT reviewer_name, rating, comment FROM general_feedback ORDER BY created_at DESC LIMIT 5`),
          /* 15 */ promiseDb.query(`SELECT admin_name, action, details, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as time FROM admin_logs ORDER BY created_at DESC LIMIT 20`),
          /* 16 */ promiseDb.query(`SELECT customer_name, total_amount, status, order_type, DATE_FORMAT(created_at, '%H:%i') as time FROM orders WHERE DATE(created_at) = CURDATE() ORDER BY created_at DESC`),
          /* 17 */ promiseDb.query(`SELECT mi.name as product, ROUND(AVG(pr.rating),1) as rating, COUNT(pr.id) as count FROM menu_items mi LEFT JOIN product_reviews pr ON mi.id = pr.product_id GROUP BY mi.id HAVING count > 0`),
          /* 18 */ promiseDb.query(`SELECT customer_name, total_amount, status, order_type, DATE_FORMAT(created_at, '%H:%i') as time FROM orders WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) ORDER BY created_at DESC`),
          /* 19 */ promiseDb.query(`SELECT customer_name, total_amount, status, order_type, DATE_FORMAT(created_at, '%Y-%m-%d') as date, DATE_FORMAT(created_at, '%H:%i') as time FROM orders ORDER BY created_at DESC`),
          /* 20 */ promiseDb.query(`SELECT COUNT(*) as month_orders, COALESCE(SUM(total_amount),0) as month_revenue FROM orders WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`),
          /* 21 */ promiseDb.query(`SELECT COUNT(*) as total_messages FROM contact_messages`)
        ]);

        const getRes = (idx, def = []) => (results[idx] && results[idx].status === 'fulfilled' ? results[idx].value[0] : def);

        const allTime         = getRes(0,  [{total_orders:0, total_revenue:0}])[0];
        const todayRow        = getRes(1,  [{today_orders:0, today_revenue:0}])[0];
        const yesterdayRow    = getRes(2,  [{yesterday_orders:0, yesterday_revenue:0}])[0];
        const orderStatuses   = getRes(3);
        const topProducts     = getRes(4);
        const bestDay         = getRes(5,  [null])[0];
        const salesTrend      = getRes(6);
        const inventory       = getRes(7);
        const menuItems       = getRes(8);
        const offers          = getRes(9);
        const messages        = getRes(10);
        const applications    = getRes(11);
        const activeJobs      = getRes(12);
        const feedbackSummary = getRes(13, [{avg_rating:'N/A', total:0}])[0];
        const recentFeedback  = getRes(14);
        const teamActivity    = getRes(15);
        const todayOrders     = getRes(16);
        const productRatings  = getRes(17);
        const yesterdayOrders = getRes(18);
        const recentOrdersDetail = getRes(19); // all orders last 15 days with date
        const thisMonthRow    = getRes(20, [{month_orders:0, month_revenue:0}])[0];
        const totalMessagesRow = getRes(21, [{total_messages:0}])[0];

        // Group last-15-days orders by date for easy AI lookup
        const ordersByDate = {};
        recentOrdersDetail.forEach(o => {
          if (!ordersByDate[o.date]) ordersByDate[o.date] = [];
          ordersByDate[o.date].push(o);
        });
        const ordersPerDateText = Object.entries(ordersByDate)
          .sort((a,b) => b[0].localeCompare(a[0]))
          .map(([date, orders]) => {
            const rev = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
            const detail = orders.map(o => `${o.customer_name} JOD${o.total_amount} (${o.status}) at ${o.time}`).join(' | ');
            return `[${date}] ${orders.length} orders | JOD${rev.toFixed(2)} revenue\n  ${detail}`;
          }).join('\n');

        const lowStock = inventory.filter(i => i.stock_status === 'LOW');
        const okStock  = inventory.filter(i => i.stock_status === 'OK');

        businessContext = `You are the Zahrat Beesan Business Intelligence Expert for Zahrat Beesan — a global online abaya boutique.
Current Jordan Date/Time: ${currentDateTime}

=== TODAY ===
Revenue: JOD${parseFloat(todayRow.today_revenue).toFixed(2)} | Orders: ${todayRow.today_orders}
Orders Detail: ${todayOrders.map(o => `${o.customer_name} JOD${o.total_amount} (${o.status}) at ${o.time}`).join(' | ') || 'None yet'}

=== YESTERDAY ===
Revenue: JOD${parseFloat(yesterdayRow.yesterday_revenue).toFixed(2)} | Orders: ${yesterdayRow.yesterday_orders}
Orders Detail: ${yesterdayOrders.map(o => `${o.customer_name} JOD${o.total_amount} (${o.status}) at ${o.time}`).join(' | ') || 'None'}

=== ALL ORDERS - FULL HISTORY (grouped by date — use this to answer ANY date question) ===
${ordersPerDateText || 'No orders in last 15 days'}

=== THIS MONTH ===
Revenue: JOD${parseFloat(thisMonthRow.month_revenue).toFixed(2)} | Orders: ${thisMonthRow.month_orders}

=== ALL-TIME & HISTORY ===
Total Revenue: JOD${allTime.total_revenue} | Total Orders: ${allTime.total_orders}
Best Day Ever: ${bestDay ? `${bestDay.best_date}: JOD${bestDay.daily_rev}` : 'N/A'}
By Status: ${orderStatuses.map(s => `${s.status}: ${s.count}`).join(', ')}

=== TOP PRODUCTS ===
${topProducts.map((p,i) => `${i+1}. ${p.name} (${p.sold} sold)`).join(' | ')}

=== SALES TREND (15 DAYS) ===
${salesTrend.map(d => `${d.date}: JOD${d.revenue} (${d.orders} orders)`).join(' | ')}

=== INVENTORY ===
⚠️ LOW (${lowStock.length}): ${lowStock.map(i => `${i.item_name} ${i.quantity}${i.unit||''}`).join(', ') || 'None'}
✅ OK: ${okStock.map(i => `${i.item_name}: ${i.quantity}${i.unit||''}`).join(', ')}

=== MENU & RATINGS ===
Items: ${menuItems.map(m => `${m.name} (${m.price_display})`).join(', ') || 'None'}
Ratings: ${productRatings.map(p => `${p.product}: ${p.rating}⭐️ (${p.count} reviews)`).join(' | ') || 'No ratings yet'}

=== OFFERS ===
${offers.filter(o => o.active == 1).map(o => `${o.product_name}: ${o.discount_percent}% OFF (${o.reason})`).join(' | ') || 'No active offers'}

=== MESSAGES & JOBS ===
Recent Messages (Total ${totalMessagesRow.total_messages} messages): ${messages.map(m => `[${m.date}] ${m.name}: "${m.message}"`).join(' | ') || 'None'}
Job Applications: ${applications.map(a => `${a.name} for ${a.position} (${a.status})`).join(' | ') || 'None'}
Active Listings: ${activeJobs.map(j => `${j.title} (${j.type}) in ${j.location}`).join(', ') || 'None'}

=== FEEDBACK ===
Avg: ${feedbackSummary.avg_rating}/5 (${feedbackSummary.total} reviews)
Recent: ${recentFeedback.map(f => `${f.reviewer_name} (${f.rating}/5): "${f.comment}"`).join(' | ') || 'None'}

=== TEAM ACTIVITY ===
${teamActivity.map(log => `[${log.time}] ${log.admin_name}: ${log.action} — ${log.details}`).join('\n')}

Rule: Answer ONLY from the data above. Be precise and professional. All monetary figures are strictly in Jordanian Dinars (JOD). Do not use £ or GBP. Always specify prices and calculations in JOD.
CRITICAL RULES:
1. Do NOT invent, hallucinate, or guess. Use the EXACT numbers from "TODAY", "YESTERDAY", "THIS MONTH", and "SALES TREND". NEVER manually sum or calculate totals from the "Recent Orders List" as it is only a partial list and will give wrong answers!
2. Pay STRICT attention to dates, hours, and the number of orders per day. When answering, emphasize the exact date, time (hour/minute), and order counts for the requested period (e.g., Today, Yesterday, Day before yesterday, This Month, or All-Time).
4. Ensure 100% factual accuracy based solely on the provided context.`;
      } catch (dbErr) {
        console.error('[AI] Admin DB Fetch Error:', dbErr);
      }
    } else {
      const [menuRes] = await promiseDb.query(`
        SELECT m.id, m.name, m.price_display,
          (SELECT GROUP_CONCAT(CONCAT(v.color_name, ' (مقاسات: ', v.sizes, ')')) FROM product_variants v WHERE v.product_id = m.id) as variants_info
        FROM menu_items m 
        WHERE m.available = 1
      `);

      const menuItems = menuRes.map(m => `- ${m.name} (${m.price_display}) ${m.variants_info ? `[ألوان ومقاسات: ${m.variants_info}]` : '[متوفر بكافة المقاسات الافتراضية]'}`).join('\n');

      businessContext += `\nكتالوج المنتجات المتوفرة حالياً بالمتجر والألوان والمقاسات:\n${menuItems}\n
قواعد وخبرة مستشارة الموضة والأناقة الملكية:
1. أنتِ يافا (Yafa)، خبيرة الأزياء ومستشارة الأناقة لمتجر "زهرة بيسان" الملكي للعبايات والأزياء الفاخرة.
2. مهمتكِ الأولى هي تنسيق الإطلالات الكاملة (Outfit Styling): عند سؤال العميلة عن عباية أو مناسبة (أعراس، عشاء رسمي، يومي، شتوي، استقبال)، اقترحي العباية المناسبة من الكتالوج أعلاه، ونسّقي معها لون الطرحة ونوع القماش، ولون الحقيبة والكعب والإكسسوارات المناسبة.
3. أجيبِ العميلات بأسلوب ملكي راقٍ ودافئ جداً باللهجة واللغة التي يكتبن بها (العربية الفصحى أو العامية اللطيفة أو الإنجليزية).
4. ساعدي العميلة في اختيار الطول والمقاس المناسب لطولها وجسمها (50، 52، 54، 56، 58، 60).
5. استعيني بالكتالوج أعلاه للإجابة عن توافر المنتجات والألوان والمقاسات والأسعار بدقة متناهية.`;
    }
  } catch (e) {
    console.warn('[AI] Context Fetch Error:', e.message);
  }

  // --- Gemini (Primary) ---
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: businessContext
      });

      // Build chat history for Gemini format
      const geminiHistory = [];
      if (history && Array.isArray(history)) {
        history.forEach(m => {
          if (m.role === 'user') geminiHistory.push({ role: 'user', parts: [{ text: m.content }] });
          else if (m.role === 'assistant') geminiHistory.push({ role: 'model', parts: [{ text: m.content }] });
        });
      }

      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessage(message);
      const reply = result.response.text();
      return res.json({ reply: reply || 'عذراً، لم أتمكن من الإجابة. حاول مرة أخرى!' });
    } catch (geminiError) {
      console.error('[Gemini] Chat Error:', geminiError.message);
      // Fall through to OpenAI fallback
    }
  }

  // --- OpenAI (Fallback) ---
  try {
    if (!openai) throw new Error('No AI provider available');
    const aiMessages = [{ role: 'system', content: businessContext }];
    if (history && Array.isArray(history)) aiMessages.push(...history);
    aiMessages.push({ role: 'user', content: message });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: aiMessages,
      max_tokens: 500,
      temperature: 0.0
    });
    return res.json({ reply: completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة.' });
  } catch (error) {
    console.error('[AI] Chat Fallback Error:', error.message);
    const q = (message || '').toLowerCase();
    let smartReply = "أهلاً بكِ في زهرة بيسان ✦ يسعدني دائماً مساعدتكِ في اختيار أجمل العبايات وتنسيق الإطلالات الملكية أو الاستفسار عن المقاسات والشحن الدولي. كيف يمكنني خدمتكِ اليوم؟ ✨";

    if (q.includes('نسق') || q.includes('تنسيق') || q.includes('إطلالة') || q.includes('اطلالة') || q.includes('مناسبة') || q.includes('عرس') || q.includes('زواج') || q.includes('سهرة') || q.includes('فاخر')) {
      smartReply = "يسعدني جداً تنسيق إطلالتكِ الملكية! ✨💎\n\nلمناسبتكِ الفاخرة، أنصحكِ بهذه الإطلالة المتكاملة:\n👑 العباية: «عباية سلتانة الملكية» أو «عباية التطريز اليدوي الأسود والذهبي» بتصميم كلوش فاخر.\n🧣 الطرحة: طرحة شيفون كريب بلون بيج ذهبي أو كحلي ملكي بأطراف مطرزة.\n👜 الإكسسوارات: حقيبة كلاتش ميتاليك ذهبية مع حذاء كعب كلاسيكي ناعم.\n💎 اللمسة الأخيرة: مجوهرات ذهبية رقيقة وعطر عود ملكي فواح ✦";
    } else if (q.includes('سعر') || q.includes('أسعار') || q.includes('بكم') || q.includes('كم')) {
      smartReply = "أسعار عباياتنا الفاخرة تبدأ من 45 JOD وتصل إلى 150 JOD حسب نوع القماش والتطريز اليدوي ✦ يمكنكِ تصفح التشكيلة الكاملة من الصفحة الرئيسية.";
    } else if (q.includes('مقاس') || q.includes('قياس') || q.includes('سايز') || q.includes('طول')) {
      smartReply = "نوفر جميع المقاسات القياسية المعتمدة عالمياً: 50، 52، 54، 56، 58، 60 ✦ يمكنكِ استخدام دليل المقاسات الذكي داخل صفحة أي عباية لمعرفة المقاس الأنسب لكِ حسب الطول والوزن.";
    } else if (q.includes('توصيل') || q.includes('شحن') || q.includes('دولي')) {
      smartReply = "نوصل لجميع محافظات الأردن خلال 1-3 أيام، والتوصيل الدولي لجميع دول العالم خلال 5-10 أيام عمل مع شركات الشحن السريع 🚚✦";
    } else if (q.includes('قماش') || q.includes('خامة') || q.includes('حرير') || q.includes('كريب')) {
      smartReply = "نستخدم في زهرة بيسان أرقى خامات الكريب الملكي السعودي، الحرير المغسول، والكتان الطبيعي المختار بعناية لأعلى درجات الفخامة والراحة ✦";
    }

    return res.status(200).json({ reply: smartReply });
  }
});

app.get('/api/admin/logs', (req, res) => {
  db.query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 200', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/admin/log', (req, res) => {
  const { action, details } = req.body;
  if (req.logAdminAction) req.logAdminAction(action, details);
  res.json({ success: true });
});

app.get('/api/test-ai', (req, res) => {
  res.json({ message: 'AI Server is reachable!', openai: !!openai });
});

app.post('/api/ai-assistant-logs', (req, res) => {
  const { admin_query, ai_response } = req.body;
  db.query('INSERT INTO ai_assistant_logs (admin_query, ai_response) VALUES (?, ?)', [admin_query, ai_response], (err) => {
    if (err) console.error('AI Log Error:', err);
    res.json({ success: true });
  });
});

app.get('/api/debug-images', (req, res) => {
  try {
    const dir = path.resolve(__dirname, 'public/images');
    if (!fs.existsSync(dir)) return res.json({ error: 'Directory not found', path: dir });
    const files = fs.readdirSync(dir);
    res.json({ 
      cwd: process.cwd(),
      dirname: __dirname,
      imageDir: dir,
      count: files.length,
      files: files.slice(0, 50) // only first 50 to avoid huge response
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});


// --- SETTINGS ENDPOINTS ---
const settingsPath = path.join(dataDir, 'store_settings.json');

app.get('/api/settings', (req, res) => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ iban: '', wallet: '', cliqAlias: '' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    let existing = {};
    if (fs.existsSync(settingsPath)) { try { existing = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) {} }
    const newSettings = { ...existing, ...req.body };
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
    if (req.logAdminAction) {
      req.logAdminAction('Update Settings', 'Updated IBAN and/or Wallet information');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});


// --- SOCIAL MEDIA POSTS ---

// Auto-create social_posts table if it doesn't exist
db.getConnection((err, conn) => {
  if (err) return;
  conn.query(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL,
      image_url VARCHAR(500) DEFAULT NULL,
      platforms JSON NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      published_at DATETIME DEFAULT NULL,
      scheduled_at DATETIME DEFAULT NULL,
      results JSON DEFAULT NULL,
      admin_name VARCHAR(100) DEFAULT NULL,
      created_at DATETIME DEFAULT NOW()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `, (err2) => {
    if (err2) console.error('[Social] Table creation error:', err2.message);
    else console.log('[Social] social_posts table ready.');
    conn.release();
  });
});

// GET all posts history
app.get('/api/social/posts', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM social_posts ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a post
app.delete('/api/social/posts/:id', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM social_posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — publish a new post
app.post('/api/social/post', async (req, res) => {
  const { content, image_url, platforms, scheduled_at } = req.body;
  const adminName = req.headers['x-admin-name'] || 'Admin';

  if (!content || !content.trim()) return res.status(400).json({ error: 'Post content is required' });
  if (!platforms || !platforms.length) return res.status(400).json({ error: 'Select at least one platform' });

  // Load settings for API tokens
  let settings = {};
  try {
    const settingsPath = path.join(dataDir, 'store_settings.json');
    if (fs.existsSync(settingsPath)) settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {}

  const results = {};
  const isScheduled = !!scheduled_at;

  if (!isScheduled) {
    // Attempt real publishing for each platform
    for (const platform of platforms) {
      try {
        if (platform === 'facebook' && settings.fb_page_id && settings.fb_access_token) {
          const fbRes = await fetch(
            `https://graph.facebook.com/v19.0/${settings.fb_page_id}/feed`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: content,
                ...(image_url ? { link: image_url } : {}),
                access_token: settings.fb_access_token
              })
            }
          );
          const fbData = await fbRes.json();
          results[platform] = fbData.id ? { success: true, id: fbData.id } : { success: false, error: fbData.error?.message };
        } else if (platform === 'instagram' && settings.ig_user_id && settings.fb_access_token && image_url) {
          // Step 1: Create media container
          const containerRes = await fetch(
            `https://graph.facebook.com/v19.0/${settings.ig_user_id}/media`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image_url,
                caption: content,
                access_token: settings.fb_access_token
              })
            }
          );
          const containerData = await containerRes.json();
          if (containerData.id) {
            // Step 2: Publish
            const pubRes = await fetch(
              `https://graph.facebook.com/v19.0/${settings.ig_user_id}/media_publish`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creation_id: containerData.id, access_token: settings.fb_access_token })
              }
            );
            const pubData = await pubRes.json();
            results[platform] = pubData.id ? { success: true, id: pubData.id } : { success: false, error: 'Publish step failed' };
          } else {
            results[platform] = { success: false, error: containerData.error?.message || 'Container creation failed' };
          }
        } else if (platform === 'whatsapp') {
          // WhatsApp Business API (Cloud API)
          if (settings.wa_phone_number_id && settings.wa_access_token) {
            const waRes = await fetch(
              `https://graph.facebook.com/v19.0/${settings.wa_phone_number_id}/messages`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.wa_access_token}` },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: settings.wa_broadcast_number || settings.wa_phone_number_id,
                  type: 'text',
                  text: { body: content }
                })
              }
            );
            const waData = await waRes.json();
            results[platform] = waData.messages ? { success: true } : { success: false, error: JSON.stringify(waData.error) };
          } else {
            results[platform] = { success: false, error: 'WhatsApp API not configured', manual: true };
          }
        } else {
          // Platform not API-configured — mark as manual
          results[platform] = { success: false, error: 'API not configured', manual: true };
        }
      } catch (platformErr) {
        results[platform] = { success: false, error: platformErr.message };
      }
    }
  }

  // Save to DB
  try {
    const [insertResult] = await db.promise().query(
      'INSERT INTO social_posts (content, image_url, platforms, status, published_at, scheduled_at, results, admin_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        content,
        image_url || null,
        JSON.stringify(platforms),
        isScheduled ? 'scheduled' : 'published',
        isScheduled ? null : new Date(),
        isScheduled ? new Date(scheduled_at) : null,
        JSON.stringify(results),
        adminName
      ]
    );
    if (req.logAdminAction) req.logAdminAction('Social Post', `Published to: ${platforms.join(', ')}`);
    res.json({ success: true, id: insertResult.insertId, results });
  } catch (dbErr) {
    res.status(500).json({ error: dbErr.message });
  }
});

// Production static files already served at top

// Clean DB Endpoint (Temporary)
app.get('/api/clean-db', async (req, res) => {
  try {
    const promiseDb = db.promise ? db.promise() : db;
    await promiseDb.query('DELETE FROM order_items');
    await promiseDb.query('DELETE FROM orders');
    await promiseDb.query('DELETE FROM admin_logs');
    await promiseDb.query('DELETE FROM contact_messages');
    try { await promiseDb.query('DELETE FROM reviews'); } catch(e){}
    res.json({ success: true, message: 'Database cleaned' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Secure FedEx Shipping Rates Endpoint
app.post('/api/shipping-rates', async (req, res) => {
  const { countryCode, city, postalCode, totalWeight } = req.body;
  if (!countryCode) return res.status(400).json({ error: 'Country code is required' });

  // FedEx Production Credentials
  const fedexClientId = process.env.FEDEX_CLIENT_ID || 'l744fb38ebfcd74c87bce7b16fbe236931';
  const fedexClientSecret = process.env.FEDEX_CLIENT_SECRET || '2771d602967246658269cc3a0ae4b4b9';
  const fedexAccountNum = process.env.FEDEX_ACCOUNT_NUM || '211266142';
  const FEDEX_BASE = 'https://apis.fedex.com';

  try {
    const tokenRes = await fetch(`${FEDEX_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(fedexClientId)}&client_secret=${encodeURIComponent(fedexClientSecret)}`
    });
    if (!tokenRes.ok) throw new Error('FedEx auth failed');
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const payload = {
      accountNumber: { value: fedexAccountNum },
      requestedShipment: {
        shipper: { address: { city: 'Amman', postalCode: '11118', countryCode: 'JO' } },
        recipient: { address: { city: city || 'Capital', postalCode: postalCode || '00000', countryCode: countryCode } },
        pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
        rateRequestType: ['ACCOUNT'],
        requestedPackageLineItems: [{ weight: { units: 'KG', value: totalWeight || 1 } }]
      }
    };

    const rateRes = await fetch(`${FEDEX_BASE}/rate/v1/rates/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    if (!rateRes.ok) {
      throw new Error('FedEx rate calculation failed');
    }

    const rateData = await rateRes.json();
    const rateReply = rateData?.output?.rateReplyDetails?.[0];
    if (rateReply && rateReply.ratedShipmentDetails && rateReply.ratedShipmentDetails.length > 0) {
      const chargeAmount = rateReply.ratedShipmentDetails[0].totalNetCharge;
      return res.json({ success: true, amount: chargeAmount || 15 });
    } else {
      return res.json({ success: true, amount: 15 }); // fallback
    }
  } catch (err) {
    console.error('[FedEx Rate Error]:', err.message);
    res.status(500).json({ error: err.message, fallbackRate: 15 });
  }
});

app.get('/api/facebook-catalog.xml', (req, res) => {
  db.query('SELECT * FROM menu_items WHERE active = 1', (err, results) => {
    if (err) return res.status(500).send('Database Error');
    
    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>زهرة بيسان (Zahrat Beesan)</title>
    <link>https://${req.get('host')}</link>
    <description>متجر زهرة بيسان للعباءات الفاخرة</description>
`;

    results.forEach(item => {
      // Clean description for XML
      const desc = (item.description || item.subtitle || item.name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      const title = item.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      const img = item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `https://${req.get('host')}${item.image_url}`) : `https://${req.get('host')}/logo512.png`;
      const link = `https://${req.get('host')}/product/${item.id}`;
      
      xml += `    <item>
      <g:id>${item.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${img}</g:image_link>
      <g:brand>Zahrat Beesan</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${item.price} JOD</g:price>
      <g:inventory>${item.quantity > 0 ? item.quantity : 1}</g:inventory>
    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;
    
    res.set('Content-Type', 'text/xml');
    res.send(xml);
  });
});

// Theme & Banner Settings API
app.get('/api/settings/theme', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query("SELECT `key`, `value` FROM site_settings WHERE `key` IN ('theme_primary', 'theme_bg', 'theme_text', 'theme_hover', 'hero_banners', 'hero_video_url', 'hero_media_type')");
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/theme', async (req, res) => {
  try {
    const { theme_primary, theme_bg, theme_text, theme_hover, hero_banners, hero_video_url, hero_media_type } = req.body;
    const promiseDb = db.promise();
    
    const updateSetting = async (k, v) => {
      if (v !== undefined) {
        await promiseDb.query("DELETE FROM site_settings WHERE `key` = ?", [k]);
        await promiseDb.query("INSERT INTO site_settings (`key`, `value`) VALUES (?, ?)", [k, typeof v === 'string' ? v : JSON.stringify(v)]);
      }
    };

    await updateSetting('theme_primary', theme_primary);
    await updateSetting('theme_bg', theme_bg);
    await updateSetting('theme_text', theme_text);
    await updateSetting('theme_hover', theme_hover);
    await updateSetting('hero_banners', hero_banners);
    await updateSetting('hero_video_url', hero_video_url);
    await updateSetting('hero_media_type', hero_media_type);

    if (req.logAdminAction) {
      req.logAdminAction('Update Theme', 'Updated storefront colors, hero video, and banners.');
    }

    res.json({ success: true, message: 'Theme settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ZAHRAT BEESAN TECH & SOFTWARE LEADS API ---
app.post(['/api/tech/lead', '/api/tech-lead', '/api/tech-leads'], async (req, res) => {
  try {
    const { name, phone, email, company, service, budget, details, estimated_quote, calculator_details } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const promiseDb = db.promise();
    const [result] = await promiseDb.query(
      `INSERT INTO tech_leads (name, phone, email, company, service, budget, details, estimated_quote, calculator_details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        name.trim(),
        phone.trim(),
        (email || '').trim(),
        (company || '').trim(),
        service || 'متجر إلكتروني متكامل',
        budget || '',
        details || '',
        estimated_quote || '',
        calculator_details || ''
      ]
    );

    console.log(`[Tech Leads] Received new project request from ${name} (${phone}) for ${service}`);

    // Asynchronously dispatch instant email notification to official store inbox
    sendStoreNotificationEmail({
      subject: `💼 طلب مشروع تقني جديد: ${name} (${service})`,
      title: 'تم استلام طلب مشروع / استشارة برمجية من موقع زهرة بيسان تك',
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      content: details || `طلب خدمة: ${service} | الميزانية: ${budget || 'غير محددة'}`,
      detailsHtml: `
        <div style="margin-top: 10px; font-size: 13px; color: #444;">
          <p style="margin: 4px 0;"><strong>🏢 الشركة/المؤسسة:</strong> ${company || 'فردي'}</p>
          <p style="margin: 4px 0;"><strong>💻 الخدمة المطلوبة:</strong> ${service}</p>
          <p style="margin: 4px 0;"><strong>💰 الميزانية المقدرة:</strong> ${budget || 'غير محددة'}</p>
          ${estimated_quote ? `<p style="margin: 4px 0;"><strong>📊 تقدير الحاسبة:</strong> ${estimated_quote}</p>` : ''}
        </div>
      `
    }).catch(() => {});

    res.json({ success: true, id: result.insertId, message: 'Lead received successfully' });
  } catch (err) {
    console.error('[Tech Lead Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get(['/api/admin/tech-leads', '/api/admin/tech-lead'], async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query("SELECT * FROM tech_leads ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/tech-leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const promiseDb = db.promise();
    await promiseDb.query("UPDATE tech_leads SET status = ? WHERE id = ?", [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/tech-leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promiseDb = db.promise();
    await promiseDb.query("DELETE FROM tech_leads WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SOCIAL ADS & PIXELS API ---
app.get('/api/social-pixels', (req, res) => {
  db.query('SELECT meta_pixel_id, snap_pixel_id, tiktok_pixel_id FROM social_pixels WHERE id = 1 LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.json({ meta_pixel_id: '', snap_pixel_id: '', tiktok_pixel_id: '' });
    res.json(results[0]);
  });
});

app.get('/api/admin/social-pixels', (req, res) => {
  db.query('SELECT * FROM social_pixels WHERE id = 1 LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.json({
        meta_pixel_id: '',
        snap_pixel_id: '',
        tiktok_pixel_id: '',
        meta_token: '',
        snap_token: '',
        tiktok_token: ''
      });
    }
    res.json(results[0]);
  });
});

app.post('/api/admin/social-pixels', (req, res) => {
  const { meta_pixel_id, snap_pixel_id, tiktok_pixel_id, meta_token, snap_token, tiktok_token } = req.body;
  const sql = `
    INSERT INTO social_pixels (id, meta_pixel_id, snap_pixel_id, tiktok_pixel_id, meta_token, snap_token, tiktok_token)
    VALUES (1, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      meta_pixel_id = VALUES(meta_pixel_id),
      snap_pixel_id = VALUES(snap_pixel_id),
      tiktok_pixel_id = VALUES(tiktok_pixel_id),
      meta_token = VALUES(meta_token),
      snap_token = VALUES(snap_token),
      tiktok_token = VALUES(tiktok_token)
  `;
  db.query(sql, [meta_pixel_id || '', snap_pixel_id || '', tiktok_pixel_id || '', meta_token || '', snap_token || '', tiktok_token || ''], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) {
      req.logAdminAction('Update Social Pixels', 'Updated social ad tracking IDs & access tokens.');
    }
    res.json({ success: true, message: 'تم حفظ إعدادات البكسل بنجاح' });
  });
});

// Catalog Feed for Social Ads (Meta / Snapchat / TikTok catalog ingestion)
app.get('/api/catalog.json', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  db.query('SELECT * FROM products WHERE available = 1 ORDER BY id DESC', (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    const catalog = products.map(p => {
      let imageUrl = p.image || '';
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      return {
        id: `PROD_${p.id}`,
        title: p.name,
        description: p.description || p.name,
        availability: 'in stock',
        condition: 'new',
        price: `${parseFloat(p.price).toFixed(2)} JOD`,
        link: `${baseUrl}/#product-${p.id}`,
        image_link: imageUrl,
        brand: 'Zahrat Beesan',
        category: p.category || 'Abaya'
      };
    });

    res.setHeader('Content-Type', 'application/json');
    res.json({
      title: 'Zahrat Beesan Product Catalog',
      updated_at: new Date().toISOString(),
      item_count: catalog.length,
      items: catalog
    });
  });
});

// For any other GET request (that isn't an API), serve React's index.html or fallback static assets gracefully
app.get(/.*/, (req, res) => {
  // 1. Graceful fallback for CSS bundles if old hash requested
  if (req.path.startsWith('/static/css/') || (req.path.includes('.css') && req.path.startsWith('/static/'))) {
    const cssDirs = [
      path.join(__dirname, 'build', 'static', 'css'),
      path.join(__dirname, 'static', 'css'),
      path.join(__dirname, 'build', 'css')
    ];
    for (const cDir of cssDirs) {
      if (fs.existsSync(cDir)) {
        const cssFiles = fs.readdirSync(cDir).filter(f => f.startsWith('main.') && f.endsWith('.css'));
        if (cssFiles.length > 0) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.sendFile(path.join(cDir, cssFiles[0]));
        }
      }
    }
  }

  // 2. Graceful fallback for JS bundles if old hash requested
  if (req.path.startsWith('/static/js/') || (req.path.includes('.js') && req.path.startsWith('/static/'))) {
    const jsDirs = [
      path.join(__dirname, 'build', 'static', 'js'),
      path.join(__dirname, 'static', 'js'),
      path.join(__dirname, 'build', 'js')
    ];
    for (const jDir of jsDirs) {
      if (fs.existsSync(jDir)) {
        const jsFiles = fs.readdirSync(jDir).filter(f => f.startsWith('main.') && f.endsWith('.js'));
        if (jsFiles.length > 0) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.sendFile(path.join(jDir, jsFiles[0]));
        }
      }
    }
  }

  // If a request for images/media reached here and was missing
  if (req.path.startsWith('/public/') || /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|map)$/i.test(req.path)) {
    return res.status(404).send('Asset not found');
  }

  const diskIndex = path.join(__dirname, 'build', 'index.html');
  if (fs.existsSync(diskIndex)) {
    try {
      const html = fs.readFileSync(diskIndex, 'utf8');
      if (html && html.trim().length > 100) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.send(html);
      }
    } catch (e) {}
  }

  if (typeof EMBEDDED_INDEX_HTML === 'string' && EMBEDDED_INDEX_HTML.length > 100) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.send(EMBEDDED_INDEX_HTML);
  }

  res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Zahrat Beesan</title></head><body><div id="root"></div><script>window.location.reload();</script></body></html>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Zahrat Beesan] Server is LIVE and listening on port: ${PORT}`);
});
