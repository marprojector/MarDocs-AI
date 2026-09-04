# MarDocs AI

> **Read less. Understand more.**

MarDocs AI is an AI-powered document analysis and conversation platform that helps you understand your documents faster.

Upload your documents, ask questions in natural language, and get clear answers backed by references from the source material.

**Live Demo:** [MarDocs AI](https://mardocs-ai.vercel.app/)

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
| **Vercel Blob** | Document/file storage |
| **PDF.js** | PDF processing |
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
- PostgreSQL database
- An OpenAI API key
- Vercel Blob storage (for file storage)
- Authentication configuration

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

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# OpenAI
OPENAI_API_KEY="your_openai_api_key"

# Authentication
AUTH_SECRET="your_auth_secret"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
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

MarDocs AI is deployed using **Vercel**.

The production application is available at:

**https://mardocs-ai.vercel.app/**

For deployment, make sure all required environment variables are configured in your hosting provider.

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
