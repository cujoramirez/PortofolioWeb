// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create a free account
// 3. Add an email service (Gmail, Outlook, etc.)
// 4. Create an email template
// 5. Get your Service ID, Template ID, and Public Key
// 6. Replace the values below

export const emailjsConfig = {
    // Your EmailJS Service ID (from the Integration page)
    serviceId: 'YOUR_SERVICE_ID',

    // Your EmailJS Template ID (from the Email Templates page)
    templateId: 'YOUR_TEMPLATE_ID',

    // Your EmailJS Public Key (from the Integration page)
    publicKey: 'YOUR_PUBLIC_KEY'
};

// Template variables that will be used in your EmailJS template:
// {{from_name}} - Sender's name
// {{from_email}} - Sender's email
// {{subject}} - Email subject
// {{message}} - Email message
// {{to_email}} - Your email (gadingadityaperdana@gmail.com)
// {{reply_to}} - Sender's email for replies

// Example EmailJS template content:
/*
Subject: {{subject}}

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
This message was sent from your portfolio contact form.
Reply to: {{reply_to}}
*/