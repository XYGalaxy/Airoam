# Environment Variables Setup

## Security Best Practices

1. **Never commit `.env` files**
   - The `.env` file is already added to `.gitignore`
   - Keep your API keys and secrets secure
   - Never share API keys in public repositories

2. **Use Environment Variables Template**
   - Copy `.env.example` to `.env`
   - Fill in your actual API keys and configuration
   - Keep `.env.example` updated with new variables (but without real values)

3. **GitHub Secrets**
   For deployment, use GitHub Secrets:
   ```bash
   # In GitHub repository:
   Settings -> Secrets and variables -> Actions -> New repository secret
   
   # Add these secrets:
   GOOGLE_PLACES_API_KEY
   OPENAI_API_KEY
   ```

4. **Local Development**
   ```bash
   # 1. Copy the example file
   cp .env.example .env

   # 2. Edit .env with your actual keys
   # 3. Never commit .env file
   ```

5. **Production Deployment**
   - Use environment variables in your hosting platform
   - For Vercel/Netlify: Set environment variables in their dashboard
   - For traditional hosting: Set environment variables in your server configuration

## Required Environment Variables

```bash
# API Keys (Required)
VITE_GOOGLE_PLACES_API_KEY=    # Google Places API key
VITE_OPENAI_API_KEY=           # OpenAI API key

# Server Configuration (Optional)
PORT=3000                      # Server port
NODE_ENV=development          # Environment mode
CORS_ORIGIN=http://localhost:3000  # CORS origin
```

## Troubleshooting

1. **Missing Environment Variables**
   - Check if `.env` file exists
   - Verify all required variables are set
   - Restart the development server

2. **API Key Issues**
   - Verify API key validity
   - Check API key permissions
   - Ensure proper key format

3. **Deployment Issues**
   - Verify environment variables in deployment platform
   - Check for typos in variable names
   - Ensure proper casing of variable names 