<?php

namespace App\Models;

class Schedule extends BasePrefixedModel
{
    protected static string $baseTable = 'schedule';
    protected $fillable = [
        'did',
        'order_id',
        'sub_id',
        'status',
        'startdate',
        'nextrun_date',
        'date',
        'amount',
        'quantity',
        'frequency',
        'remainingcount',
        'totalcount',
    ];
}
