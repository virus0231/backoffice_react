<?php

namespace App\Models;

use App\Support\TableResolver;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $table;
    public $timestamps = false;

    protected $fillable = [
        'role',
        'permission_name',
        'can_view',
        'can_create',
        'can_edit',
        'can_delete',
    ];

    protected $casts = [
        'role' => 'integer',
        'can_view' => 'boolean',
        'can_create' => 'boolean',
        'can_edit' => 'boolean',
        'can_delete' => 'boolean',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->table = TableResolver::prefixed('role_permissions');
    }
}
