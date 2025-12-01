<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $donorTable = TableResolver::prefixed('donors');
        $page = max(1, (int)$request->query('page', 1));
        $limit = min(100, max(10, (int)$request->query('limit', 50)));
        $offset = ($page - 1) * $limit;
        $search = trim((string)$request->query('email', ''));

        $query = DB::table($donorTable);
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%");
            });
        }

        $totalCount = (clone $query)->count();
        $rows = $query->orderByDesc('id')->limit($limit)->offset($offset)->get();

        $data = $rows->map(function ($r) {
            return [
                'id' => (int)$r->id,
                'fourdigit' => $r->fourdigit ?? '',
                'stripe_id' => $r->stripe_id ?? '',
                'email' => $r->email ?? '',
                'firstName' => $r->firstname ?? '',
                'lastName' => $r->lastname ?? '',
                'phone' => $r->phone ?? '',
                'address1' => $r->add1 ?? '',
                'address2' => $r->add2 ?? '',
                'city' => $r->city ?? '',
                'country' => $r->country ?? '',
                'postcode' => $r->postcode ?? '',
                'organization' => $r->organization ?? '',
                'dateAdded' => $r->Date_Added ?? '',
            ];
        });

        $totalPages = (int)ceil($totalCount / $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => $totalPages,
                'totalCount' => $totalCount,
                'perPage' => $limit,
                'hasNext' => $page < $totalPages,
                'hasPrev' => $page > 1,
            ],
            'count' => $data->count(),
            'message' => $search !== '' ? "Retrieved donors matching \"{$search}\"" : 'Retrieved paginated donors',
        ]);
    }

    public function show(int $donor): JsonResponse
    {
        $donorTable = TableResolver::prefixed('donors');
        $donor = DB::table($donorTable)->where('id', $donor)->first([
            'id',
            'fourdigit',
            'stripe_id',
            'email',
            'firstname',
            'lastname',
            'add1',
            'add2',
            'city',
            'country',
            'postcode',
            'phone',
            'Date_Added',
            'organization',
        ]);

        if (!$donor) {
            return response()->json([
                'success' => false,
                'error' => 'Donor not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => (int)$donor->id,
                'fourdigit' => $donor->fourdigit ?? '',
                'stripe_id' => $donor->stripe_id ?? '',
                'email' => $donor->email ?? '',
                'firstName' => $donor->firstname ?? '',
                'lastName' => $donor->lastname ?? '',
                'phone' => $donor->phone ?? '',
                'address1' => $donor->add1 ?? '',
                'address2' => $donor->add2 ?? '',
                'city' => $donor->city ?? '',
                'country' => $donor->country ?? '',
                'postcode' => $donor->postcode ?? '',
                'organization' => $donor->organization ?? '',
                'dateAdded' => $donor->Date_Added ?? '',
            ],
            'message' => 'Retrieved donor details',
        ]);
    }

    public function update(Request $request, int $donor): JsonResponse
    {
        $donorTable = TableResolver::prefixed('donors');

        $payload = $request->validate([
            'organization' => 'nullable|string|max:255',
            'street' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'postcode' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'firstName' => 'nullable|string|max:255',
            'lastName' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $update = [
            'organization' => $payload['organization'] ?? '',
            'add1' => $payload['street'] ?? '',
            'add2' => $payload['state'] ?? '',
            'city' => $payload['city'] ?? '',
            'country' => $payload['country'] ?? '',
            'postcode' => $payload['postcode'] ?? '',
            'phone' => $payload['phone'] ?? '',
        ];

        if (!empty($payload['firstName'])) {
            $update['firstname'] = $payload['firstName'];
        }
        if (!empty($payload['lastName'])) {
            $update['lastname'] = $payload['lastName'];
        }
        if (!empty($payload['email'])) {
            $update['email'] = $payload['email'];
        }

        $affected = DB::table($donorTable)
            ->where('id', $donor)
            ->update($update);

        if ($affected === 0) {
            return response()->json([
                'success' => false,
                'error' => 'Donor not found or not updated',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Donor updated successfully',
        ]);
    }

    public function donations(int $donor): JsonResponse
    {
        $transactionsTable = TableResolver::prefixed('transactions');
        $transactionDetailsTable = TableResolver::prefixed('transaction_details');
        $appealTable = TableResolver::prefixed('appeal');
        $amountTable = TableResolver::prefixed('amount');
        $fundlistTable = TableResolver::prefixed('fundlist');

        $transactions = DB::table($transactionsTable)
            ->where('DID', $donor)
            ->orderByDesc('date')
            ->get(['id', 'order_id', 'totalamount', 'paymenttype', 'status', 'date', 'currency']);

        $donations = $transactions->map(function ($t) use ($transactionDetailsTable, $appealTable, $amountTable, $fundlistTable) {
            $details = DB::table($transactionDetailsTable . ' as td')
                ->leftJoin($appealTable . ' as a', 'td.appeal_id', '=', 'a.id')
                ->leftJoin($amountTable . ' as am', 'td.amount_id', '=', 'am.id')
                ->leftJoin($fundlistTable . ' as f', 'td.fundlist_id', '=', 'f.id')
                ->where('td.TID', $t->id)
                ->get([
                    'td.appeal_id',
                    'td.amount_id',
                    'td.fundlist_id',
                    'td.amount',
                    'td.quantity',
                    'td.freq',
                    'a.name as appeal_name',
                    'am.name as amount_name',
                    'f.name as fund_name',
                ])
                ->map(function ($d) {
                    $frequencyMap = [
                        '0' => 'Single',
                        '1' => 'Monthly',
                        '2' => 'Yearly',
                        '3' => 'Daily',
                    ];
                    return [
                        'appealId' => (int)($d->appeal_id ?? 0),
                        'appealName' => $d->appeal_name ?? '',
                        'amountId' => (int)($d->amount_id ?? 0),
                        'amountName' => $d->amount_name ?? '',
                        'fundId' => (int)($d->fundlist_id ?? 0),
                        'fundName' => $d->fund_name ?? '',
                        'amount' => (float)($d->amount ?? 0),
                        'quantity' => (int)($d->quantity ?? 1),
                        'frequency' => $frequencyMap[$d->freq ?? '0'] ?? 'Single',
                        'frequencyCode' => $d->freq ?? '0',
                    ];
                });

            return [
                'id' => (int)$t->id,
                'orderId' => $t->order_id ?? '',
                'totalAmount' => (float)$t->totalamount,
                'paymentType' => $t->paymenttype ?? '',
                'status' => $t->status ?? '',
                'date' => $t->date ?? '',
                'currency' => $t->currency ?? 'USD',
                'details' => $details,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $donations,
            'count' => $donations->count(),
            'message' => 'Retrieved donor donations',
        ]);
    }

    public function subscriptions(int $donor): JsonResponse
    {
        $scheduleTable = TableResolver::prefixed('schedule');
        $transactionsTable = TableResolver::prefixed('transactions');
        $transactionDetailsTable = TableResolver::prefixed('transaction_details');
        $appealTable = TableResolver::prefixed('appeal');
        $amountTable = TableResolver::prefixed('amount');
        $fundlistTable = TableResolver::prefixed('fundlist');

        $schedules = DB::table($scheduleTable)
            ->where('did', $donor)
            ->orderByDesc('id')
            ->get();

        $subscriptions = $schedules->map(function ($s) use ($transactionsTable, $transactionDetailsTable, $appealTable, $amountTable, $fundlistTable) {
            $subId = $s->sub_id ?? '';
            $details = collect();

            if ($subId) {
                $details = DB::table($transactionsTable . ' as t')
                    ->leftJoin($transactionDetailsTable . ' as td', 't.id', '=', 'td.TID')
                    ->leftJoin($appealTable . ' as a', 'td.appeal_id', '=', 'a.id')
                    ->leftJoin($amountTable . ' as am', 'td.amount_id', '=', 'am.id')
                    ->leftJoin($fundlistTable . ' as f', 'td.fundlist_id', '=', 'f.id')
                    ->where('t.order_id', 'like', '%' . $subId . '%')
                    ->orderByDesc('t.date')
                    ->limit(1)
                    ->get([
                        't.id as transaction_id',
                        't.order_id',
                        't.totalamount',
                        't.date',
                        'td.appeal_id',
                        'td.amount_id',
                        'td.fundlist_id',
                        'td.amount',
                        'td.quantity',
                        'td.freq',
                        'a.name as appeal_name',
                        'am.name as amount_name',
                        'f.name as fund_name',
                    ])
                    ->map(function ($d) {
                        $frequencyMap = [
                            '0' => 'Single',
                            '1' => 'Monthly',
                            '2' => 'Yearly',
                            '3' => 'Daily',
                        ];
                        return [
                            'transactionId' => (int)($d->transaction_id ?? 0),
                            'orderId' => $d->order_id ?? '',
                            'totalAmount' => (float)($d->totalamount ?? 0),
                            'date' => $d->date ?? '',
                            'appealId' => (int)($d->appeal_id ?? 0),
                            'appealName' => $d->appeal_name ?? '',
                            'amountId' => (int)($d->amount_id ?? 0),
                            'amountName' => $d->amount_name ?? '',
                            'fundId' => (int)($d->fundlist_id ?? 0),
                            'fundName' => $d->fund_name ?? '',
                            'amount' => (float)($d->amount ?? 0),
                            'quantity' => (int)($d->quantity ?? 1),
                            'frequency' => $frequencyMap[$d->freq ?? '0'] ?? 'Single',
                            'frequencyCode' => $d->freq ?? '0',
                        ];
                    });
            }

            return [
                'id' => (int)$s->id,
                'stripeId' => $s->sub_id ?? '',
                'subscriptionId' => $s->order_id ?? '',
                'status' => $s->status ?? '',
                'nextBillingDate' => $s->nextrun_date ?? '',
                'createdAt' => $s->startdate ?? ($s->date ?? ''),
                'updatedAt' => $s->date ?? '',
                'amount' => $s->amount ?? '',
                'quantity' => $s->quantity ?? '',
                'frequency' => $s->frequency ?? '',
                'remainingCount' => $s->remainingcount ?? '',
                'totalCount' => $s->totalcount ?? '',
                'details' => $details,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $subscriptions,
            'count' => $subscriptions->count(),
            'message' => 'Retrieved donor subscriptions',
        ]);
    }
}
