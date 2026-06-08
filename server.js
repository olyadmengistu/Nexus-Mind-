import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Feedback submission endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = req.body;

    // Validate required fields
    if (!feedback.subject || !feedback.message || !feedback.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: process.env.ADMIN_EMAILS,
      subject: `[NexusMind Feedback] ${feedback.category.toUpperCase()}: ${feedback.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Feedback Received</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">NexusMind Feedback System</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Category:</strong>
              <span style="background: #e3f2fd; color: #1976d2; padding: 5px 12px; border-radius: 15px; font-size: 14px; font-weight: 600;">
                ${feedback.category.toUpperCase()}
              </span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Subject:</strong>
              <p style="color: #555; margin: 0; font-size: 16px;">${feedback.subject}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Rating:</strong>
              <div style="color: #ffc107; font-size: 24px;">
                ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">From:</strong>
              <p style="color: #555; margin: 0;">${feedback.userName} (${feedback.email})</p>
              <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">User ID: ${feedback.userId}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Message:</strong>
              <div style="background: white; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; color: #555; line-height: 1.6;">
                ${feedback.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Submitted:</strong>
              <p style="color: #999; margin: 0; font-size: 14px;">${new Date(feedback.timestamp).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                <strong>Feedback ID:</strong> ${feedback.id}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>This feedback was submitted through the NexusMind Feedback System</p>
          </div>
        </div>
      `,
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: feedback.email,
      subject: 'Thank you for your feedback - NexusMind',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your feedback has been received</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Dear ${feedback.userName},
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Thank you for taking the time to share your feedback with us. We truly appreciate your input and will review it carefully.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
              <p style="color: #333; margin: 0 0 10px 0; font-weight: 600;">Feedback Summary:</p>
              <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Category:</strong> ${feedback.category}</li>
                <li><strong>Subject:</strong> ${feedback.subject}</li>
                <li><strong>Rating:</strong> ${feedback.rating}/5</li>
                <li><strong>Submitted:</strong> ${new Date(feedback.timestamp).toLocaleDateString()}</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or need to provide additional information, please don't hesitate to contact us at support@nexusmind.com
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Best regards,<br>
              The NexusMind Team
            </p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="color: #1976d2; margin: 0; font-size: 14px;">
                <strong>Feedback ID:</strong> ${feedback.id}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2024 NexusMind. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    console.log(`Feedback received from ${feedback.userName}: ${feedback.subject}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      feedbackId: feedback.id 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Feedback server is running' });
});

app.listen(PORT, () => {
  console.log(`Feedback server running on port ${PORT}`);
  console.log(`Email service configured for: ${process.env.GMAIL_EMAIL}`);
});
