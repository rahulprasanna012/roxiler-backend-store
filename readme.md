
Store Rating API - Postman Test Collection
Overview
This Postman collection provides complete testing for a Store Rating system with three user roles: System Administrator, Normal User, and Store Owner. The collection includes all necessary requests to test the full functionality of each role.

Features Tested
System Administrator
✅ Create stores, normal users, and admin users
✅ Access admin dashboard with statistics
✅ View and filter user/store listings
✅ Manage user details

Normal User
✅ User registration and login
✅ Password updates
✅ Store browsing and searching
✅ Rating submission and modification

Store Owner
✅ Store owner login
✅ Password management
✅ Dashboard with ratings and analytics

Setup Instructions
Import the Collection:

Download the JSON file

In Postman, click "Import" and select the file

Configure Environment:

Create a new environment

Set these variables:

base_url: Your API endpoint (e.g., http://localhost:5000)

admin_email: Admin account email

admin_password: Admin account password

Run Tests:

Execute requests in order (they're organized sequentially)

Environment variables will auto-populate as tests run

Test Flow
1. Admin Setup
Admin login

Create store owner account

Create test store

Create test customers

2. Store Owner Tests
Owner login

View dashboard

Change password

Verify data

3. Normal User Tests
User registration

Store browsing

Rating submission

Profile updates