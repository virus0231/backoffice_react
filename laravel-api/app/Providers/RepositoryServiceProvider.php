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
use App\Repositories\Contracts\CountryAnalyticsRepositoryInterface;
use App\Repositories\Contracts\FeaturedAmountRepositoryInterface;
use App\Repositories\Contracts\DayTimeRepositoryInterface;
use App\Repositories\Contracts\FrequenciesRepositoryInterface;
use App\Repositories\Contracts\DonorSegmentationRepositoryInterface;
use App\Repositories\Contracts\FundAmountAssociationRepositoryInterface;
use App\Repositories\Contracts\FundAnalyticsRepositoryInterface;
    use App\Repositories\Contracts\PaymentMethodsRepositoryInterface;
    use App\Repositories\Contracts\PermissionRepositoryInterface;
    use App\Repositories\Contracts\RecurringPlansRepositoryInterface;
    use App\Repositories\Contracts\RecurringRevenueRepositoryInterface;
    use App\Repositories\Contracts\RetentionRepositoryInterface;
    use App\Repositories\Contracts\ComponentRepositoryInterface;
    use App\Repositories\Contracts\ConfigurationRepositoryInterface;
    use App\Repositories\Contracts\VerificationRepositoryInterface;
    use App\Repositories\Contracts\CrmIntegrationRepositoryInterface;
    use App\Repositories\Contracts\DigitalMarketingRepositoryInterface;
    use App\Repositories\Contracts\SeasonRepositoryInterface;
    use App\Repositories\Contracts\ExportOptimizedRepositoryInterface;
use App\Repositories\Contracts\TransactionDetailRepositoryInterface;
use App\Repositories\AppealRepository;
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
use App\Repositories\FeaturedAmountRepository;
use App\Repositories\DayTimeRepository;
use App\Repositories\FrequenciesRepository;
use App\Repositories\DonorSegmentationRepository;
use App\Repositories\FundAmountAssociationRepository;
use App\Repositories\FundAnalyticsRepository;
    use App\Repositories\PaymentMethodsRepository;
    use App\Repositories\PermissionRepository;
    use App\Repositories\RecurringPlansRepository;
    use App\Repositories\RecurringRevenueRepository;
    use App\Repositories\RetentionRepository;
    use App\Repositories\ComponentRepository;
    use App\Repositories\ConfigurationRepository;
    use App\Repositories\VerificationRepository;
    use App\Repositories\CrmIntegrationRepository;
    use App\Repositories\DigitalMarketingRepository;
    use App\Repositories\SeasonRepository;
    use App\Repositories\ExportOptimizedRepository;
use App\Repositories\CountryAnalyticsRepository;
use App\Repositories\TransactionRepository;
use App\Repositories\TransactionDetailRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $bindings = [
            DonorRepositoryInterface::class => DonorRepository::class,
            AnalyticsRepositoryInterface::class => AnalyticsRepository::class,
            TransactionRepositoryInterface::class => TransactionRepository::class,
            TransactionDetailRepositoryInterface::class => TransactionDetailRepository::class,
            ScheduleRepositoryInterface::class => ScheduleRepository::class,
            ReportsRepositoryInterface::class => ReportsRepository::class,
            FiltersRepositoryInterface::class => FiltersRepository::class,
            UserManagementRepositoryInterface::class => UserManagementRepository::class,
            DonationExportRepositoryInterface::class => DonationExportRepository::class,
            FundRepositoryInterface::class => FundRepository::class,
            AmountRepositoryInterface::class => AmountRepository::class,
            CategoryRepositoryInterface::class => CategoryRepository::class,
            CountryRepositoryInterface::class => CountryRepository::class,
            AppealRepositoryInterface::class => AppealRepository::class,
            FeaturedAmountRepositoryInterface::class => FeaturedAmountRepository::class,
            CountryAnalyticsRepositoryInterface::class => CountryAnalyticsRepository::class,
            DayTimeRepositoryInterface::class => DayTimeRepository::class,
            FrequenciesRepositoryInterface::class => FrequenciesRepository::class,
            DonorSegmentationRepositoryInterface::class => DonorSegmentationRepository::class,
            FundAmountAssociationRepositoryInterface::class => FundAmountAssociationRepository::class,
            FundAnalyticsRepositoryInterface::class => FundAnalyticsRepository::class,
            PaymentMethodsRepositoryInterface::class => PaymentMethodsRepository::class,
            PermissionRepositoryInterface::class => PermissionRepository::class,
            RecurringPlansRepositoryInterface::class => RecurringPlansRepository::class,
            RecurringRevenueRepositoryInterface::class => RecurringRevenueRepository::class,
            RetentionRepositoryInterface::class => RetentionRepository::class,
            ComponentRepositoryInterface::class => ComponentRepository::class,
            ConfigurationRepositoryInterface::class => ConfigurationRepository::class,
            VerificationRepositoryInterface::class => VerificationRepository::class,
            CrmIntegrationRepositoryInterface::class => CrmIntegrationRepository::class,
            DigitalMarketingRepositoryInterface::class => DigitalMarketingRepository::class,
            SeasonRepositoryInterface::class => SeasonRepository::class,
            ExportOptimizedRepositoryInterface::class => ExportOptimizedRepository::class,
        ];

        foreach ($bindings as $abstract => $concrete) {
            if (interface_exists($abstract) && class_exists($concrete)) {
                $this->app->bind($abstract, $concrete);
            }
        }

        $this->app->singleton(\App\Services\ManualTransactionService::class, function ($app) {
            return new \App\Services\ManualTransactionService(
                $app->make(\App\Repositories\Contracts\DonorRepositoryInterface::class),
                $app->make(\App\Repositories\Contracts\TransactionRepositoryInterface::class),
                $app->make(\App\Repositories\Contracts\TransactionDetailRepositoryInterface::class),
                $app->make(\App\Repositories\Contracts\ScheduleRepositoryInterface::class),
            );
        });
    }

    public function boot(): void
    {
        //
    }
}
