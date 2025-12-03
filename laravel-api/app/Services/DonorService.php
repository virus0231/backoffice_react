<?php

namespace App\Services;

use App\Repositories\Contracts\DonorRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DonorService
{
    public function __construct(
        protected DonorRepositoryInterface $donorRepository
    ) {
    }

    public function getPaginatedDonors(array $params): array
    {
        $limit = (int) ($params['limit'] ?? 50);
        $limit = $limit > 0 ? min($limit, 200) : 50;

        $offset = (int) ($params['offset'] ?? 0);
        if ($offset < 0) {
            $offset = 0;
        }

        if (isset($params['page']) && $params['page'] > 0) {
            $offset = ((int) $params['page'] - 1) * $limit;
        }

        $search = trim((string) ($params['search'] ?? $params['email'] ?? ''));

        $result = $this->donorRepository->getPaginatedDonors($offset, $limit, $search);
        $data = collect($result['data'] ?? [])->map(fn ($r) => $this->formatDonorRow($r));

        $count = $data->count();
        $totalCount = $result['totalCount'] ?? null;
        if ($totalCount === null) {
            $totalCount = $offset === 0 ? $count : $offset + $count;
        }

        $currentPage = (int) floor($offset / $limit) + 1;
        $totalPages = $totalCount > 0 ? (int) ceil($totalCount / $limit) : $currentPage;
        $hasNext = ($offset + $count) < $totalCount;
        $hasPrev = $offset > 0;

        return [
            'success' => true,
            'data' => $data->all(),
            'pagination' => [
                'currentPage' => $currentPage,
                'totalPages' => $totalPages,
                'totalCount' => $totalCount,
                'perPage' => $limit,
                'hasNext' => $hasNext,
                'hasPrev' => $hasPrev,
            ],
            'count' => $count,
            'message' => $search !== '' ? 'Retrieved matching donors' : 'Retrieved paginated donors',
            'error' => null,
        ];
    }

    public function getDonorById(int $id): array
    {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'id is required', 'error' => 'validation'];
        }

        $donor = $this->donorRepository->findDonorById($id);
        if (! $donor) {
            return ['success' => false, 'message' => 'Donor not found', 'error' => 'not_found'];
        }

        return [
            'success' => true,
            'data' => $this->formatDonorRow($donor),
            'message' => 'Retrieved donor details',
            'error' => null,
        ];
    }

    public function createDonor(array $data): array
    {
        $payload = $this->mapInputToAttributes($data);
        $validation = $this->validateRequiredFields($payload);
        if ($validation !== null) {
            return ['success' => false, 'message' => $validation, 'error' => 'validation'];
        }

        $id = $this->donorRepository->createDonor($payload);
        $fresh = $this->donorRepository->findDonorById($id);

        return [
            'success' => true,
            'data' => $fresh ? $this->formatDonorRow($fresh) : null,
            'message' => 'Donor created successfully',
            'error' => null,
        ];
    }

    public function updateDonor(int $id, array $data): array
    {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'id is required', 'error' => 'validation'];
        }

        $existing = $this->donorRepository->findDonorById($id);
        if (! $existing) {
            return ['success' => false, 'message' => 'Donor not found', 'error' => 'not_found'];
        }

        $payload = $this->mapInputToAttributes($data, $existing);
        $validation = $this->validateRequiredFields($payload);
        if ($validation !== null) {
            return ['success' => false, 'message' => $validation, 'error' => 'validation'];
        }

        $this->donorRepository->updateDonor($id, $payload);
        $fresh = $this->donorRepository->findDonorById($id);

        return [
            'success' => true,
            'data' => $fresh ? $this->formatDonorRow($fresh) : null,
            'message' => 'Donor updated successfully',
            'error' => null,
        ];
    }

    public function deleteDonor(int $id): bool
    {
        if ($id <= 0) {
            return false;
        }

        $existing = $this->donorRepository->findDonorById($id);
        if (! $existing) {
            return false;
        }

        return $this->donorRepository->delete($id);
    }

    public function getDonorDonations(int $donorId): Collection
    {
        $transactionsTable = TableResolver::prefixed('transactions');
        $transactionDetailsTable = TableResolver::prefixed('transaction_details');
        $appealTable = TableResolver::prefixed('appeal');
        $amountTable = TableResolver::prefixed('amount');
        $fundlistTable = TableResolver::prefixed('fundlist');

        $transactions = DB::table($transactionsTable)
            ->where('DID', $donorId)
            ->orderByDesc('date')
            ->get(['id', 'order_id', 'totalamount', 'paymenttype', 'status', 'date', 'currency']);

        return $transactions->map(function ($t) use ($transactionDetailsTable, $appealTable, $amountTable, $fundlistTable) {
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
                ->map(fn ($d) => [
                    'appealId' => (int)($d->appeal_id ?? 0),
                    'appealName' => $d->appeal_name ?? '',
                    'amountId' => (int)($d->amount_id ?? 0),
                    'amountName' => $d->amount_name ?? '',
                    'fundId' => (int)($d->fundlist_id ?? 0),
                    'fundName' => $d->fund_name ?? '',
                    'amount' => (float)($d->amount ?? 0),
                    'quantity' => (int)($d->quantity ?? 1),
                    'frequency' => $this->mapFrequency($d->freq ?? '0'),
                    'frequencyCode' => $d->freq ?? '0',
                ]);

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
    }

    public function getDonorSubscriptions(int $donorId): Collection
    {
        $scheduleTable = TableResolver::prefixed('schedule');
        $transactionsTable = TableResolver::prefixed('transactions');
        $transactionDetailsTable = TableResolver::prefixed('transaction_details');
        $appealTable = TableResolver::prefixed('appeal');
        $amountTable = TableResolver::prefixed('amount');
        $fundlistTable = TableResolver::prefixed('fundlist');

        $schedules = DB::table($scheduleTable)
            ->where('did', $donorId)
            ->orderByDesc('id')
            ->get();

        return $schedules->map(function ($s) use ($transactionsTable, $transactionDetailsTable, $appealTable, $amountTable, $fundlistTable) {
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
                    ->map(fn ($d) => [
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
                        'frequency' => $this->mapFrequency($d->freq ?? '0'),
                        'frequencyCode' => $d->freq ?? '0',
                    ]);
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
    }

    protected function mapInputToAttributes(array $data, ?object $existing = null): array
    {
        $value = function (string $key, array $alts = []) use ($data, $existing) {
            foreach (array_merge([$key], $alts) as $k) {
                if (array_key_exists($k, $data)) {
                    return is_string($data[$k]) ? trim((string) $data[$k]) : $data[$k];
                }
            }
            return $existing->{$key} ?? null;
        };

        return [
            'fourdigit' => $value('fourdigit'),
            'stripe_id' => $value('stripe_id'),
            'email' => $value('email'),
            'firstname' => $value('firstname', ['firstName']),
            'lastname' => $value('lastname', ['lastName']),
            'add1' => $value('add1', ['address1', 'street']),
            'add2' => $value('add2', ['address2', 'state']),
            'city' => $value('city'),
            'country' => $value('country'),
            'postcode' => $value('postcode'),
            'phone' => $value('phone'),
            'organization' => $value('organization'),
            'Date_Added' => $value('Date_Added', ['dateAdded']) ?? ($existing?->Date_Added ?? now()->toDateTimeString()),
        ];
    }

    protected function validateRequiredFields(array $payload): ?string
    {
        $required = [
            'firstname' => 'first_name',
            'lastname' => 'last_name',
            'email' => 'email',
        ];

        foreach ($required as $key => $label) {
            $val = trim((string) ($payload[$key] ?? ''));
            if ($val === '') {
                return $label . ' is required';
            }
        }

        if (isset($payload['email']) && !filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) {
            return 'email is invalid';
        }

        return null;
    }

    protected function formatDonorRow(object $donor): array
    {
        return [
            'id' => (int) ($donor->id ?? 0),
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
        ];
    }

    protected function mapFrequency(string $code): string
    {
        return [
            '0' => 'Single',
            '1' => 'Monthly',
            '2' => 'Yearly',
            '3' => 'Daily',
        ][$code] ?? 'Single';
    }
}
