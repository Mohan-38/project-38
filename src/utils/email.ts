// Brevo Email Service Integration
// Brevo (formerly Sendinblue) configuration for transactional emails with attachments

// Configuration
const CONFIG = {
  brevo: {
    apiUrl: 'https://api.brevo.com/v3/smtp/email',
    // You'll need to set this in your environment variables
    apiKey: import.meta.env.VITE_BREVO_API_KEY || '',
    // Use your validated sender email - THIS MUST BE VALIDATED IN BREVO
    senderEmail: 'mohanselenophile@gmail.com', // Your validated email
    senderName: 'Tech Creator'
  },
  emailjs: {
    serviceId: 'service_qj44izj',
    publicKey: 'aImlP6dotqO-E3y6h',
    templates: {
      contact: 'template_k92zaj2',
      order: 'purchase_confirmation',
      documentDelivery: 'template_document_delivery' // Add this template
    }
  },
  developerEmail: 'mohanselenophile@gmail.com'
};

// Type Definitions
interface ContactFormData {
  from_name: string;
  from_email: string;
  project_type: string;
  budget: string;
  message: string;
}

interface OrderConfirmationData {
  project_title: string;
  customer_name: string;
  price: string;
  download_instructions?: string;
  support_email?: string;
  order_id?: string;
}

interface DocumentDeliveryData {
  project_title: string;
  customer_name: string;
  customer_email: string;
  order_id: string;
  documents: Array<{
    name: string;
    url: string;
    category: string;
    review_stage: string;
    size?: number;
  }>;
  access_expires?: string;
}

interface BrevoEmailData {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachment?: Array<{
    name: string;
    content: string; // Base64 encoded content
    url?: string; // Alternative to content for URL-based attachments
  }>;
  tags?: string[];
}

// Utility Functions
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    datetime: now.toISOString()
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Brevo API Service
const sendBrevoEmail = async (emailData: BrevoEmailData): Promise<void> => {
  if (!CONFIG.brevo.apiKey) {
    console.warn('Brevo API key is not configured. Falling back to EmailJS.');
    throw new Error('Brevo not configured');
  }

  try {
    const response = await fetch(CONFIG.brevo.apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': CONFIG.brevo.apiKey
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific sender validation error
      if (response.status === 400 && errorData.message?.includes('sender')) {
        console.error('Brevo sender validation error. Email not validated in Brevo account.');
        console.error('Please validate your sender email in Brevo dashboard: https://app.brevo.com/senders/list');
        throw new Error('Sender validation failed - email not validated in Brevo');
      }
      
      throw new Error(`Brevo API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Brevo:', result);
  } catch (error) {
    console.error('Brevo email sending failed:', error);
    throw error;
  }
};

// EmailJS fallback for document delivery
const sendEmailJSDocumentDelivery = async (data: DocumentDeliveryData): Promise<void> => {
  try {
    const emailjs = await import('@emailjs/browser');
    
    // Group documents by review stage
    const documentsByStage = {
      review_1: data.documents.filter(doc => doc.review_stage === 'review_1'),
      review_2: data.documents.filter(doc => doc.review_stage === 'review_2'),
      review_3: data.documents.filter(doc => doc.review_stage === 'review_3')
    };

    const stageLabels = {
      review_1: 'Review 1 - Initial Project Review',
      review_2: 'Review 2 - Mid-Project Assessment', 
      review_3: 'Review 3 - Final Review & Completion'
    };

    // Create document list text
    const documentListText = Object.entries(documentsByStage)
      .filter(([_, docs]) => docs.length > 0)
      .map(([stage, docs]) => {
        const stageLabel = stageLabels[stage as keyof typeof stageLabels];
        const docList = docs.map(doc => `• ${doc.name} (${doc.category}) - ${doc.url}`).join('\n');
        return `${stageLabel}:\n${docList}`;
      }).join('\n\n');

    const { date } = getCurrentDateTime();

    await emailjs.send(
      CONFIG.emailjs.serviceId,
      'template_document_delivery', // You'll need to create this template
      {
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        project_title: data.project_title,
        order_id: data.order_id,
        total_documents: data.documents.length,
        document_list: documentListText,
        delivery_date: date,
        access_expires: data.access_expires || 'Lifetime access',
        support_email: CONFIG.developerEmail
      },
      CONFIG.emailjs.publicKey
    );

    console.log('Document delivery email sent via EmailJS');
  } catch (error) {
    console.error('EmailJS document delivery failed:', error);
    throw error;
  }
};

// Email Services
export const sendContactForm = async (data: ContactFormData): Promise<void> => {
  if (!validateEmail(data.from_email)) {
    throw new Error('Invalid sender email address');
  }

  const { date, time } = getCurrentDateTime();

  try {
    const emailjs = await import('@emailjs/browser');
    
    await emailjs.send(
      CONFIG.emailjs.serviceId,
      CONFIG.emailjs.templates.contact,
      {
        name: data.from_name,
        email: data.from_email,
        project_type: data.project_type,
        budget: data.budget,
        message: data.message,
        current_date: date,
        current_time: time,
        title: `New inquiry from ${data.from_name}`,
        to_email: CONFIG.developerEmail,
        reply_to: data.from_email
      },
      CONFIG.emailjs.publicKey
    );
  } catch (error) {
    console.error('Contact form email failed:', error);
    throw new Error('Failed to send your message. Please try again later.');
  }
};

export const sendOrderConfirmation = async (
  data: OrderConfirmationData,
  recipientEmail: string
): Promise<void> => {
  if (!validateEmail(recipientEmail)) {
    throw new Error('Invalid recipient email address');
  }

  const { date } = getCurrentDateTime();

  // Always use EmailJS for order confirmation to avoid sender validation issues
  try {
    const emailjs = await import('@emailjs/browser');
    
    await emailjs.send(
      CONFIG.emailjs.serviceId,
      CONFIG.emailjs.templates.order,
      {
        customer_name: data.customer_name,
        customer_email: recipientEmail,
        project_title: data.project_title,
        price: data.price,
        order_id: data.order_id,
        order_date: date,
        download_instructions: data.download_instructions || generateDownloadInstructions(data.project_title, data.order_id || ''),
        support_email: CONFIG.developerEmail
      },
      CONFIG.emailjs.publicKey
    );

    console.log('Order confirmation email sent via EmailJS');
  } catch (error) {
    console.error('Order confirmation failed:', error);
    // Don't throw error for order confirmation - order should still complete
    console.log('Order completed successfully, but email notification failed.');
  }
};

export const sendDocumentDelivery = async (data: DocumentDeliveryData): Promise<void> => {
  if (!validateEmail(data.customer_email)) {
    throw new Error('Invalid recipient email address');
  }

  console.log('Attempting to send document delivery email...');
  console.log('Documents to deliver:', data.documents.length);

  // Use EmailJS directly to avoid sender validation issues
  try {
    await sendEmailJSDocumentDelivery(data);
    console.log('Document delivery email sent successfully via EmailJS');
  } catch (emailjsError) {
    console.error('EmailJS failed for document delivery');
    console.error('EmailJS error:', emailjsError);
    
    // As a last resort, send a simple notification
    await sendSimpleDocumentNotification(data);
  }
};

// Simple notification as last resort
const sendSimpleDocumentNotification = async (data: DocumentDeliveryData): Promise<void> => {
  try {
    const emailjs = await import('@emailjs/browser');
    
    const documentList = data.documents.map(doc => 
      `${doc.name} (${doc.category}) - ${doc.url}`
    ).join('\n');

    await emailjs.send(
      CONFIG.emailjs.serviceId,
      CONFIG.emailjs.templates.contact, // Use contact template as fallback
      {
        name: 'TechCreator Support',
        email: CONFIG.developerEmail,
        project_type: 'Document Delivery',
        budget: 'N/A',
        message: `Document delivery for ${data.customer_name} (${data.customer_email})\n\nOrder: ${data.order_id}\nProject: ${data.project_title}\n\nDocuments:\n${documentList}`,
        to_email: data.customer_email,
        reply_to: CONFIG.developerEmail
      },
      CONFIG.emailjs.publicKey
    );
  } catch (error) {
    console.error('Even simple notification failed:', error);
    throw new Error('All email delivery methods failed');
  }
};

// Generate download instructions for order confirmation
export const generateDownloadInstructions = (projectTitle: string, orderId: string): string => {
  return `
Thank you for purchasing "${projectTitle}"!

Your Order ID: ${orderId}

What happens next:
1. You will receive a separate email within 5 minutes containing download links for all project documents
2. Documents are organized by review stages (Review 1, 2, and 3)
3. Each document includes presentations, documentation, and reports as applicable
4. You'll have lifetime access to download these documents

The document delivery email will include:
• Direct download links for all files
• Documents grouped by review stage
• File size information
• Technical specifications
• Implementation guides

If you have any questions or need support, please contact us at ${CONFIG.developerEmail}

Thank you for your business!
  `.trim();
};

// Test function for development
export const testDocumentDelivery = async () => {
  const testData: DocumentDeliveryData = {
    project_title: 'Test Project',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    order_id: 'TEST123',
    documents: [
      {
        name: 'Test Document.pdf',
        url: 'https://example.com/test.pdf',
        category: 'document',
        review_stage: 'review_1',
        size: 1024000
      }
    ]
  };

  try {
    await sendDocumentDelivery(testData);
    console.log('Test document delivery sent successfully');
  } catch (error) {
    console.error('Test document delivery failed:', error);
  }
};

// Setup instructions for Brevo
export const getBrevoSetupInstructions = (): string => {
  return `
BREVO EMAIL SETUP INSTRUCTIONS:

⚠️  CRITICAL: You must validate your sender email in Brevo before using it!

1. Create Brevo Account:
   - Go to https://app.brevo.com/
   - Sign up for a free account

2. Validate Sender Email (REQUIRED):
   - Go to https://app.brevo.com/senders/list
   - Click "Add a sender"
   - Add your email (${CONFIG.brevo.senderEmail})
   - Check your email for verification link
   - Click the verification link to validate your sender

3. Get API Key:
   - Go to https://app.brevo.com/settings/keys/api
   - Create a new API key
   - Add it to your .env file as VITE_BREVO_API_KEY

4. Test Email Delivery:
   - Use the test function in the email utils
   - Check Brevo dashboard for delivery statistics

Current Configuration:
- Sender Email: ${CONFIG.brevo.senderEmail} ${CONFIG.brevo.senderEmail ? '⚠️  NEEDS VALIDATION' : '❌ Not configured'}
- Sender Name: ${CONFIG.brevo.senderName}
- API Key: ${CONFIG.brevo.apiKey ? '✅ Configured' : '❌ Not configured'}

IMPORTANT: Until you validate your sender email, all emails will be sent via EmailJS fallback.
  `;
};

// Check if Brevo is properly configured
export const checkBrevoConfiguration = (): {
  configured: boolean;
  issues: string[];
  instructions: string;
} => {
  const issues: string[] = [];
  
  if (!CONFIG.brevo.apiKey) {
    issues.push('Brevo API key is not configured');
  }
  
  if (!CONFIG.brevo.senderEmail) {
    issues.push('Sender email is not configured');
  }
  
  // Note: We can't programmatically check if the sender is validated
  if (CONFIG.brevo.senderEmail) {
    issues.push('Sender email needs to be validated in Brevo dashboard');
  }
  
  return {
    configured: issues.length === 1, // Only the validation issue remains
    issues,
    instructions: getBrevoSetupInstructions()
  };
};