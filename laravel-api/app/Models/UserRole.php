<?php

namespace App\Models;

use App\Support\TableResolver;
use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    protected $table;
    public $timestamps = false;

    protected $fillable = [
        'user_role',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->table = TableResolver::prefixed('user_role');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'user_role', 'id');
    }
}
