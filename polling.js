const BOT_TOKEN = "8653385165:AAGumKtzjLo4IDoQDaHM4B01bhIzipM9hs4";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let offset = 0;

async function sendMessage(chatId, text) {
  const body = { chat_id: chatId, text, parse_mode: "Markdown" };
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) console.error("sendMessage error:", data.description);
    return data;
  } catch (err) {
    console.error("sendMessage fetch error:", err.message);
  }
}

function handleCommand(command, message) {
  const name = message.from?.first_name || "there";
  switch (command) {
    case "/start":
      return `Hey ${name} 👋\n\nI'm *Plexy*, your personal assistant bot.\n\nHere's what I can do:\n/help — See available commands\n/about — Learn about me\n/echo <text> — I'll repeat what you say\n/time — Current UTC time\n/id — Your Telegram user info`;
    case "/help":
      return `*Available Commands*\n\n/start — Welcome message\n/help — This help menu\n/about — About Plexy\n/echo <text> — Echo your message\n/time — Current UTC time\n/id — Your user info`;
    case "/about":
      return `*About Plexy*\n\nI'm a lightweight Telegram bot built by Garnett Burke.\n\nVersion: 1.0.0\nStatus: Online ✅`;
    case "/time":
      return `🕐 *Current UTC Time*\n${new Date().toUTCString()}`;
    case "/id": {
      const user = message.from;
      return `*Your Info*\n\nID: \`${user.id}\`\nName: ${user.first_name}${user.last_name ? " " + user.last_name : ""}\nUsername: ${user.username ? "@" + user.username : "not set"}\nLanguage: ${user.language_code || "unknown"}`;
    }
    default:
      return null;
  }
}

async function processMessage(message) {
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text.startsWith("/")) {
    const parts = text.split(" ");
    const command = parts[0].toLowerCase().split("@")[0];

    if (command === "/echo") {
      const echoText = parts.slice(1).join(" ");
      await sendMessage(chatId, echoText || "Usage: `/echo <your message>`");
      return;
    }

    const response = handleCommand(command, message);
    if (response) {
      await sendMessage(chatId, response);
      return;
    }
  }

  await sendMessage(chatId, `You said: _${text}_\n\nTry /help to see what I can do.`);
}

async function poll() {
  try {
    const res = await fetch(
      `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30&allowed_updates=["message"]`
    );
    const data = await res.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        offset = update.update_id + 1;
        if (update.message) {
          console.log(
            `[${new Date().toISOString()}] Message from ${update.message.from?.first_name}: ${update.message.text}`
          );
          await processMessage(update.message);
        }
      }
    }
  } catch (err) {
    console.error("Polling error:", err.message);
    await new Promise((r) => setTimeout(r, 3000));
  }
}

async function deleteWebhook() {
  const res = await fetch(`${TELEGRAM_API}/deleteWebhook`);
  const data = await res.json();
  console.log("Webhook cleared:", data.ok ? "yes" : data.description);
}

async function main() {
  console.log("🤖 Plexy bot starting (long-polling mode)...");
  await deleteWebhook();
  console.log("✅ Polling for messages...");
  while (true) {
    await poll();
  }
}

main().catch(console.error);
