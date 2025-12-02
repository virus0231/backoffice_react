<?php

namespace App\Models;

use App\Models\Appeal;
use App\Models\Fund;
use App\Models\Transaction;

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

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'TID', 'id');
    }

    public function appeal()
    {
        return $this->belongsTo(Appeal::class, 'appeal_id', 'id');
    }

    public function fund()
    {
        return $this->belongsTo(Fund::class, 'fundlist_id', 'id');
    }
}
