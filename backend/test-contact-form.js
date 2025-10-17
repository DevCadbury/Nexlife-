// Test script for contact form with country code and PDF attachment
// Run with: node backend/test-contact-form.js

import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/api';

const testCases = [
  {
    name: 'Test Indian Customer',
    data: {
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+919876543210',
      countryCode: '+91',
      subject: 'Product Inquiry - Analgesics',
      productName: 'Analgesic Products',
      message: 'I am interested in your analgesic product line. Please send me more information about pricing and minimum order quantities.'
    }
  },
  {
    name: 'Test US Customer',
    data: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+15551234567',
      countryCode: '+1',
      subject: 'Bulk Order Inquiry',
      productName: 'Antibiotic Products',
      message: 'Looking to place a bulk order for antibiotics. Need catalogue and wholesale pricing.'
    }
  },
  {
    name: 'Test UAE Customer',
    data: {
      name: 'Ahmed Al-Mansouri',
      email: 'ahmed@example.ae',
      phone: '+971501234567',
      countryCode: '+971',
      subject: 'Distribution Partnership',
      productName: 'All Products',
      message: 'Interested in becoming a distributor for Nexlife products in UAE. Please share partnership details.'
    }
  }
];

async function testContactForm(testCase) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🧪 ${testCase.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  try {
    console.log(`\n📤 Sending request to ${API_URL}/contact`);
    console.log(`📧 Email: ${testCase.data.email}`);
    console.log(`📱 Phone: ${testCase.data.phone}`);
    
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.data),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`\n✅ SUCCESS!`);
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Confirmation Sent: ${result.confirmationSent ? 'Yes ✓' : 'No ✗'}`);
      console.log(`   Response: ${result.message}`);
      
      if (result.confirmationSent) {
        console.log(`\n📧 Customer should receive:`);
        console.log(`   - Confirmation email`);
        console.log(`   - PDF catalogue attachment`);
        console.log(`   - Contact details`);
      }
    } else {
      console.log(`\n❌ FAILED!`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.error}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    }
  } catch (error) {
    console.log(`\n💥 ERROR!`);
    console.log(`   ${error.message}`);
  }
}

async function runAllTests() {
  console.log(`\n╔════════════════════════════════════════════════╗`);
  console.log(`║   Contact Form Test Suite                     ║`);
  console.log(`║   Country Code + PDF Attachment Testing       ║`);
  console.log(`╚════════════════════════════════════════════════╝`);

  for (const testCase of testCases) {
    await testContactForm(testCase);
    // Wait 2 seconds between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ Test Suite Completed!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  console.log(`\n📋 Checklist:`);
  console.log(`   ☐ Check admin email for notifications`);
  console.log(`   ☐ Check customer emails for confirmations`);
  console.log(`   ☐ Verify PDF catalogue is attached`);
  console.log(`   ☐ Verify phone numbers formatted correctly`);
  console.log(`   ☐ Test on different browsers`);
  console.log(`   ☐ Test on mobile devices\n`);
}

// Run tests
runAllTests().catch(console.error);
