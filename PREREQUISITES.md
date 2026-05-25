# Prerequisites

Welcome to AI Test Generator. Before you begin, please complete the following
one-time setup. This should take approximately 15-20 minutes and will never
need to be repeated.

---

## 1. Node.js

Node.js is required to run this tool.

1. Visit https://nodejs.org
2. Download the **LTS** version
3. Run the installer and follow the on-screen steps
4. Confirm installation by opening Command Prompt and running:

   ```
   node --version
   ```

   You should see a version number such as `v18.0.0` or higher.

---

## 2. Java

Java is required to generate test reports.

1. Visit https://learn.microsoft.com/en-us/java/openjdk/download
2. Download **Java 21** for your operating system
3. Run the installer and follow the on-screen steps
4. Confirm installation by opening Command Prompt and running:

   ```
   java -version
   ```

   You should see a version number such as `21.0.0` or higher.

---

## 3. AI Provider

This tool supports three AI providers. Please choose **one** that best suits
your needs. You do not need to set up more than one.

---

### Option A — Local AI · Free · No Account Required · Recommended

This option runs entirely on your computer. No data is sent online.
No account or payment is required.

1. Visit https://ollama.com/download
2. Download and install Ollama for your operating system
3. Open Command Prompt and run the following to download the AI model:

   ```
   ollama pull mistral
   ```

   > Please note: This download is approximately 4GB in size.
   > Ensure you have a stable internet connection before proceeding.
   > This is a one-time download.

4. Open your `.env` file and set the following:

   ```
   AI_PROVIDER=ollama
   OLLAMA_MODEL=mistral
   ```

---

### Option B — Anthropic Claude · Paid · Account Required

This option uses Anthropic's Claude AI service online.
An API key and account credits are required.

1. Visit https://console.anthropic.com
2. Sign in or create an account
3. Navigate to **API Keys** and select **Create Key**
4. Copy your key — it begins with `sk-ant-`
5. Open your `.env` file and set the following:

   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=your_key_here
   ANTHROPIC_MODEL=claude-sonnet-4-5
   ```

---

### Option C — OpenAI GPT · Paid · Account Required

This option uses OpenAI's GPT service online.
An API key and account credits are required.

1. Visit https://platform.openai.com
2. Sign in or create an account
3. Navigate to **API Keys** and select **Create new secret key**
4. Copy your key — it begins with `sk-`
5. Open your `.env` file and set the following:

   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-4o-mini
   ```

---

## 4. Tool Setup

Once your AI provider is configured, complete the following steps to
finish setting up the tool.

**Clone the repository:**
```
git clone https://github.com/ravitejapioneerblaze-code/ai-test-case-generator.git
cd ai-test-case-generator
```

**Install dependencies:**
```
npm install
```

**Install the browser:**
```
npx playwright install chromium
```

**Configure your environment:**
```
copy .env.example .env
```

Open the `.env` file and fill in your AI provider details from Step 3.

---

## You Are All Set

Start the tool by running:

```
npm start
```

When prompted, enter the website address you would like to test.
The tool will handle everything else automatically.

---

## Troubleshooting

If you encounter any issues during setup, the following may help.

| Symptom | Suggested Resolution |
|---------|----------------------|
| `node` command not recognised | Close and reopen Command Prompt after installing Node.js |
| `java` command not recognised | Close and reopen Command Prompt after installing Java |
| Ollama model download is slow | Please allow time to complete — this is a one-time download |
| API key is not accepted | Ensure there are no spaces around the `=` sign in your `.env` file |
| No tests found | Ensure you have run `npx playwright install chromium` |

---

## Support

If you experience an issue not covered above, please open a support request at:

https://github.com/ravitejapioneerblaze-code/ai-test-case-generator/issues

We aim to respond to all queries promptly.
