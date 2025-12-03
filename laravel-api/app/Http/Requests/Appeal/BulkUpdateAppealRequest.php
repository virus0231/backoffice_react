<?php

namespace App\Http\Requests\Appeal;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateAppealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appeals_count' => 'sometimes|integer|min:0',
            'appeals' => 'sometimes|array',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();
        return array_merge($this->all(), $validated);
    }
}
