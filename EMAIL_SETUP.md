# Email Contact Form Setup

Your portfolio now has a fully functional contact form that can send emails directly to `gadingadityaperdana@gmail.com`. Here's how to set it up:

## Option 1: EmailJS (Recommended - Free & Easy)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service
1. Go to **Email Services** in your EmailJS dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Copy your **Service ID**

### Step 3: Create Email Template
1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template content:

```
Subject: {{subject}}

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
This message was sent from your portfolio contact form.
Reply to: {{reply_to}}
```

4. Save the template and copy your **Template ID**

### Step 4: Get Public Key
1. Go to **Integration** in your dashboard
2. Copy your **Public Key**

### Step 5: Configure Your Portfolio
1. Open `src/config/emailjs.js`
2. Replace the placeholder values:

```javascript
export const emailjsConfig = {
  serviceId: 'your_actual_service_id',
  templateId: 'your_actual_template_id', 
  publicKey: 'your_actual_public_key'
};
```

## Option 2: Fallback (Always Works)

If EmailJS is not configured, the contact form will automatically open the user's default email client with a pre-filled message. This ensures the contact form always works!

## Testing

1. Fill out the contact form on your portfolio
2. Submit the form
3. Check your email at `gadingadityaperdana@gmail.com`

## Features

- ✅ Real email sending via EmailJS
- ✅ Form validation (required fields, email format)
- ✅ Success/error feedback to users
- ✅ Automatic fallback to email client
- ✅ Mobile-friendly design
- ✅ Spam protection (client-side only)

## Troubleshooting

- **Emails not sending**: Check your EmailJS configuration in `src/config/emailjs.js`
- **Form shows error**: The form will fallback to opening your email client
- **No success message**: Check browser console for errors

Your contact form is now ready to use! 🚀
