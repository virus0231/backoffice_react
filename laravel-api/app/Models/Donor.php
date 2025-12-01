<?php

namespace App\Models;

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
}
