<?php

namespace App\Http\Requests\Donor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDonorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Auth handled by Sanctum middleware
    }

    public function rules(): array
    {
        return [
            'firstName' => 'required_without:firstname|string|max:255',
            'firstname' => 'required_without:firstName|string|max:255',
            'lastName' => 'required_without:lastname|string|max:255',
            'lastname' => 'required_without:lastName|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address1' => 'nullable|string|max:255',
            'address2' => 'nullable|string|max:255',
            'street' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'postcode' => 'nullable|string|max:50',
            'organization' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
        ];
    }
}
