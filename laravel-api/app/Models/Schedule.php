<?php

namespace App\Models;

use App\Models\Donor;

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

    public function donor()
    {
        return $this->belongsTo(Donor::class, 'did', 'id');
    }
}
