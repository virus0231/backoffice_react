# Nonprofit Fundraising Analytics Dashboard

A comprehensive fundraising analytics dashboard that transforms raw phpMySQL database data into actionable insights for nonprofit decision-making. Built with Next.js, this dashboard replicates the sophisticated FundraisUP analytics interface while maintaining complete data ownership and control.

## 🎯 Project Overview

**Goal**: Reduce data analysis time by 75% and eliminate manual reporting overhead by providing real-time fundraising insights through an intuitive web interface.

**Key Features**:
- 15+ interactive chart types with universal filtering
- Exact FundraisUP visual interface replication
- Real-time campaign performance tracking
- Donor retention and acquisition analytics
- Export capabilities for presentations and reports
- Mobile-responsive design with WCAG AA accessibility

## 🏗️ Architecture

- **Framework**: Next.js 14+ with App Router
- **Database**: phpMySQL with Sequelize ORM
- **Styling**: Tailwind CSS with custom FundraisUP theme
- **Charts**: Recharts for all visualizations
- **Authentication**: NextAuth.js with credentials provider
- **Hosting**: cPanel Node.js environment

## 📋 Prerequisites

- Node.js 18+ and npm
- Access to existing cPanel hosting environment
- phpMySQL database with required tables:
  - `pw_transactions` (donation data)
  - `pw_donors` (donor information)
  - `pw_appeal` (campaign data)
  - `pw_fundlist` (fund categories)

## 🚀 Quick Start

### 1. Environment Setup

Create `.env.local` file in the project root:

```bash
# Database Configuration
DB_HOST=your_cpanel_mysql_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_PORT=3306

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-admin-password

# Optional Team Members
USER1_USERNAME=dev.director
USER1_PASSWORD=secure-user1-password
USER2_USERNAME=fundraising.manager
USER2_PASSWORD=secure-user2-password
```

### 2. Installation

```bash
npm install
```

### 3. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 4. Production Build

```bash
npm run build
npm run start
```

## 📊 Dashboard Features

### Phase 1: Core Analytics (MVP)
- **Revenue Overview**: Total raised, first installments, one-time donations
- **Operational Analytics**: Donation counts, donor retention, new donor acquisition
- **Campaign Intelligence**: Campaign performance and traffic source analysis

### Phase 2: Advanced Analytics
- **Distribution Analytics**: Geographic and donation amount heatmaps
- **Attribution Analytics**: Multi-channel attribution and device analytics
- **Strategic Segmentation**: Donor demographics and lifetime value analysis

## 🔐 Authentication

The dashboard uses simple credentials-based authentication suitable for internal team access:

- **Admin Access**: Use ADMIN_USERNAME and ADMIN_PASSWORD from environment variables
- **Team Access**: Additional users can be configured via USER1_USERNAME, USER2_USERNAME, etc.
- **Login URL**: `/auth/signin`

## 📁 Project Structure

```
insights/
├── docs/                          # Comprehensive project documentation
│   ├── architecture/              # Technical architecture docs
│   ├── prd/                      # Product requirements (sharded)
│   └── stories/                  # User stories for development
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Authenticated dashboard pages
│   │   ├── api/                  # API routes
│   │   └── auth/                 # Authentication pages
│   ├── components/               # React components
│   │   ├── charts/               # Chart components
│   │   ├── filters/              # Filter system
│   │   └── layout/               # Layout components
│   ├── lib/                      # Utilities and configurations
│   │   ├── database/             # Database models and connection
│   │   ├── services/             # Business logic services
│   │   └── auth/                 # Authentication configuration
│   └── types/                    # TypeScript definitions
├── .env.local                    # Environment variables (create this)
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## 🛠️ Development Workflow

### Database Integration
The project uses a query collaboration process:
1. Development agent identifies required data fields
2. User provides base SQL queries from existing phpMySQL database
3. Agent optimizes queries with Sequelize ORM and universal filtering
4. User validates data accuracy and performance

### Feature Development Sequence
1. **Epic 1**: Foundation & Core Infrastructure
2. **Epic 2**: Operational Analytics Charts
3. **Epic 3**: Campaign Intelligence
4. **Epic 4-6**: Advanced Analytics (Phase 2)

### Code Quality
- ESLint and Prettier for code consistency
- TypeScript strict mode for type safety
- Jest + React Testing Library for component testing
- Playwright for end-to-end testing

## 📈 Performance Targets

- **Load Time**: Sub-3-second initial page load
- **Analysis Time Reduction**: 75% faster than manual reporting
- **Stakeholder Adoption**: 100% adoption within 3 months
- **User Satisfaction**: 4.5/5 rating in feedback surveys

## 🚀 Deployment

### cPanel Deployment
1. Build the production version: `npm run build`
2. Upload built files to cPanel Node.js application directory
3. Configure environment variables in cPanel
4. Enable Node.js application in cPanel
5. Test database connectivity and authentication

Detailed deployment instructions: [docs/architecture/user-responsibilities.md](docs/architecture/user-responsibilities.md)

## 📚 Documentation

- **[Architecture Documentation](docs/architecture/)**: Complete technical specifications
- **[Product Requirements](docs/prd/)**: Detailed feature requirements and epics
- **[User Stories](docs/stories/)**: Development-ready user stories
- **[API Specification](docs/architecture/api-specification.md)**: Complete API documentation
- **[User Responsibilities](docs/architecture/user-responsibilities.md)**: Setup and deployment guide

## 🤝 Contributing

### Development Process
1. Follow coding standards in [docs/architecture/coding-standards.md](docs/architecture/coding-standards.md)
2. Use the query collaboration process for database integration
3. Maintain WCAG AA accessibility standards
4. Test across all target user personas

### Quality Gates
- All TypeScript errors resolved
- ESLint and Prettier compliance
- Component tests passing
- API endpoint validation
- Performance targets met

## 🐛 Troubleshooting

### Database Connection Issues
- Verify credentials in `.env.local`
- Test database access via cPanel phpMyAdmin
- Confirm required tables exist and are accessible

### Authentication Problems
- Check username/password in environment variables
- Verify NEXTAUTH_SECRET is at least 32 characters
- Test login with exact credentials from `.env.local`

### Performance Issues
- Check database query performance
- Monitor connection pool utilization
- Verify caching is working correctly

## 📞 Support

For technical issues or questions about the dashboard implementation, refer to:
- [Technical Architecture Documentation](docs/architecture/)
- [User Responsibilities Guide](docs/architecture/user-responsibilities.md)
- [Debugging Guide](.ai/debug-log.md)

## 📄 License

This project is proprietary software developed specifically for nonprofit fundraising analytics.

---

**Built with Next.js 14+ | Powered by Recharts | Deployed on cPanel**