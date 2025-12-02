<?php

namespace App\Models;

class Category extends BasePrefixedModel
{
    protected static string $baseTable = 'category';
    protected $fillable = [
        'name',
        'description',
        'sort',
        'disable',
    ];
}
