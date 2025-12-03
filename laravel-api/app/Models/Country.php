<?php

namespace App\Models;

use App\Support\TableResolver;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $table;
    public $timestamps = false;

    protected $fillable = [
        'name',
        'code',
        'flag',
        'sort',
        'disable',
    ];

    protected $casts = [
        'disable' => 'boolean',
        'sort' => 'integer',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->table = TableResolver::prefixed('country');
    }

    public function appeals()
    {
        return $this->hasMany(Appeal::class, 'country', 'id');
    }
}
