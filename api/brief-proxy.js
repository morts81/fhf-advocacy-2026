export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, system, maxTokens = 1400 } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  if (!system) {
    return res.status(400).json({ error: "system prompt is required" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({ error: `Anthropic API error: ${response.status}`, detail: errorBody });
    }

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text;

    if (!text) {
      return res.status(500).json({ error: "No text content in API response" });
    }

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: "Proxy error", detail: err.message });
  }
}
