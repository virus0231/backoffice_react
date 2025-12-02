<?php

namespace App\Models;

use App\Models\Donor;
use App\Models\TransactionDetail;

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

    public function donor()
    {
        return $this->belongsTo(Donor::class, 'DID', 'id');
    }

    public function details()
    {
        return $this->hasMany(TransactionDetail::class, 'TID', 'id');
    }
}
