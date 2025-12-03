<?php

namespace App\Models;

use App\Support\TableResolver;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table;
    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'image',
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
        $this->table = TableResolver::prefixed('category');
    }

    public function appeals()
    {
        return $this->hasMany(Appeal::class, 'category', 'id');
    }
}
