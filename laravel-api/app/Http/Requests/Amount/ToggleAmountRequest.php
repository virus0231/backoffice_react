<?php

namespace App\Http\Requests\Amount;

use Illuminate\Foundation\Http\FormRequest;

class ToggleAmountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|boolean',
        ];
    }
}
