#!/bin/bash

# n8n Workflow Setup - Quick Commands
# Run these commands in your terminal to create workflows via API

# Make sure the workflow service is running:
# npm run dev

# ============================================
# SETUP ALL WORKFLOWS AT ONCE
# ============================================
echo "Creating all workflows..."
curl -X POST http://localhost:3000/api/v1/setup/email-workflow \
  -H "Content-Type: application/json"

# ============================================
# OR CREATE INDIVIDUALLY
# ============================================

# 1. EMAIL WORKFLOW
echo "Creating email workflow..."
curl -X POST http://localhost:3000/api/v1/setup/email-workflow \
  -H "Content-Type: application/json"

# 2. WEBHOOK WORKFLOW
echo "Creating webhook workflow..."
curl -X POST http://localhost:3000/api/v1/setup/webhook-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "webhook-trigger"}'

# 3. SCHEDULED WORKFLOW
echo "Creating scheduled workflow..."
curl -X POST http://localhost:3000/api/v1/setup/scheduled-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "daily-job", "intervalMinutes": 1440}'

# ============================================
# TEST EMAIL SENDING
# ============================================
echo "Testing email sending..."
curl -X POST http://localhost:3000/api/v1/emails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email from the API"
  }'

# ============================================
# LIST ALL WORKFLOWS
# ============================================
echo "Listing all workflows..."
curl -X GET http://localhost:3000/api/v1/workflows \
  -H "Content-Type: application/json"

# ============================================
# HEALTH CHECK
# ============================================
echo "Health check..."
curl -X GET http://localhost:3000/health
