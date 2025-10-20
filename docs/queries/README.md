# API SQL Queries Optimization Guide

This document lists all SQL queries currently used by the PHP API (excluding the Retention endpoint). Edit this file with your optimized versions and notes; once you’re done, I’ll update the code to use your changes and keep behavior consistent.

Important constraints
- Do not change response shapes. Frontend expects current field names and types.
- Keep filter semantics identical:
  - Status: include `t.status IN ('Completed','pending')` where present.
  - Date windows: inclusive of start; end is typically `< DATE_ADD(endDate, INTERVAL 1 DAY)` or `<= :end_dt_incl` for full-day inclusivity.
  - Filters are applied via `EXISTS (...)` using `pw_transaction_details` join to `pw_appeal` and `pw_fundlist` (consistent across endpoints).
- Prefer bind params; if literals are used (for complex CTEs) they must be safely quoted.
- Performance targets: minimize full scans; consider covering indexes and replacing recursive CTEs with calendar/number tables if faster.

How to propose changes
For each query below, add an “Optimized SQL” block and optional “Indexes/Notes”. I will then wire them in.

Template
- Endpoint: <file:line>
- Metric/Variant: <name>
- Current SQL:
  ```sql
  -- (listed below)
  ```
- Optimized SQL (fill in):
  ```sql
  -- your version here
  ```
- Indexes/Notes:
  - e.g., `pw_transactions (status, date)`; `pw_transaction_details (TID, appeal_id, fundlist_id, freq)`
  - behavioral notes, deviations, or MySQL version requirements

---

## Analytics (php-api/analytics.php:1)

Params
- `kind`: `total-raised` | `first-installments` | `one-time-donations`
- `startDate`, `endDate` (YYYY-MM-DD)
- `granularity`: `daily` | `weekly`
- Filters: `appealId`, `fundId` (comma-separated)
- Frequency override via `frequency` param

Base WHERE (shared)
```sql
WHERE t.status IN ('Completed','pending')
  AND t.date >= :start_dt
  AND t.date <= :end_dt_incl
  ${freqCondMain}
  AND EXISTS (
    SELECT 1
    FROM pw_transaction_details d
    JOIN pw_appeal a ON a.id = d.appeal_id
    JOIN pw_fundlist f ON f.id = d.fundlist_id
    WHERE d.TID = t.id
    ${filterClause}
    ${freqCondSubquery}
  )
```

Aggregate totals
```sql
SELECT
  SUM(t.totalamount) AS totalAmount,
  COUNT(DISTINCT t.id) AS donationCount
FROM pw_transactions t
${baseWhere}
```

Trend (weekly)
```sql
SELECT
  YEARWEEK(t.date, 3) AS week_num,
  DATE_FORMAT(MIN(t.date), '%Y-%u') AS period,
  MIN(DATE(t.date)) AS day,
  SUM(t.totalamount) AS amount,
  COUNT(DISTINCT t.id) AS count
FROM pw_transactions t
${baseWhere}
GROUP BY week_num
ORDER BY day ASC
```

Trend (daily)
```sql
SELECT
  DATE(t.date) AS day,
  SUM(t.totalamount) AS amount,
  COUNT(DISTINCT t.id) AS count
FROM pw_transactions t
${baseWhere}
GROUP BY DATE(t.date)
ORDER BY day ASC
```

Optimized SQL (fill in):
```sql
-- totals:

-- weekly:

-- daily:
```

Indexes/Notes:
- Suggested: `pw_transactions (status, date, id, totalamount)`, composite covering by date first.
- Ensure `pw_transaction_details (TID, appeal_id, fundlist_id, freq)`.

---

## Recurring Plans (php-api/recurring-plans.php:1)

Params: `metric` = `active-plans` | `new-plans` | `canceled-plans`; `startDate`, `endDate`, `granularity`.

Active plans (daily)
```sql
WITH RECURSIVE date_series AS (
  SELECT DATE(:start_date) AS d
  UNION ALL
  SELECT d + INTERVAL 1 DAY
  FROM date_series
  WHERE d < :end_date
),
all_schedules AS (
  SELECT s.startdate, s.nextrun_date, s.remainingcount, s.status
  FROM pw_schedule s
  LEFT JOIN pw_transaction_details
    ON s.td_id = pw_transaction_details.id
  WHERE ${appealFilter} AND ${fundFilter} AND (plan_id IS NOT NULL AND sub_id IS NOT NULL)
)
SELECT ds.d AS date, COUNT(*) AS active_plans
FROM date_series ds
JOIN all_schedules s
  ON s.status = 'ACTIVE' AND s.startdate <= ds.d
GROUP BY ds.d
ORDER BY ds.d
```

New plans (daily)
```sql
WITH RECURSIVE date_series AS (
  SELECT DATE(:start_date) AS d
  UNION ALL SELECT d + INTERVAL 1 DAY FROM date_series WHERE d < :end_date
),
filtered AS (
  SELECT s.startdate AS d, s.id
  FROM pw_schedule s
  JOIN pw_transaction_details td ON td.id = s.td_id
  WHERE s.status = 'ACTIVE' ${appealFilter} ${fundFilter}
)
SELECT ds.d AS `date`, COALESCE(COUNT(f.id), 0) AS new_plans
FROM date_series ds
LEFT JOIN filtered f ON f.d = ds.d
GROUP BY ds.d
ORDER BY ds.d
```

Canceled plans (daily)
```sql
WITH RECURSIVE dates AS (
  SELECT DATE(:start_date1) AS d
  UNION ALL SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= :end_date1
),
agg AS (
  SELECT DATE(`date`) AS d, COUNT(*) AS cancellations
  FROM pw_stripewebhooks
  WHERE event IN ('subscription_schedule.canceled')
    AND `date` >= :start_date2 AND `date` < DATE_ADD(:end_date2, INTERVAL 1 DAY)
  GROUP BY DATE(`date`)
)
SELECT dates.d AS `date`, COALESCE(agg.cancellations, 0) AS cancellations
FROM dates
LEFT JOIN agg ON agg.d = dates.d
ORDER BY dates.d
```

Optimized SQL (fill in):
```sql
-- active:
-- new:
-- canceled:
```

Indexes/Notes: `pw_schedule (status, startdate, td_id)`, `pw_transaction_details (id, appeal_id, fundlist_id)`; stripe webhooks on `(event, date)`.

---

## Recurring Revenue (php-api/recurring-revenue.php:1)

MRR (daily)
```sql
WITH RECURSIVE date_series AS (
  SELECT DATE(:start_date) AS d
  UNION ALL SELECT d + INTERVAL 1 DAY FROM date_series WHERE d < :end_date
),
active_plans AS (
  SELECT s.id, s.startdate, s.status, s.amount, s.frequency, td.appeal_id, td.fundlist_id
  FROM pw_schedule s
  JOIN pw_transaction_details td ON s.td_id = td.id
  WHERE s.status = 'ACTIVE' AND (s.plan_id IS NOT NULL AND s.sub_id IS NOT NULL) ${appealFilter} ${fundFilter}
)
SELECT ds.d AS `date`,
  ROUND(SUM(CASE WHEN ap.frequency = 'MONTHLY' THEN ap.amount
                 WHEN ap.frequency = 'WEEKLY' THEN ap.amount * 4.33
                 WHEN ap.frequency = 'DAILY'  THEN ap.amount * 30.42
                 WHEN ap.frequency = 'YEARLY' THEN ap.amount / 12
                 ELSE 0 END), 2) AS mrr
FROM date_series ds
LEFT JOIN active_plans ap ON ap.startdate <= ds.d
GROUP BY ds.d
ORDER BY ds.d
```

Share of recurring revenue (daily)
```sql
WITH RECURSIVE dates AS (
  SELECT DATE(${startDateLiteral}) AS d
  UNION ALL SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE(${endDateLiteral})
),
daily_totals AS (
  SELECT DATE(t.date) AS d, SUM(t.totalamount) AS total
  FROM pw_transactions t
  WHERE t.status IN ('Completed','pending')
    AND t.date >= ${startDateLiteral}
    AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details td2
      JOIN pw_appeal a ON a.id = td2.appeal_id
      JOIN pw_fundlist f ON f.id = td2.fundlist_id
      WHERE td2.TID = t.id ${appealFilter} ${fundFilter}
    )
  GROUP BY DATE(t.date)
),
daily_recurring AS (
  SELECT DATE(t.date) AS d, SUM(t.totalamount) AS recurring
  FROM pw_transactions t
  WHERE t.status IN ('Completed','pending')
    AND t.date >= ${startDateLiteral}
    AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details td2
      JOIN pw_appeal a ON a.id = td2.appeal_id
      JOIN pw_fundlist f ON f.id = td2.fundlist_id
      WHERE td2.TID = t.id AND td2.freq >= 1 ${appealFilter} ${fundFilter}
    )
  GROUP BY DATE(t.date)
)
SELECT d.d AS `date`,
  ROUND(CASE WHEN COALESCE(dt.total, 0) > 0 THEN (COALESCE(dr.recurring, 0) / dt.total) * 100 ELSE 0 END, 1) AS value
FROM dates d
LEFT JOIN daily_totals dt ON dt.d = d.d
LEFT JOIN daily_recurring dr ON dr.d = d.d
ORDER BY d.d
```

Donation amounts (snapshot)
```sql
WITH active_plans AS (
  SELECT s.amount, s.frequency
  FROM pw_schedule s
  JOIN pw_transaction_details td ON s.td_id = td.id
  WHERE s.status = 'ACTIVE'
    AND (s.plan_id IS NOT NULL AND s.sub_id IS NOT NULL)
    AND s.startdate <= :snapshot_date ${appealFilter} ${fundFilter}
),
monthly_amounts AS (
  SELECT CASE
    WHEN frequency = 'MONTHLY' THEN amount
    WHEN frequency = 'WEEKLY'  THEN amount * 4.33
    WHEN frequency = 'DAILY'   THEN amount * 30.42
    WHEN frequency = 'YEARLY'  THEN amount / 12
    ELSE 0 END AS monthly_amount
  FROM active_plans
)
SELECT CASE
    WHEN monthly_amount >= 0 AND monthly_amount < 5  THEN '$0 - $5'
    WHEN monthly_amount >= 5 AND monthly_amount < 11 THEN '$5 - $11'
    WHEN monthly_amount >= 11 AND monthly_amount < 21 THEN '$11 - $21'
    WHEN monthly_amount >= 21 AND monthly_amount < 50 THEN '$21 - $50'
    ELSE '$50 and more' END AS amount_range,
  COUNT(*) AS plan_count,
  ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM monthly_amounts)), 0) AS percentage
FROM monthly_amounts
GROUP BY amount_range
ORDER BY CASE amount_range
  WHEN '$0 - $5' THEN 1 WHEN '$5 - $11' THEN 2 WHEN '$11 - $21' THEN 3 WHEN '$21 - $50' THEN 4 WHEN '$50 and more' THEN 5 END
```

Optimized SQL (fill in):
```sql
-- mrr:
-- share-of-revenue:
-- donation-amounts:
```

Indexes/Notes: schedule and transaction details as above.

---

## Payment Methods (php-api/payment-methods.php:1)

Chart (daily)
```sql
WITH RECURSIVE dates AS (
  SELECT DATE(${startDateLiteral}) AS d
  UNION ALL SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE(${endDateLiteral})
),
payment_types AS (
  SELECT DISTINCT paymenttype FROM pw_transactions
),
daily_agg AS (
  SELECT DATE(t.date) AS d, t.paymenttype, SUM(t.totalamount) AS amount
  FROM pw_transactions t
  WHERE t.status IN ('Completed', 'pending')
    AND t.date >= ${startDateLiteral}
    AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details d
      JOIN pw_appeal a ON a.id = d.appeal_id
      JOIN pw_fundlist f ON f.id = d.fundlist_id
      WHERE d.TID = t.id ${filterClause}
    )
  GROUP BY DATE(t.date), t.paymenttype
)
SELECT d.d AS `date`, pt.paymenttype, COALESCE(a.amount, 0) AS amount
FROM dates d
CROSS JOIN payment_types pt
LEFT JOIN daily_agg a ON a.d = d.d AND a.paymenttype = pt.paymenttype
ORDER BY d.d, pt.paymenttype
```

Chart (weekly) and Table queries are similar to above (see code);
include your optimized versions here if you plan to change them.

Optimized SQL (fill in):
```sql
-- daily chart:
-- weekly chart:
-- table:
```

Indexes/Notes: `pw_transactions (status, date, paymenttype)`.

---

## Funds (php-api/funds.php:1)

Chart (daily)
```sql
WITH RECURSIVE dates AS (
  SELECT DATE(${startDateLiteral}) AS d
  UNION ALL SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE(${endDateLiteral})
),
active_funds AS (
  SELECT DISTINCT fl.id AS fund_id, fl.name AS fund_name, fl.appeal_id, ap.name AS appeal_name
  FROM pw_fundlist fl
  LEFT JOIN pw_appeal ap ON ap.id = fl.appeal_id
  WHERE fl.disable = 0
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details td
      JOIN pw_transactions t ON t.id = td.TID
      WHERE td.fundlist_id = fl.id
        AND t.status IN ('Completed', 'pending')
        AND t.date >= ${startDateLiteral} AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
        ${appealFilterActive}
    )
),
daily_agg AS (
  SELECT DATE(t.date) AS d, td.fundlist_id, SUM(t.totalamount) AS amount
  FROM pw_transactions t
  JOIN pw_transaction_details td ON td.TID = t.id
  WHERE t.status IN ('Completed', 'pending')
    AND t.date >= ${startDateLiteral} AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details d
      JOIN pw_appeal a ON a.id = d.appeal_id
      JOIN pw_fundlist f ON f.id = d.fundlist_id
      WHERE d.TID = t.id ${appealFilter}
    )
  GROUP BY DATE(t.date), td.fundlist_id
)
SELECT d.d AS `date`, af.fund_id, af.fund_name, af.appeal_id, af.appeal_name, COALESCE(a.amount, 0) AS amount
FROM dates d
CROSS JOIN active_funds af
LEFT JOIN daily_agg a ON a.d = d.d AND a.fundlist_id = af.fund_id
ORDER BY d.d, af.appeal_name, af.fund_name
```

Optimized SQL (fill in):
```sql
-- daily chart:
-- weekly chart:
-- table:
```

Indexes/Notes: ensure `fl.disable` indexed if used heavily.

---

## Countries (php-api/countries.php:1)

Chart (daily)
```sql
WITH RECURSIVE dates AS (
  SELECT DATE(${startDateLiteral}) AS d
  UNION ALL SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE(${endDateLiteral})
),
active_countries AS (
  SELECT DISTINCT COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code
  FROM pw_transactions t
  JOIN pw_donors don ON don.id = t.DID
  WHERE t.status IN ('Completed', 'pending')
    AND t.date >= ${startDateLiteral} AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details d
      JOIN pw_appeal a ON a.id = d.appeal_id
      JOIN pw_fundlist f ON f.id = d.fundlist_id
      WHERE d.TID = t.id ${filterClause}
    )
),
daily_agg AS (
  SELECT DATE(t.date) AS d, COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code, SUM(t.totalamount) AS amount
  FROM pw_transactions t
  JOIN pw_donors don ON don.id = t.DID
  WHERE t.status IN ('Completed', 'pending')
    AND t.date >= ${startDateLiteral} AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details d
      JOIN pw_appeal a ON a.id = d.appeal_id
      JOIN pw_fundlist f ON f.id = d.fundlist_id
      WHERE d.TID = t.id ${filterClause}
    )
  GROUP BY DATE(t.date), COALESCE(NULLIF(don.country, ''), 'Unknown')
)
SELECT dt.d AS `date`, ac.country_code, COALESCE(da.amount, 0) AS amount
FROM dates dt
CROSS JOIN active_countries ac
LEFT JOIN daily_agg da ON da.d = dt.d AND da.country_code = ac.country_code
ORDER BY dt.d, ac.country_code
```

Optimized SQL (fill in):
```sql
-- daily chart:
-- weekly chart:
```

Indexes/Notes: donor country lookups may benefit from `pw_donors (id, country)`.

---

## Day & Time Heatmap (php-api/day-time.php:1)

```sql
SELECT
  (DAYOFWEEK(t.date) + 5) % 7 AS day_of_week,
  HOUR(t.date) AS hour_of_day,
  COUNT(DISTINCT t.id) AS donation_count,
  SUM(t.totalamount) AS total_raised
FROM pw_transactions t
WHERE t.status IN ('Completed', 'pending')
  AND t.date >= ${startDateLiteral}
  AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
  AND EXISTS (
    SELECT 1 FROM pw_transaction_details d
    JOIN pw_appeal a ON a.id = d.appeal_id
    JOIN pw_fundlist f ON f.id = d.fundlist_id
    WHERE d.TID = t.id ${filterClause}
  )
GROUP BY day_of_week, hour_of_day
ORDER BY day_of_week, hour_of_day
```

Optimized SQL (fill in):
```sql
-- heatmap:
```

Indexes/Notes: ensure time extraction works with indexed `date` column.

---

## Frequencies (php-api/frequencies.php:1)

Chart (daily)
```sql
WITH RECURSIVE dates AS (
  SELECT DATE(${startDateLiteral}) AS d
  UNION ALL SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE(${endDateLiteral})
),
filtered_tx AS (
  SELECT t.id, t.totalamount, DATE(t.date) AS d
  FROM pw_transactions t
  WHERE t.status IN ('Completed', 'pending')
    AND t.date >= ${startDateLiteral}
    AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details d
      JOIN pw_appeal a ON a.id = d.appeal_id
      JOIN pw_fundlist f ON f.id = d.fundlist_id
      WHERE d.TID = t.id ${filterClause}
    )
),
tx_freq AS (
  SELECT ft.d, ft.totalamount, MAX(td.freq) AS max_freq
  FROM filtered_tx ft
  JOIN pw_transaction_details td ON td.TID = ft.id
  GROUP BY ft.id, ft.d, ft.totalamount
),
daily_agg AS (
  SELECT d,
    SUM(CASE WHEN max_freq = 1 THEN totalamount ELSE 0 END) AS monthly,
    SUM(CASE WHEN max_freq = 0 THEN totalamount ELSE 0 END) AS one_time,
    SUM(CASE WHEN max_freq = 2 THEN totalamount ELSE 0 END) AS yearly,
    SUM(CASE WHEN max_freq = 4 THEN totalamount ELSE 0 END) AS weekly,
    SUM(CASE WHEN max_freq = 3 THEN totalamount ELSE 0 END) AS daily
  FROM tx_freq
  GROUP BY d
)
SELECT d.d AS `date`,
  COALESCE(a.monthly, 0) AS monthly,
  COALESCE(a.one_time, 0) AS one_time,
  COALESCE(a.yearly, 0) AS yearly,
  COALESCE(a.weekly, 0) AS weekly,
  COALESCE(a.daily, 0) AS daily
FROM dates d
LEFT JOIN daily_agg a ON a.d = d.d
ORDER BY d.d
```

Table (by transaction-level frequency)
```sql
WITH freq_map AS (
  SELECT 0 AS freq, 'One-time' AS freq_name
  UNION ALL SELECT 1, 'Monthly'
  UNION ALL SELECT 2, 'Yearly'
  UNION ALL SELECT 3, 'Daily'
  UNION ALL SELECT 4, 'Weekly'
),
filtered_tx AS (
  SELECT t.id, t.totalamount
  FROM pw_transactions t
  WHERE t.status IN ('Completed', 'pending')
    AND t.date >= ${startDateLiteral}
    AND t.date < DATE_ADD(${endDateLiteral}, INTERVAL 1 DAY)
    AND EXISTS (
      SELECT 1 FROM pw_transaction_details d
      JOIN pw_appeal a ON a.id = d.appeal_id
      JOIN pw_fundlist f ON f.id = d.fundlist_id
      WHERE d.TID = t.id ${filterClause}
    )
),
tx_freq AS (
  SELECT ft.id AS tid,
    CASE MAX(td.freq)
      WHEN 0 THEN 'One-time'
      WHEN 1 THEN 'Monthly'
      WHEN 2 THEN 'Yearly'
      WHEN 3 THEN 'Daily'
      WHEN 4 THEN 'Weekly'
      ELSE 'One-time' END AS frequency,
    ft.totalamount AS totalamount
  FROM filtered_tx ft
  JOIN pw_transaction_details td ON td.TID = ft.id
  GROUP BY ft.id
),
agg AS (
  SELECT frequency, COUNT(DISTINCT tid) AS donation_count, SUM(totalamount) AS total_raised
  FROM tx_freq
  GROUP BY frequency
)
SELECT fm.freq_name AS frequency,
  COALESCE(a.donation_count, 0) AS donations,
  COALESCE(a.total_raised, 0.00) AS totalRaised
FROM freq_map fm
LEFT JOIN agg a ON a.frequency = fm.freq_name
ORDER BY fm.freq
```

Optimized SQL (fill in):
```sql
-- daily chart:
-- table:
```

Indexes/Notes: rely on `MAX(td.freq)` across a transaction’s details.

---

## Filters (php-api/filters/*.php)

Appeals
```sql
SELECT * FROM pw_appeal
```

Funds (with optional appeal filter)
```sql
-- With appeals
SELECT * FROM pw_fundlist WHERE appeal_id IN (?,?,...)
-- All funds
SELECT * FROM pw_fundlist
```

Testing tips
- Use curl with representative params, e.g.:
```bash
curl "http://localhost/php-api/analytics.php?kind=total-raised&startDate=2024-01-01&endDate=2024-03-31&granularity=daily&appealId=1,2&fundId=3"
```
- Validate: field names, counts/amounts, date windows, filter effects.

When ready
- Edit this file in-place with your optimized SQL and any index notes. Ping me, and I’ll integrate the changes across the PHP endpoints, preserving types and response shapes.
