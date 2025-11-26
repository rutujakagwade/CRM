# CRM Pro - Complete Business Management System

A comprehensive CRM built with Next.js, TypeScript, MongoDB, Express.js, and shadcn/ui.

## Features

### Dashboard
- KPI cards showing total opportunities, won deals, lost deals, and forecast revenue
- Interactive pipeline funnel visualization
- Revenue breakdown by sector with pie chart
- Today's schedule with upcoming activities
- Follow-ups and latest opportunities
- Expenses summary

### Contacts Management
- Full CRUD operations for contacts
- Search and filter functionality
- Contact details with company association
- Avatar support
- Table view with sorting

### Companies Management
- Company profiles with industry, location, and website
- Link contacts to companies
- Card-based grid layout
- Search functionality

### Opportunities
- **Kanban Board View**: Drag-and-drop opportunities between stages
- **Table View**: Comprehensive list with filters
- Pipeline stages: Lead → Qualified → Proposal → Negotiation → Won/Lost
- Track amount, forecast, probability, and close dates
- Sector categorization
- Priority levels (Low, Medium, High)
- Competitor tracking
- Link to companies and contacts

### Calendar & Activities
- View all scheduled activities
- Activity types: Call, Email, Meeting, Visit
- Link activities to contacts, companies, and opportunities
- Status tracking (Scheduled, Completed, Cancelled)
- Day-by-day activity grouping

### Expenses Tracking
- Record business expenses
- Link expenses to opportunities
- Category-based organization
- Monthly expense visualization
- Total and average expense calculations

### Data Import
- Import contacts and companies from CSV files
- Import from JSON with structured data
- Download sample files
- Field mapping guidance
- Bulk data operations

### Settings
- User profile management
- Avatar, name, and email configuration
- Sector management for opportunities
- Activity type customization
- System preferences

## Technology Stack

- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Styling**: TailwindCSS, shadcn/ui components
- **State Management**: Zustand
- **Database**: MongoDB
- **Charts**: Recharts
- **Form Management**: React Hook Form
- **Date Utilities**: date-fns
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Backend

1. Navigate to the `backend` directory
2. Install backend dependencies: `npm install`
3. Set up MongoDB connection in `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/crm_db
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   ```
4. Start the backend server: `npm run dev`

### 3. Configure Frontend

Update `.env.local` with backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Database Schema

The MongoDB database includes the following collections:
- `companies` - Business organizations
- `contacts` - Individual contacts with company relationships
- `opportunities` - Sales pipeline with forecasting
- `activities` - Calendar events and tasks
- `expenses` - Financial tracking
- `settings` - User preferences and system configuration
- `users` - User authentication and profiles

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage Guide

### Getting Started

1. **Import Sample Data**: Navigate to Import Data page and upload CSV/JSON files
2. **Add Companies**: Create company profiles first
3. **Add Contacts**: Link contacts to their respective companies
4. **Create Opportunities**: Track deals through your sales pipeline
5. **Schedule Activities**: Plan meetings, calls, and follow-ups
6. **Track Expenses**: Record costs associated with opportunities

### Best Practices

- Always link contacts to companies for better relationship tracking
- Update opportunity probabilities as they progress through stages
- Use the Kanban view to quickly move opportunities between stages
- Schedule follow-up activities for each opportunity
- Regularly review the dashboard for pipeline insights

## Data Structure

### Opportunity Statuses
- **Lead**: Initial contact or inquiry
- **Qualified**: Prospect meets criteria
- **Proposal**: Formal proposal submitted
- **Negotiation**: Terms being discussed
- **Won**: Deal closed successfully
- **Lost**: Opportunity lost to competitor or no decision

### Priority Levels
- **Low**: Standard follow-up
- **Medium**: Important but not urgent
- **High**: Requires immediate attention

## Customization

### Adding Sectors
Navigate to Settings → Sector Management to add industry sectors for opportunity categorization.

### Activity Types
Customize activity types in Settings to match your business workflow (default: Call, Email, Meeting, Visit).

### Styling
The application uses TailwindCSS. Update `tailwind.config.ts` for theme customization.

## Database Schema

The MongoDB schema includes:
- Mongoose models with proper relationships
- Indexes on frequently queried fields
- Timestamp tracking (createdAt, updatedAt)
- Flexible schema for custom fields and metadata

## Development Notes

- All pages use 'use client' directive for client-side rendering
- State management via Zustand ensures consistent data across components
- RESTful API communication between frontend and backend
- Authentication handled via JWT tokens
- Export functionality available for data backup and migration

## Future Enhancements

- Email integration
- Document attachments
- Reporting and analytics
- Team collaboration features
- Mobile responsive improvements
- Real-time notifications
- Advanced filtering and search
- Custom fields per entity
- Workflow automation
- API integrations

## License

Built for demonstration purposes.
