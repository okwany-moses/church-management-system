<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ab0258b8-85c2-4604-89cd-713bc81b6d69

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app in development mode:
   `npm run dev`

## Deploy to Render

1. Create a new Web Service on Render using this repository.
2. Use the following settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`
   - Branch: your default branch
3. Render will use the provided `render.yaml` to configure the service.

## Environment Variables

- `NODE_ENV=production`
- `PORT=10000` (Render injects its own port automatically)
