# TODO - Fix Duplicate Entry Error for Companies API

## Issue
POST /api/companies throws "Duplicate entry 'ADC' for key 'uniq_short_name'" error when attempting to create a company with an existing short_name.

## Root Cause
Race condition between duplicate check (SELECT) and INSERT - two concurrent requests can both pass the check but only one succeeds in INSERT.

## Plan
- [x] Analyze the error and understand the codebase
- [x] Fix app/api/companies/route.js to catch ER_DUP_ENTRY error (errno 1062) and return proper 400 respo
