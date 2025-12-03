<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categories_count' => 'sometimes|integer|min:0',
            'categories' => 'sometimes|array',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();
        return array_merge($this->all(), $validated);
    }
}
