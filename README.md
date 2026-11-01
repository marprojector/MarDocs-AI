# MarDocs AI

> **Read less. Understand more.**

MarDocs AI is an AI-powered document analysis and conversation platform that helps you understand your documents faster.

Upload your documents, ask questions in natural language, and get clear answers backed by references from the source material.

**Live Demo:** [MarDocs AI](https://mardocs.ammararief.my.id/)

<img width="1710" height="959" alt="mardocs-ai-preview" src="https://github.com/user-attachments/assets/c80d747a-0c42-44ee-8d3f-700931897a48" />



**Repository:** [GitHub](https://github.com/marprojector/MarDocs-AI)

---

## ✨ Features

### 📄 Document Analysis

Upload your documents and let MarDocs analyze their contents to help you extract important information and insights.

Supported file formats:

- PDF
- DOCX
- TXT
- CSV

### 🤖 AI-Powered Q&A

Ask questions directly about your uploaded documents using natural language.

MarDocs generates answers based on the contents of your documents, making it easier to find information without manually searching through long files.

### 🔎 Cited Answers

Answers can include references to the source material, allowing you to trace information back to the document.

### 📚 Smart Library

Keep your uploaded documents organized in one place and quickly find the information you need.

### 🔐 Private by Design

MarDocs is designed with document privacy in mind, keeping your uploaded documents within your own workspace.

---

## 🚀 How It Works

MarDocs follows a simple three-step workflow:

```text
┌─────────────┐
│    Upload   │
│   Document  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     Ask     │
│  Questions  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Understand │
│  & Analyze  │
└─────────────┘
```

### 1. Upload

Upload your PDF, DOCX, TXT, or CSV document.

### 2. Ask

Ask questions, request summaries, or extract specific information using natural language.

### 3. Understand

MarDocs analyzes the document and provides useful answers and insights based on its contents.

---

## 🛠️ Tech Stack

MarDocs AI is built using modern web technologies.

| Technology | Purpose |
|---|---|
| **Next.js 16** | Full-stack React framework |
| **React 19** | User interface |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Styling |
| **Prisma** | Database ORM |
| **PostgreSQL** | Database |
| **OpenAI AI SDK** | AI integration |
| **NextAuth** | Authentication |
| **Supabase Storage** | Document/file storage |
| **Cloudflare Workers** | Hosting (OpenNext adapter) |
| **Cloudflare Hyperdrive** | Pooled PostgreSQL access from Workers |
| **unpdf** | PDF processing |
| **Mammoth** | DOCX processing |
| **Zod** | Schema validation |
| **Framer Motion** | UI animations |
| **GSAP** | Advanced animations |
| **Lucide React** | Icons |

---

## 📦 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL database (with the `vector` extension for RAG)
- An OpenRouter API key
- A Voyage AI API key (embeddings)
- A Supabase project with a private Storage bucket
- Google and/or GitHub OAuth credentials

### 1. Clone the repository

```bash
git clone https://github.com/marprojector/MarDocs-AI.git
cd MarDocs-AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# Authentication
AUTH_SECRET="your_auth_secret"
AUTH_GOOGLE_ID="your_google_oauth_client_id"
AUTH_GOOGLE_SECRET="your_google_oauth_client_secret"
AUTH_GITHUB_ID="your_github_oauth_client_id"
AUTH_GITHUB_SECRET="your_github_oauth_client_secret"

# AI
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="openrouter/free"
VOYAGE_API_KEY="your_voyage_api_key"

# Supabase Storage (private bucket)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
SUPABASE_STORAGE_BUCKET="mardocs"
```

> **Important:** Never commit your `.env` file or expose your API keys publicly.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Set up the database

Run the Prisma migrations:

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 📁 Project Structure

The project follows a Next.js application structure:

```text
MarDocs-AI/
├── .agents/
├── .claude/
├── .cursor/
├── .devin/
├── prisma/
├── public/
├── src/
├── typings/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

The main application code is located inside the `src/` directory, while database-related Prisma files are located in `prisma/`.

---

## 🧪 Available Scripts

### Development

```bash
npm run dev
```

Starts the Next.js development server.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Production Server

```bash
npm run start
```

Runs the production build.

### Lint

```bash
npm run lint
```

Runs ESLint to check the codebase.

---

## 🌐 Deployment

MarDocs is deployed on **Cloudflare Workers** using the [OpenNext](https://opennext.js.org/cloudflare) adapter.

The production application is available at:

**https://mardocs.ammararief.my.id**

### Cloudflare configuration

- `wrangler.jsonc` declares the Worker, static assets, the custom domain, and the `HYPERDRIVE` binding.
- `open-next.config.ts` holds the OpenNext configuration.
- Database access goes through Cloudflare Hyperdrive; Prisma falls back to `DATABASE_URL` when no binding is present.
- Files are stored in Supabase Storage and served only through the authenticated `/api/documents/[id]/file` route.

### Deploy

```bash
npm run deploy
```

Deployment needs a local Hyperdrive connection string so Wrangler can resolve the binding during the build:

```bash
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="$DATABASE_URL"
npm run deploy
```

Configure these Worker secrets before deploying:

```bash
npx wrangler secret put AUTH_SECRET
npx wrangler secret put AUTH_GOOGLE_ID
npx wrangler secret put AUTH_GOOGLE_SECRET
npx wrangler secret put AUTH_GITHUB_ID
npx wrangler secret put AUTH_GITHUB_SECRET
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put VOYAGE_API_KEY
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### Supabase Storage setup

1. Create a Supabase project.
2. Create a private bucket named `mardocs`.
3. Add the project URL and service-role key as Worker secrets.

Records created before the migration still point at legacy Vercel Blob URLs. Those files cannot be served until they are re-uploaded or migrated with the old Blob token.

---

## 🔒 Security

MarDocs handles potentially sensitive documents, so environment variables and credentials should never be committed to the repository.

Make sure:

- `.env` files are ignored by Git.
- API keys are stored securely.
- Database credentials are never exposed to the client.
- Storage credentials are kept server-side.
- Authentication secrets are kept private.

---

## 📌 Roadmap

Potential improvements for future versions:

- [ ] Support additional document formats
- [ ] Improved document search
- [ ] More advanced citation handling
- [ ] Conversation history improvements
- [ ] Document sharing
- [ ] Better document organization
- [ ] Advanced AI summarization
- [ ] Multi-document conversations
- [ ] Improved analytics and usage tracking

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

If you would like to contribute:

```bash
# Fork the repository

# Clone your fork
git clone https://github.com/marprojector/MarDocs-AI.git

# Create a new branch
git checkout -b feature/your-feature

# Make your changes

# Commit your changes
git add .
git commit -m "feat: add your feature"

# Push your branch
git push origin feature/your-feature
```

Then open a Pull Request.

---

## 📄 License

This project currently does not specify a license.

If you plan to make MarDocs AI open source, consider adding an appropriate license such as MIT.

---

## 👨‍💻 Author

**MarProjector**

GitHub: [@marprojector](https://github.com/marprojector)

---

<p align="center">
  Built with ❤️ using Next.js, AI, and modern web technologies.
</p>
