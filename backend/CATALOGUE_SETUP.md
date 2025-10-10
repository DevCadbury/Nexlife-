# Product Catalogue Setup

## Catalogue PDF File

To enable automatic catalogue attachments in confirmation emails, place your product catalogue PDF file at:

```
backend/public/catalogue.pdf
```

## Requirements

- File name: `catalogue.pdf`
- Location: `backend/public/` directory
- Format: PDF
- Recommended size: Under 10MB for email attachments

## What should the catalogue include?

- Company introduction and overview
- Complete product listings with descriptions
- Pricing information (if applicable)
- Product specifications and usage instructions
- Quality certifications and compliance information
- Contact details and ordering information
- Terms and conditions

## Email Integration

When a customer submits an inquiry through the contact form:

1. Their inquiry is saved to the database
2. An admin notification is sent to the team
3. A confirmation email is sent to the customer with:
   - Inquiry details and confirmation
   - Link to download the catalogue
   - Catalogue PDF as an attachment (if file exists)
   - Contact information for follow-up

## Testing

After placing the catalogue PDF:

1. Test the contact form submission
2. Check that confirmation emails are sent
3. Verify the PDF attachment is included
4. Test the download link in the email

## Notes

- If no catalogue PDF exists, the confirmation email will still be sent but without the attachment
- The download link in the email will point to `/catalogue.pdf` on your website
- Make sure the PDF is optimized for email attachments (reasonable file size)