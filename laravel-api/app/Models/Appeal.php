<?php

namespace App\Models;

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
}
