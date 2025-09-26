# Requirements

## Functional Requirements

**FR1:** The system shall provide a universal date filter system with dropdown options including All, Today, Yesterday, Last 7/14/30 days, This week/month/year
**FR2:** The system shall implement cascading filter logic where Appeals dropdown populates available campaigns, and Funds dropdown updates dynamically based on selected appeals
**FR3:** The system shall include a Frequency filter with options: All donations, One-time, Recurring, Recurring (first installments), Recurring (next installments)
**FR4:** The system shall provide individual chart comparison controls with calendar picker that excludes currently selected main date range
**FR5:** The system shall implement smart date validation preventing overlapping date selections between main filter and comparison periods
**FR6:** The system shall display dual-line chart visualization showing current and comparison periods with percentage change indicators
**FR7:** The system shall provide the primary "Raised" chart showing total revenue with area-fill time-series visualization including:
- Total raised amount display (e.g., £23,931.59)
- Total donations count (e.g., 435 donations)
- Date range selector with comparison toggle
- Daily/Weekly view toggle controls
- Area chart with gradient fill and trend line
**FR8:** The system shall display "First Installments" section showing recurring donation initiation analytics including:
- Total first installment amount (e.g., £1,041.14)
- Number of new recurring donors (e.g., 34 installments)
- Dedicated time-series chart for first-time recurring donations
- Same date range and comparison functionality as main chart
**FR9:** The system shall provide "One-time donations" section showing single donation analytics including:
- Total one-time donation amount (e.g., £16,691.65)
- Count of one-time donations (e.g., 173 donations)
- Separate time-series visualization for one-time giving patterns
- Consistent styling and comparison overlay capabilities
**FR10:** The system shall display Donations Count analytics with time-series chart showing donation count trends with comparison overlay
**FR11:** The system shall generate Donor Retention analytics with time-series visualization showing repeat donor patterns and retention rates over time
**FR12:** The system shall provide First Time Donors tracking with trend analysis and comparison capabilities
**FR13:** The system shall display Recurring Revenue analytics showing subscription and recurring donation patterns with MRR calculations
**FR14:** The system shall generate Donation Amount Distribution heatmap showing donation size patterns across time periods and ranges
**FR15:** The system shall provide Geographic Analytics with interactive state/region heatmap visualization showing donation distribution by location
**FR16:** The system shall display Traffic Source Analytics with multi-line chart showing donation attribution across different channels (direct, social, email, etc.)
**FR17:** The system shall generate Campaign Performance tracking with multi-line visualization comparing effectiveness of different campaigns/appeals
**FR18:** The system shall provide Device Analytics showing donation patterns across desktop, mobile, and tablet platforms
**FR19:** The system shall display Payment Method Analytics tracking donation methods (credit card, bank transfer, PayPal, etc.) with trend analysis
**FR20:** The system shall implement comprehensive donor segmentation analytics with demographic and behavioral visualizations
**FR21:** The system shall provide donor lifetime value tracking with cohort analysis and predictive indicators
**FR22:** The system shall display comprehensive data tables beneath each chart showing detailed metrics with sortable columns
**FR23:** The system shall provide data export functionality for all visualizations including comparison data in CSV, Excel formats
**FR24:** The system shall connect directly to existing phpMySQL database without requiring data migration or schema modifications

## Non-Functional Requirements

**NFR1:** Dashboard load times must be under 3 seconds for all visualizations and maintain 99.5% uptime
**NFR2:** The system shall achieve 100% visual and functional replication of the FundraisUP interface reference design
**NFR3:** The system shall handle complex analytical queries on production database without impacting operational systems performance
**NFR4:** The system shall be fully responsive across desktop browsers (Chrome, Firefox, Safari, Edge) with ES6+ support
**NFR5:** The system shall maintain 100% data accuracy consistency between dashboard metrics and source database queries
**NFR6:** The system shall support concurrent usage by multiple users without performance degradation
**NFR7:** The system shall implement optimized database connection pooling for handling multiple simultaneous chart data requests
