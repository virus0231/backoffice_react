<?php

namespace App\Http\Requests\Component;

use Illuminate\Foundation\Http\FormRequest;

class StoreComponentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'config' => 'nullable|string',
            'sort' => 'nullable|integer|min:0',
            'disable' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Component name is required',
        ];
    }
}
