<?php

namespace App\Http\Requests\Country;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'countries_count' => 'sometimes|integer|min:0',
            'countries' => 'sometimes|array',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();
        return array_merge($this->all(), $validated);
    }
}
