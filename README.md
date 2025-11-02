# Todo-Backend

Quick notes for running locally and exposing the Swagger UI for client demos.

Steps

1. Copy `.env.example` to `.env` and fill in your real values (do NOT commit `.env`).

   On Windows PowerShell:

   ```powershell
   copy .env.example .env
   # then edit .env with your values
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Start the server (development):

   ```powershell
   npm run dev
   ```

4. Open the Swagger UI in your browser:

   - Go to: http://localhost:3000 (this redirects to `/api-docs`)
   - Or go directly: http://localhost:3000/api-docs

Notes

- `.env` is ignored by `.gitignore` to prevent leaking credentials.
- `.env.example` contains placeholders only.
- Swagger UI is available at `/api-docs` and the root `/` redirects there for easy demos.