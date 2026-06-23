<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NexusMind - The Problem Solving Network

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:** Node.js

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

### Feedback System Setup

The feedback system includes a modern UI with email notifications. To enable email functionality:

1. **Configure Environment Variables**
   
   Create a `.env` file in the root directory with the following:
   ```env
   GMAIL_EMAIL=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   EMAIL_ADDRESS=your-email@gmail.com
   ADMIN_EMAILS=admin-email@gmail.com
   PORT=3001
   ```

   **Note:** To get a Gmail App Password:
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate an App Password for mail
   - Use this password (not your regular password)

2. **Install Backend Dependencies**
   
   The following dependencies are already added to package.json:
   - `express` - Backend server
   - `cors` - Cross-origin resource sharing
   - `dotenv` - Environment variable management
   - `nodemailer` - Email sending

   Install them:
   ```bash
   npm install
   ```

3. **Run the Feedback Server**
   
   Start the backend server:
   ```bash
   npm run server
   ```

   The server will run on port 3001 by default.

4. **Run Both Frontend and Backend**
   
   To run both simultaneously:
   ```bash
   npm run dev:all
   ```

### Feedback System Features

- **Modern UI**: Clean, gradient-based design with clear visual hierarchy
- **Category Selection**: 6 feedback categories (General, Bug, Feature, UI/UX, Performance, Security)
- **Star Rating**: 5-star rating system with visual feedback
- **Email Notifications**: 
  - Admin receives detailed feedback emails with all submission details
  - User receives confirmation email with feedback summary
- **Feedback History**: View recent feedback submissions
- **Form Validation**: Real-time validation with clear error messages
- **Responsive Design**: Works on all screen sizes

### API Endpoints

- `POST /api/feedback` - Submit feedback
- `GET /api/health` - Health check endpoint

## Auto-Deploy Test
Testing Vercel auto-deploy functionality.
"# Nexus-Mind-" 
