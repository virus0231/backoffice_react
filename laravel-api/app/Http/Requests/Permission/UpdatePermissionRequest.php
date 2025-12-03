<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_id' => 'required|integer|min:1',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'integer',
        ];
    }
}
