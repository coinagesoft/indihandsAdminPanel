# TODO: Proposal Response System

## Status: COMPLETED

### Changes Made:

### 1. Updated Email Content in lib/mailer.js
- Changed `sendProposalNotificationEmail` function to accept `companyName` parameter
- Updated email template to match user's requested format:
  - Subject: "Proposal Sent – Action Required"
  - New format with Proposal No, Date, Company, Grand Total Amount
  - Message asking user to login and approve

### 2. Updated Email API in app/api/proposals/email/[rfqid]/route.js
- Added company_name to the SQL query (LEFT JOIN with companies table)
- Updated the function call to pass companyName
- Added status update to "Sent" after email is sent successfully

### 3. Admin Proposal Page already supports "Sent" status
- Badge styling for "Sent" status (bg-info)
- Filter dropdown includes "Sent" option

## Flow:
1. Admin creates proposal (status = "Pending")
2. Admin sends proposal via email → status changes to "Sent"
3. Client receives email with proposal details
4. Client can login to review and respond (approve/decline) - To be implemented
