<?php

namespace App\Models;

use App\Models\Schedule;
use App\Models\Transaction;

class Donor extends BasePrefixedModel
{
    protected static string $baseTable = 'donors';
    protected $fillable = [
        'fourdigit',
        'stripe_id',
        'email',
        'firstname',
        'lastname',
        'add1',
        'add2',
        'city',
        'country',
        'postcode',
        'phone',
        'organization',
        'Date_Added',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'DID', 'id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'did', 'id');
    }
}
