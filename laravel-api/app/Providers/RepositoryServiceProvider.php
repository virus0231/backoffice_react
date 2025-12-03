<?php

namespace App\Providers;

use App\Repositories\Contracts\AppealRepositoryInterface;
use App\Repositories\Contracts\AnalyticsRepositoryInterface;
use App\Repositories\Contracts\DonorRepositoryInterface;
use App\Repositories\Contracts\ReportsRepositoryInterface;
use App\Repositories\Contracts\FiltersRepositoryInterface;
use App\Repositories\Contracts\ScheduleRepositoryInterface;
use App\Repositories\Contracts\UserManagementRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\DonationExportRepositoryInterface;
use App\Repositories\Contracts\AmountRepositoryInterface;
use App\Repositories\Contracts\FundRepositoryInterface;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\CountryRepositoryInterface;
use App\Repositories\AnalyticsRepository;
use App\Repositories\DonorRepository;
use App\Repositories\FiltersRepository;
use App\Repositories\DonationExportRepository;
use App\Repositories\ReportsRepository;
use App\Repositories\ScheduleRepository;
use App\Repositories\UserManagementRepository;
use App\Repositories\FundRepository;
use App\Repositories\AmountRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\CountryRepository;
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
            FiltersRepositoryInterface::class => FiltersRepository::class,
            UserManagementRepositoryInterface::class => UserManagementRepository::class,
            DonationExportRepositoryInterface::class => DonationExportRepository::class,
            FundRepositoryInterface::class => FundRepository::class,
            AmountRepositoryInterface::class => AmountRepository::class,
            CategoryRepositoryInterface::class => CategoryRepository::class,
            CountryRepositoryInterface::class => CountryRepository::class,
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
