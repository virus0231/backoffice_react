<?php

namespace App\Models;

use App\Models\Amount;
use App\Models\Category;
use App\Models\Country;
use App\Models\Fund;
use App\Models\TransactionDetail;

class Appeal extends BasePrefixedModel
{
    protected static string $baseTable = 'appeal';
    protected $fillable = [
        'name',
        'description',
        'image',
        'ishome_v',
        'country',
        'cause',
        'category',
        'goal',
        'sort',
        'isfooter',
        'isdonate_v',
        'isother_v',
        'isquantity_v',
        'isdropdown_v',
        'isrecurring_v',
        'recurring_interval',
        'isassociate',
        'type',
        'disable',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category', 'id');
    }

    public function country()
    {
        return $this->belongsTo(Country::class, 'country', 'id');
    }

    public function amounts()
    {
        return $this->hasMany(Amount::class, 'appeal_id', 'id');
    }

    public function funds()
    {
        return $this->hasMany(Fund::class, 'appeal_id', 'id');
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class, 'appeal_id', 'id');
    }
}
