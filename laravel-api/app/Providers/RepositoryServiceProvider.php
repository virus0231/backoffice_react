<?php

namespace App\Providers;

use App\Repositories\Contracts\AppealRepositoryInterface;
use App\Repositories\Contracts\AnalyticsRepositoryInterface;
use App\Repositories\Contracts\DonorRepositoryInterface;
use App\Repositories\Contracts\ReportsRepositoryInterface;
use App\Repositories\Contracts\ScheduleRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\AnalyticsRepository;
use App\Repositories\DonorRepository;
use App\Repositories\ReportsRepository;
use App\Repositories\ScheduleRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $bindings = [
            DonorRepositoryInterface::class => DonorRepository::class,
            AnalyticsRepositoryInterface::class => AnalyticsRepository::class,
            TransactionRepositoryInterface::class => 'App\Repositories\TransactionRepository',
            ScheduleRepositoryInterface::class => ScheduleRepository::class,
            ReportsRepositoryInterface::class => ReportsRepository::class,
            AppealRepositoryInterface::class => 'App\Repositories\AppealRepository',
        ];

        foreach ($bindings as $abstract => $concrete) {
            if (interface_exists($abstract) && class_exists($concrete)) {
                $this->app->bind($abstract, $concrete);
            }
        }
    }

    public function boot(): void
    {
        //
    }
}
