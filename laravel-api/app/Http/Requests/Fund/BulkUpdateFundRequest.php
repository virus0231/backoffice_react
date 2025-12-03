<?php

namespace App\Http\Requests\Fund;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appeal_id' => 'required|integer|min:1',
            'funds' => 'sometimes|array',
            'funds_count' => 'sometimes|integer|min:0',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();
        return array_merge($this->all(), $validated);
    }
}
