<?php

namespace App\Http\Requests\Component;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateComponentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'components' => 'required|array|min:1',
            'components.*.id' => 'required|integer',
            'components.*.name' => 'nullable|string|max:255',
            'components.*.type' => 'nullable|string|max:100',
            'components.*.config' => 'nullable|string',
            'components.*.sort' => 'nullable|integer|min:0',
            'components.*.disable' => 'nullable|boolean',
        ];
    }
}
