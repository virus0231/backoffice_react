<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class CreateManualTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'charge_id' => 'nullable|string|max:255',
            'payment_intent' => 'nullable|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'add1' => 'nullable|string|max:255',
            'add2' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'customer_id' => 'nullable|string|max:255',
            'date' => 'required|date',
            'card_digits' => 'nullable|string|max:4',
            'payment_type' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.appeal_id' => 'required|integer',
            'items.*.amount_id' => 'nullable|integer',
            'items.*.fundlist_id' => 'nullable|integer',
            'items.*.amount' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.freq' => 'required|in:onetime,monthly,yearly',
            'items.*.plan_id' => 'required_if:items.*.freq,monthly,yearly|nullable|string',
            'items.*.sub_id' => 'required_if:items.*.freq,monthly,yearly|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email is required',
            'email.email' => 'Invalid email format',
            'date.required' => 'Transaction date is required',
            'items.required' => 'At least one transaction item is required',
            'items.*.appeal_id.required' => 'Appeal ID is required for each item',
            'items.*.amount.required' => 'Amount is required for each item',
            'items.*.quantity.required' => 'Quantity is required for each item',
            'items.*.freq.required' => 'Frequency is required for each item',
            'items.*.plan_id.required_if' => 'Plan ID is required for recurring transactions',
            'items.*.sub_id.required_if' => 'Subscription ID is required for recurring transactions',
        ];
    }
}
