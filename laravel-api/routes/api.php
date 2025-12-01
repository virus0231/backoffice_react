<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AmountController;
use App\Http\Controllers\Api\DonorController;
use App\Http\Controllers\Api\FiltersController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\ScheduleController;

Route::prefix('v1')->group(function () {
    Route::get('health', fn () => ['ok' => true]);

    // Reference data
    Route::get('filters/appeals', [FiltersController::class, 'appeals']);
    Route::get('filters/funds', [FiltersController::class, 'funds']);
    Route::get('filters/categories', [FiltersController::class, 'categories']);
    Route::get('filters/countries', [FiltersController::class, 'countries']);

    // Amounts
    Route::get('amounts', [AmountController::class, 'index']);
    Route::post('amounts/{amount}/toggle', [AmountController::class, 'toggle']);

    // Donors
    Route::get('donors', [DonorController::class, 'index']);
    Route::get('donors/{donor}', [DonorController::class, 'show']);
    Route::put('donors/{donor}', [DonorController::class, 'update']);
    Route::get('donors/{donor}/donations', [DonorController::class, 'donations']);
    Route::get('donors/{donor}/subscriptions', [DonorController::class, 'subscriptions']);

    // Analytics & reports
    Route::get('analytics', [AnalyticsController::class, 'index']);
    Route::get('reports/campaigns', [ReportsController::class, 'campaigns']);
    Route::get('reports/causes', [ReportsController::class, 'causes']);
    Route::get('reports/funds', [ReportsController::class, 'funds']);

    // Recurring schedules
    Route::get('schedules', [ScheduleController::class, 'index']);
    Route::get('schedules/export', [ScheduleController::class, 'export']);
});
