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
            'description' => 'required|string',
            'image' => 'nullable|string|max:1024',
            'sort' => 'nullable|integer',
            'category' => 'nullable|integer|min:1',
            'country' => 'nullable|integer|min:1',
            'appealGoal' => 'nullable|numeric',
            'appealCountry' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'The description field is required.',
            'appealName.required_without' => 'The appeal name field is required.',
            'name.required_without' => 'The appeal name field is required.',
            'appealCountry.required' => 'The country field is required.',
            'appealCountry.integer' => 'Please select a valid country.',
            'appealCountry.min' => 'Please select a valid country.',
        ];
    }
}
