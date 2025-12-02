<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable as AuthenticatableTrait;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends BasePrefixedModel implements Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, AuthenticatableTrait, HasFactory, Notifiable;

    protected static string $baseTable = 'users';

    /**
     * Legacy table uses 'ID' as primary key (uppercase).
     *
     * @var string
     */
    protected $primaryKey = 'ID';

    /**
     * Legacy table has no timestamps.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_login',
        'user_email',
        'display_name',
        'user_role',
        'user_status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'user_pass',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_status' => 'integer',
        ];
    }

    /**
     * Use user_login as the unique auth identifier.
     */
    public function getAuthIdentifierName(): string
    {
        return 'user_login';
    }

    /**
     * Return the legacy hashed password column.
     */
    public function getAuthPassword()
    {
        return $this->user_pass;
    }
}
