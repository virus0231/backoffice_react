# User Operation Guide

This guide provides step-by-step instructions for using the Nonprofit Fundraising Analytics Dashboard. It covers all major features and workflows for the three primary user personas.

## 🎯 User Personas Quick Reference

**Strategic Sarah (Development Director)**
- Focus: Executive summary + detailed drill-down for board reporting
- Primary Features: Revenue overview, comparison periods, export functionality

**Detail-Oriented David (Fundraising Analyst)**
- Focus: Comprehensive filtering + export for stakeholder reporting
- Primary Features: Universal filtering, data tables, detailed analytics

**Action-Oriented Amy (Campaign Coordinator)**
- Focus: Real-time campaign monitoring + operational decisions
- Primary Features: Campaign performance, donor acquisition, trend indicators

## 🔐 Getting Started

### Initial Login
1. Navigate to the dashboard URL
2. Click "Sign In" or go to `/auth/signin`
3. Enter your assigned username and password
4. Click "Sign in" to access the dashboard

### Dashboard Overview
Upon login, you'll see:
- **Side Navigation**: Access to all chart sections
- **Universal Filter Bar**: Date, campaign, fund, and frequency filters
- **Main Content Area**: Currently selected analytics view

## 🎛️ Universal Filtering System

The universal filter system affects all charts simultaneously and includes:

### Date Range Selection
- **Preset Options**: Today, Yesterday, Last 7/14/30 days, This week/month/year
- **Custom Range**: Click date fields to select specific start and end dates
- **Validation**: System prevents invalid date ranges (end before start)

### Campaign Filtering (Appeals)
- **Dropdown Selection**: Shows all available campaigns from your database
- **Cascading Logic**: Fund options update based on selected campaign
- **Multiple Selection**: Choose specific campaigns or "All"

### Fund Filtering
- **Dynamic Updates**: Options change based on selected campaigns
- **Hierarchical Organization**: Funds grouped by campaign relationships
- **Clear Selection**: Reset to "All Funds" anytime

### Frequency Filtering
- **All Donations**: Shows complete donation activity
- **One-time**: Single donations only
- **Recurring**: All recurring donation patterns
- **First Installments**: Initial recurring donations only
- **Next Installments**: Subsequent recurring payments

### Filter Tips
- **Smart Defaults**: Filters remember your preferences
- **Real-time Updates**: Charts update immediately when filters change
- **Loading Indicators**: Visual feedback during data refresh
- **Error Handling**: Clear messages for invalid filter combinations

## 📊 Chart Navigation & Features

### Revenue Overview Section

**Total Raised Chart**
- Shows cumulative revenue over selected time period
- Displays total amount (e.g., £23,931.59) and donation count (e.g., 435 donations)
- Area chart with gradient fill for visual impact
- Daily/Weekly view toggle for different granularity

**First Installments Chart**
- Tracks new recurring donation sign-ups
- Shows both amount and count of first installments
- Critical for measuring recurring donor acquisition
- Separate time-series visualization

**One-time Donations Chart**
- Analyzes single donation patterns
- Displays total amount and transaction count
- Helps identify campaign spikes and seasonal trends
- Consistent styling with other revenue charts

### Operational Analytics

**Donations Count Analytics**
- Line chart showing donation volume trends
- Filter by frequency type for specific insights
- Export functionality for detailed analysis
- Comparison overlay for period-over-period analysis

**Donor Retention Analytics**
- Retention rate calculations and visualizations
- Cohort analysis showing donor behavior patterns
- Critical for understanding donor lifecycle
- Trend indicators for retention improvement

**First-Time Donors Acquisition**
- New donor acquisition tracking
- Spike detection for campaign effectiveness
- Growth trend analysis
- Integration with campaign performance data

### Campaign Intelligence

**Campaign Performance Analytics**
- Multi-line chart comparing campaign effectiveness
- Revenue and donor acquisition metrics per campaign
- Time-based performance tracking
- ROI and efficiency indicators

**Traffic Source Analytics**
- Attribution analysis for donation sources
- Multi-channel performance comparison
- Simplified implementation focusing on core channels
- Integration with campaign data for full attribution

## 🔄 Comparison Period System

### Enabling Comparisons
1. Click "Add Comparison" toggle on any chart
2. Select comparison date range (different from main filter)
3. System validates no overlap between periods
4. Charts display dual-line visualization

### Comparison Features
- **Percentage Change Indicators**: Green/red indicators showing growth/decline
- **Dual-line Charts**: Current period vs. comparison period
- **Smart Validation**: Prevents overlapping date selections
- **Export Integration**: Comparison data included in exports

### Use Cases
- **Year-over-Year**: Compare same period previous year
- **Campaign Analysis**: Before/during/after campaign performance
- **Seasonal Trends**: Month-to-month or quarter-to-quarter analysis
- **Growth Tracking**: Progressive performance measurement

## 📤 Export Functionality

### Chart Exports
- **PNG/SVG**: High-quality chart images for presentations
- **CSV Data**: Raw data behind charts for further analysis
- **Filtered Results**: Exports respect current filter selections
- **Comparison Data**: Includes comparison period when active

### Export Process
1. Navigate to desired chart
2. Apply appropriate filters
3. Click "Export" button
4. Select format (PNG, SVG, or CSV)
5. Download begins automatically

### Export Tips
- **Naming Convention**: Files include date range and chart type
- **Metadata**: CSV exports include filter settings and generation timestamp
- **Presentation Ready**: PNG exports optimized for slide presentations
- **Data Integrity**: CSV exports maintain full decimal precision

## 🎯 Workflow Examples

### Strategic Sarah's Board Preparation Workflow
1. **Weekly Executive Review**:
   - Select "Last 7 days" filter
   - Review Total Raised overview
   - Check First Installments for growth trends
   - Export key charts as PNG for board slides

2. **Monthly Performance Analysis**:
   - Set "This month" filter
   - Enable comparison with "Last month"
   - Review percentage changes across all metrics
   - Export comparative data as CSV for detailed analysis

### Detail-Oriented David's Analysis Workflow
1. **Campaign Effectiveness Analysis**:
   - Filter by specific campaign
   - Review all operational analytics
   - Check traffic source attribution
   - Export comprehensive dataset for stakeholder report

2. **Donor Segmentation Study**:
   - Use frequency filters (one-time vs. recurring)
   - Analyze retention patterns
   - Export donor acquisition data
   - Cross-reference with campaign performance

### Action-Oriented Amy's Daily Operations
1. **Morning Performance Check**:
   - Select "Yesterday" filter
   - Quick scan of donation counts
   - Check campaign performance indicators
   - Note any unusual spikes or drops

2. **Campaign Monitoring**:
   - Filter by active campaigns
   - Monitor real-time donation flow
   - Compare with previous campaign periods
   - Identify actionable optimization opportunities

## 🔧 Troubleshooting & Tips

### Performance Optimization
- **Filter Gradually**: Apply one filter at a time for best performance
- **Use Presets**: Date presets load faster than custom ranges
- **Refresh Data**: Use browser refresh if charts seem stale
- **Clear Cache**: Clear browser cache if experiencing issues

### Data Accuracy
- **Time Zones**: All data displays in your local time zone
- **Real-time Updates**: Data refreshes every few minutes
- **Validation**: Charts show data validation indicators
- **Missing Data**: System indicates when data is incomplete

### Common Issues
**Slow Loading**: Check internet connection and try fewer concurrent filters
**Login Problems**: Verify username/password, contact admin for resets
**Export Failures**: Ensure browser allows downloads, try different format
**Chart Errors**: Refresh page, check filter combinations for validity

### Keyboard Shortcuts
- **Tab Navigation**: Use Tab key to navigate between filter elements
- **Enter**: Apply filter changes
- **Escape**: Cancel filter modifications
- **Space**: Toggle comparison mode on focused chart

## 📞 Getting Help

### Self-Service Resources
- **Tooltips**: Hover over any chart element for explanations
- **Filter Help**: Click "?" icons next to filter options
- **Data Validation**: Charts show warnings for incomplete data
- **Performance Tips**: Built-in suggestions for optimization

### Support Contacts
- **Technical Issues**: Contact your system administrator
- **Data Questions**: Verify with your database administrator
- **Feature Requests**: Document feedback for future enhancements
- **Training Needs**: Schedule team training sessions as needed

## 🔄 Regular Maintenance

### Weekly Tasks
- **Data Validation**: Spot-check key metrics against known results
- **Performance Review**: Note any slow-loading charts or timeouts
- **Filter Testing**: Verify all filter combinations work correctly
- **Export Testing**: Ensure export functionality works across all charts

### Monthly Tasks
- **Comprehensive Review**: Test all chart types and features
- **User Feedback**: Collect feedback from all team members
- **Performance Monitoring**: Document any performance degradation
- **Feature Utilization**: Track which features are most/least used

This guide covers all essential operations for effective dashboard usage. For technical details, refer to the [Architecture Documentation](architecture/), and for setup issues, see the [User Responsibilities Guide](architecture/user-responsibilities.md).