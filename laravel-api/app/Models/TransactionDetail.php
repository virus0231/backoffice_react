<?php

namespace App\Models;

class TransactionDetail extends BasePrefixedModel
{
    protected static string $baseTable = 'transaction_details';
    protected $fillable = [
        'TID',
        'appeal_id',
        'amount_id',
        'fundlist_id',
        'amount',
        'quantity',
        'freq',
    ];
}
