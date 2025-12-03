<?php

namespace App\Http\Requests\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class StoreConfigurationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => 'required|string|max:255',
            'value' => 'nullable|string',
            'description' => 'nullable|string',
            'group' => 'nullable|string|max:255',
            'sort' => 'nullable|integer|min:0',
            'disable' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'key.required' => 'Configuration key is required',
        ];
    }
}
