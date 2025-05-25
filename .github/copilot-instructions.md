# HA-Chat Project

This is a Next.js chat application that connects to LLMs via OpenAI-like APIs and supports MCP (Model Context Protocol) tools. The application uses:

- Next.js with TypeScript and App Router
- Prisma with SQLite for database management
- OpenAI SDK for LLM integration
- React Hook Form with Zod for form validation
- Tailwind CSS for styling
- Add tests with Jest and React Testing Library when adding new features
- Cypress for end-to-end testing
- ESLint and Prettier for code quality and formatting
- Follow TTD (Test-Driven Development) practices
- Follow best practices for security, including secure storage of API keys and tokens
- Use underscore naming for variables and functions

## Key Components

- Chat interface with real-time messaging
- Configuration for LLM endpoints and tokens
- MCP tools integration
- SQLite database for storing configurations
- SQLite database for storing chat messages and user data

## Scope

- This project aims to create easy to use chat interface to local LLMs running in browser and interacting with MCP
- The primary goal is to communicate with home assistant
- Each LLM backend should be able to get different system prompt
