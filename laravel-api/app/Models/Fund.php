<?php

namespace App\Models;

class Fund extends BasePrefixedModel
{
    protected static string $baseTable = 'fundlist';
    protected $fillable = [
        'appeal_id',
        'name',
        'category',
        'sort',
        'disable',
    ];
}
