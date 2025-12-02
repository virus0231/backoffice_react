<?php

namespace Tests\Feature\Api\Auth;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Use in-memory sqlite to keep tests fast and isolated.
        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => false,
        ]);
        app('db')->setDefaultConnection('sqlite');

        // Disable legacy prefixes for tests so the table resolves to "users".
        config()->set('yoc.prefix_primary', '');
        config()->set('yoc.prefix_fallback', '');

        $this->migrateTestTables();
    }

    protected function migrateTestTables(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('user_login')->unique();
            $table->string('user_email')->nullable();
            $table->string('display_name')->nullable();
            $table->integer('user_role')->default(0);
            $table->integer('user_status')->default(0);
            $table->string('user_pass', 255);
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
    }

    protected function createUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'user_login' => 'testuser',
            'user_email' => 'test@example.com',
            'display_name' => 'Test User',
            'user_role' => 2,
            'user_status' => 0,
            'user_pass' => Hash::make('password123'),
        ], $overrides));
    }

    public function test_login_with_valid_credentials_returns_token(): void
    {
        $this->createUser();

        $response = $this->postJson('/api/v1/auth/login', [
            'username_val' => 'testuser',
            'password_val' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure(['token', 'user' => ['id', 'user_login']]);
    }

    public function test_login_with_invalid_credentials_fails(): void
    {
        $this->createUser();

        $response = $this->postJson('/api/v1/auth/login', [
            'username_val' => 'testuser',
            'password_val' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_protected_route_without_token_is_unauthorized(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(401);
    }

    public function test_protected_route_with_valid_token_succeeds(): void
    {
        $this->createUser();

        $login = $this->postJson('/api/v1/auth/login', [
            'username_val' => 'testuser',
            'password_val' => 'password123',
        ])->assertStatus(200);

        $token = $login['token'];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/v1/health');

        $response->assertStatus(200);
    }

    public function test_logout_revokes_token(): void
    {
        $this->createUser();

        $login = $this->postJson('/api/v1/auth/login', [
            'username_val' => 'testuser',
            'password_val' => 'password123',
        ])->assertStatus(200);

        $token = $login['token'];

        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/v1/auth/logout')->assertStatus(200);

        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/v1/health')->assertStatus(401);
    }
}
