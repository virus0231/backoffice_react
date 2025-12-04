<?php

use App\Support\TableResolver;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tableName = TableResolver::prefixed('amount');

        if (! Schema::hasColumn($tableName, 'featured')) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->boolean('featured')
                    ->default(false)
                    ->after('donationtype');
            });
        }
    }

    public function down(): void
    {
        $tableName = TableResolver::prefixed('amount');

        if (Schema::hasColumn($tableName, 'featured')) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('featured');
            });
        }
    }
};
