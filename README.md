LLM Battle Judge

This Node.js app compares the responses of different LLMs (Large Language Models) to the same prompt and uses another model to rank them based on quality.

⚙️ How It Works

Sends a prompt to multiple LLMs (e.g. DeepSeek, LLaMA, NVIDIA Nemotron, etc.).

Collects and logs their responses.

Sends all responses to a "judge" model (e.g. GPT-4) to rank them based on clarity and argument strength.

Displays a ranked list of model performances.

🔧 Tech Stack

Node.js

OpenRouter API

Local LLaMA via Ollama (http://localhost:11434/v1)

dotenv for environment config
