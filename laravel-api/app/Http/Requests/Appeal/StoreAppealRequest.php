<?php

namespace App\Http\Requests\Appeal;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appealName' => 'required_without:name|string|max:255',
            'name' => 'required_without:appealName|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:1024',
            'sort' => 'nullable|integer',
            'category' => 'nullable|integer',
            'country' => 'nullable|integer',
            'appealGoal' => 'nullable|numeric',
        ];
    }
}
