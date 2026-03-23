const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text, options = {}) {
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    ...options,
  };
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function handleCommand(command, message) {
  const name = message.from?.first_name || "there";

  switch (command) {
    case "/start":
      return `Hey ${name} 👋\n\nI'm *Plexy*, your personal assistant bot.\n\nHere's what I can do:\n/help — See available commands\n/about — Learn about me\n/echo <text> — I'll repeat what you say\n/time — Current UTC time\n/id — Your Telegram user info`;

    case "/help":
      return `*Available Commands*\n\n/start — Welcome message\n/help — This help menu\n/about — About Plexy\n/echo <text> — Echo your message\n/time — Current UTC time\n/id — Your user info`;

    case "/about":
      return `*About Plexy*\n\nI'm a lightweight Telegram bot built and deployed on Vercel.\n\nOwner: Garnett Burke\nVersion: 1.0.0\nStatus: Online ✅`;

    case "/time":
      return `🕐 *Current UTC Time*\n${new Date().toUTCString()}`;

    case "/id":
      const user = message.from;
      return `*Your Info*\n\nID: \`${user.id}\`\nName: ${user.first_name}${user.last_name ? " " + user.last_name : ""}\nUsername: ${user.username ? "@" + user.username : "not set"}\nLanguage: ${user.language_code || "unknown"}`;

    default:
      return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ status: "Plexy bot is running" });
  }

  try {
    const { message } = req.body;

    if (!message || !message.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Handle commands
    if (text.startsWith("/")) {
      const parts = text.split(" ");
      const command = parts[0].toLowerCase().split("@")[0]; // Remove @botname suffix

      // Special case: /echo
      if (command === "/echo") {
        const echoText = parts.slice(1).join(" ");
        if (echoText) {
          await sendMessage(chatId, echoText);
        } else {
          await sendMessage(chatId, "Usage: `/echo <your message>`");
        }
        return res.status(200).json({ ok: true });
      }

      const response = handleCommand(command, message);
      if (response) {
        await sendMessage(chatId, response);
        return res.status(200).json({ ok: true });
      }
    }

    // Default response for non-command messages
    await sendMessage(
      chatId,
      `You said: _${text}_\n\nTry /help to see what I can do.`
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
}
