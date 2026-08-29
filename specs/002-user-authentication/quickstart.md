# Quickstart & Verification Guide: User Authentication & Access Control

**Feature**: 002-user-authentication  
**Status**: Ready for Implementation  
**Date**: 2026-08-29  

## Prerequisites & Environment Setup

1. **Required Packages**:
   ```bash
   npm install next-auth@^4.24.11 bcryptjs @types/bcryptjs
   ```
2. **Environment Variables** (in `.env.local` or `.env`):
   ```bash
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="aaw-garageflow-super-secret-jwt-key-change-in-prod"
   ```

## Seed Default Users

Run seed to populate default test accounts:
```bash
npm run seed
```
Default accounts created:
- Username: `admin` | Password: `Password123!` | Name: `Shop Administrator` (Role: `MANAGER`)
- Username: `tech1` | Password: `Password123!` | Name: `Alex Technician` (Role: `TECHNICIAN`)

## Verification Scenarios

### Scenario 1: Guest Interception (Harness & Manual)
1. Open a browser in private mode or make a request without cookies to `http://localhost:3000/work-orders`.
2. **Expected Outcome**: Request is intercepted and redirected to `http://localhost:3000/login?callbackUrl=%2Fwork-orders`.

### Scenario 2: Successful Login & Deep Link Redirection
1. On `http://localhost:3000/login?callbackUrl=%2Fwork-orders`, enter `admin` and `Password123!`.
2. Click **Sign In**.
3. **Expected Outcome**: User is authenticated, JWT session is established with 6-hour TTL, and browser navigates to `/work-orders`. Header displays `Shop Administrator` and a `Sign Out` button.

### Scenario 3: Failed Login
1. On `http://localhost:3000/login`, enter `admin` and `wrongpassword`.
2. Click **Sign In**.
3. **Expected Outcome**: Error prompt appears ("Invalid username or password"). User remains on `/login`.

### Scenario 4: Sign Out
1. Click **Sign Out** in the top navigation header.
2. **Expected Outcome**: Session cookie is cleared, user is redirected to `/login`. Trying to access `/` redirects back to `/login`.

### Scenario 5: Automated Test Suite & Harness Execution
Run automated verification suite:
```bash
npm run test:harness
```
