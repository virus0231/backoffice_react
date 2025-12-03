#!/bin/bash

TOKEN=$(cat /tmp/tok.txt)
BASE="http://127.0.0.1:8010/api/v1"

echo "=== Testing All 24 Refactored Controllers ==="
echo ""

echo "1. AnalyticsController:"
curl -s "$BASE/analytics?kind=totalDonations&startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "2. ScheduleController:"
curl -s "$BASE/schedules?limit=5" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "3. ReportsController (campaigns):"
curl -s "$BASE/reports/campaigns?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "4. FiltersController (appeals):"
curl -s "$BASE/filters/appeals" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "5. UserManagementController:"
curl -s "$BASE/users?limit=5" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "6. DonationExportController:"
curl -s "$BASE/reports/donations?startDate=2024-01-01&endDate=2024-12-31&limit=5" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "7. FundController:"
curl -s "$BASE/funds/list" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "8. AmountController:"
curl -s "$BASE/amounts" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "9. CategoryController:"
curl -s "$BASE/categories" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "10. CountryController:"
curl -s "$BASE/countries/list" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "11. AppealController:"
curl -s "$BASE/appeals" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "12. FeaturedAmountController:"
curl -s "$BASE/featured-amounts" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "13. DonorController:"
curl -s "$BASE/donors?limit=5" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "14. CountryAnalyticsController:"
curl -s "$BASE/countries?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "15. DayTimeController:"
curl -s "$BASE/day-time?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "16. DonorSegmentationController:"
curl -s "$BASE/donor-segmentation?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "17. FrequenciesController:"
curl -s "$BASE/frequencies?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "18. FundAmountAssociationController:"
curl -s "$BASE/fund-amount-associations" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "19. FundAnalyticsController:"
curl -s "$BASE/funds?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "20. PaymentMethodsController:"
curl -s "$BASE/payment-methods?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "21. PermissionController (list):"
curl -s -X POST "$BASE/permissions/list" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}' | head -c 200
echo -e "\n"

echo "22. RecurringPlansController:"
curl -s "$BASE/recurring-plans?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "23. RecurringRevenueController:"
curl -s "$BASE/recurring-revenue?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "24. RetentionController:"
curl -s "$BASE/retention?startDate=2024-01-01&endDate=2024-12-31" -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n"

echo "=== All 24 Controllers Tested ==="
