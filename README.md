# PromptPilot

PromptPilot is a Next.js App Router chat workspace with a conversation sidebar, Markdown responses, quick actions, and Markdown export.

## Requirements
- Node.js 18.18 or newer (Node.js 20 LTS is recommended)
- npm
- A Clerk application for sign-in
- MongoDB connection string for saved conversations
- An OpenAI-compatible AI API key for AI responses

## Run locally
1. Extract the ZIP.
2. Open a terminal in the `PromptPilot-main` folder (the folder containing `package.json`).
3. Install dependencies:

   ```bash
   npm ci
   ```

4. Copy `.env.example` to `.env.local` on Windows Command Prompt:

   ```bat
   copy .env.example .env.local
   ```

   In PowerShell you can use `Copy-Item .env.example .env.local`. On macOS/Linux use `cp .env.example .env.local`.

5. Add your Clerk publishable and secret keys, MongoDB URI, and AI provider key to `.env.local`. Do not commit `.env.local` or share its secret values.
6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open http://localhost:3000.

## Environment variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: from your Clerk dashboard's API Keys page.
- `CLERK_SECRET_KEY`: from the same Clerk application.
- `MONGODB_URI`: MongoDB Atlas or another MongoDB connection string.
- `OPENAI_API_KEY`: key for OpenAI or a compatible provider.
- `OPENAI_BASE_URL` (optional): custom OpenAI-compatible API base URL.
- `OPENAI_MODEL` (optional): provider-supported model name; defaults to `gpt-4o-mini`.

For Google's OpenAI-compatible Gemini endpoint, if available for your account, use the base URL and model shown in `.env.example` and a Google AI Studio key as `OPENAI_API_KEY`. Provider model names and free-tier terms may change.

## Available scripts
- `npm run dev` — local development server
- `npm run build` — production build
- `npm run start` — start the production server after building
- `npm run lint` — run ESLint

## Current feature status
- The chat interface, conversation selection, message composer, quick-action prompts, and Markdown export are implemented in the source.
- Chat history and AI requests require valid Clerk, MongoDB, and AI-provider configuration.
- Saved Prompts is a clearly labelled sample page; saving prompts to a database is not implemented.
- Chat responses are currently requested as a complete response (not server-streamed token-by-token).
- The included icons and QR image are replacements because the ZIP did not contain the original SVG icon files or original QR asset. Replace these with the originals if available.

## License and attribution
The project metadata and original README identify the project as PromptPilot by Bushra Inamdar and reference the MIT License. Preserve the original license and attribution when redistributing. The original ZIP did not include a separate `LICENSE` file.
