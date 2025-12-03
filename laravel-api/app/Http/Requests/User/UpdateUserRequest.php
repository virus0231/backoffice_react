<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => 'required|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'nullable|string|min:6',
            'role_id' => 'nullable|integer|not_in:1',
        ];
    }
}
