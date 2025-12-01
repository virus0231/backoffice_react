<?php

namespace App\Models;

class Transaction extends BasePrefixedModel
{
    protected static string $baseTable = 'transactions';
    protected $fillable = [
        'DID',
        'order_id',
        'campaigns',
        'totalamount',
        'paymenttype',
        'status',
        'currency',
        'date',
        'freq',
        'email',
    ];
}
