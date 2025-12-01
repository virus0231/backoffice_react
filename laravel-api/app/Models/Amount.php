<?php

namespace App\Models;

class Amount extends BasePrefixedModel
{
    protected static string $baseTable = 'amount';
    protected $fillable = [
        'appeal_id',
        'name',
        'amount',
        'donationtype',
        'sort',
        'featured',
        'disable',
    ];
}
