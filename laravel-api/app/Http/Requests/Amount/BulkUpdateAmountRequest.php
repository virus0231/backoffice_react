<?php

namespace App\Http\Requests\Amount;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateAmountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appeal_id' => 'required|integer|min:1',
            'amounts' => 'sometimes|array',
            'amounts_count' => 'sometimes|integer|min:0',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();
        return array_merge($this->all(), $validated);
    }
}
