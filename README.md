# HA-Chat

A Next.js chat application that connects to LLMs via OpenAI-like APIs and supports MCP (Model Context Protocol) tools.

## Features

- Chat interface with real-time messaging
- Support for OpenAI-compatible API endpoints
- Model Context Protocol (MCP) tools integration
- Configuration management for LLM endpoints and tokens
- SQLite database for persistent storage

## Tech Stack

- **Framework**: Next.js with TypeScript and App Router
- **Database**: Prisma with SQLite
- **UI**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **API Integration**: OpenAI SDK

## Getting Started

First, clone the repository and install dependencies:

```bash
npm install
```

Next, set up the database:

```bash
npx prisma db push
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Configuration

The application allows you to configure:

1. **LLM Endpoints**: Connect to OpenAI or compatible API endpoints
2. **API Keys**: Securely store your API tokens
3. **MCP Tools**: Define custom tools that extend the LLM's capabilities

## MCP Tool Integration

The Model Context Protocol allows for function calling capabilities with your LLM. Add tools with:

- Name and description
- Endpoint URL for tool execution
- JSON schema defining the tool's parameters
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
