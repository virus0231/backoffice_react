<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AmountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CountryAnalyticsController;
use App\Http\Controllers\Api\DonorController;
use App\Http\Controllers\Api\FiltersController;
use App\Http\Controllers\Api\FundAnalyticsController;
use App\Http\Controllers\Api\PaymentMethodsController;
use App\Http\Controllers\Api\FrequenciesController;
use App\Http\Controllers\Api\DayTimeController;
use App\Http\Controllers\Api\RecurringPlansController;
use App\Http\Controllers\Api\RecurringRevenueController;
use App\Http\Controllers\Api\RetentionController;
use App\Http\Controllers\Api\ManualTransactionController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\CrmIntegrationController;
use App\Http\Controllers\Api\DigitalMarketingController;
use App\Http\Controllers\Api\SeasonController;
use App\Http\Controllers\Api\ExportOptimizedController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\AppealController;
use App\Http\Controllers\Api\FundController;
use App\Http\Controllers\Api\FundAmountAssociationController;
use App\Http\Controllers\Api\FeaturedAmountController;
use App\Http\Controllers\Api\DonorSegmentationController;
use App\Http\Controllers\Api\DonationExportController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ComponentController;
use App\Http\Controllers\Api\ConfigurationController;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1'); // 5 attempts per minute

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('health', fn () => ['ok' => true]);

        // Auth
        Route::post('auth/status', [AuthController::class, 'status']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Reference data
        Route::get('filters/appeals', [FiltersController::class, 'appeals']);
        Route::get('filters/funds', [FiltersController::class, 'funds']);
        Route::get('filters/categories', [FiltersController::class, 'categories']);
        Route::get('filters/countries', [FiltersController::class, 'countries']);
        Route::get('categories', [CategoryController::class, 'index']);
        Route::post('categories', [CategoryController::class, 'store']);
        Route::post('categories/bulk', [CategoryController::class, 'bulkUpdate']);
        Route::put('categories/{id}', [CategoryController::class, 'update']);
        Route::get('appeals', [AppealController::class, 'index']);
        Route::get('countries/list', [CountryController::class, 'index']);
        Route::post('countries', [CountryController::class, 'store']);
        Route::post('countries/bulk', [CountryController::class, 'bulkUpdate']);
        Route::put('countries/{id}', [CountryController::class, 'update']);
        Route::post('appeals/bulk', [AppealController::class, 'bulkUpdate']);
        Route::post('appeals', [AppealController::class, 'store']);
        Route::put('appeals/{id}', [AppealController::class, 'update']);

        // Amounts & featured amounts
        Route::get('amounts', [AmountController::class, 'index']);
        Route::post('amounts/bulk', [AmountController::class, 'bulkUpdate']);
        Route::post('amounts/{amount}/toggle', [AmountController::class, 'toggle']);
        Route::get('featured-amounts', [FeaturedAmountController::class, 'index']);
        Route::post('amounts/{id}/status', [FeaturedAmountController::class, 'toggle']);

        // Donors
        Route::get('donors', [DonorController::class, 'index']);
        Route::get('donors/{donor}', [DonorController::class, 'show']);
        Route::put('donors/{donor}', [DonorController::class, 'update']);
        Route::get('donors/{donor}/donations', [DonorController::class, 'donations']);
        Route::get('donors/{donor}/subscriptions', [DonorController::class, 'subscriptions']);

        // Analytics & reports
        Route::get('analytics', [AnalyticsController::class, 'index']);
        Route::get('funds', [FundAnalyticsController::class, 'index']);
        Route::get('countries', [CountryAnalyticsController::class, 'index']);
        Route::get('payment-methods', [PaymentMethodsController::class, 'index']);
        Route::get('frequencies', [FrequenciesController::class, 'index']);
        Route::get('day-time', [DayTimeController::class, 'index']);
        Route::get('recurring-plans', [RecurringPlansController::class, 'index']);
        Route::get('recurring-revenue', [RecurringRevenueController::class, 'index']);
        Route::get('retention', [RetentionController::class, 'index']);
        Route::get('reports/campaigns', [ReportsController::class, 'campaigns']);
        Route::get('reports/causes', [ReportsController::class, 'causes']);
        Route::get('reports/funds', [ReportsController::class, 'funds']);
        Route::get('reports/monthly', [ReportsController::class, 'monthly']);
        Route::get('reports/donations', [DonationExportController::class, 'data']);
        Route::post('reports/donations', [DonationExportController::class, 'data']);
        Route::post('reports/donations/export', [DonationExportController::class, 'export']);
        Route::get('donor-segmentation', [DonorSegmentationController::class, 'index']);
        Route::post('transactions/manual', [ManualTransactionController::class, 'store']);
        Route::post('verification', [VerificationController::class, 'store']);
        Route::post('crm', [CrmIntegrationController::class, 'store']);
        Route::post('dm', [DigitalMarketingController::class, 'store']);
        Route::get('season-dates', [SeasonController::class, 'index']);
        Route::post('reports/donations/export-optimized', [ExportOptimizedController::class, 'store']);
        Route::get('components', [ComponentController::class, 'index']);
        Route::post('components', [ComponentController::class, 'store']);
        Route::get('components/{id}', [ComponentController::class, 'show']);
        Route::put('components/{id}', [ComponentController::class, 'update']);
        Route::delete('components/{id}', [ComponentController::class, 'destroy']);
        Route::post('components/bulk', [ComponentController::class, 'bulkUpdate']);
        Route::get('configurations', [ConfigurationController::class, 'index']);
        Route::post('configurations', [ConfigurationController::class, 'store']);
        Route::get('configurations/{id}', [ConfigurationController::class, 'show']);
        Route::put('configurations/{id}', [ConfigurationController::class, 'update']);
        Route::delete('configurations/{id}', [ConfigurationController::class, 'destroy']);

        // Users & permissions
        Route::get('users', [UserManagementController::class, 'index']);
        Route::post('users', [UserManagementController::class, 'store']);
        Route::put('users/{id}', [UserManagementController::class, 'update']);
        Route::post('users/{id}/status', [UserManagementController::class, 'status']);
        Route::post('permissions/roles', [PermissionController::class, 'roles']);
        Route::post('permissions/list', [PermissionController::class, 'list']);
        Route::post('permissions/update', [PermissionController::class, 'update']);

        // Recurring schedules
        Route::get('schedules', [ScheduleController::class, 'index']);
        Route::get('schedules/export', [ScheduleController::class, 'export']);

        // Funds & associations
        Route::get('funds/list', [FundController::class, 'list']);
        Route::post('funds/bulk', [FundController::class, 'bulkUpdate']);
        Route::get('fund-amount-associations', [FundAmountAssociationController::class, 'index']);
        Route::post('fund-amount-associations', [FundAmountAssociationController::class, 'update']);
    });
});
