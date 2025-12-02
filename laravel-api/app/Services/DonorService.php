<?php

namespace App\Services;

use App\Models\Donor;
use App\Repositories\Contracts\DonorRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class DonorService
{
    public function __construct(
        protected DonorRepositoryInterface $donors
    ) {
    }

    public function getPaginatedDonors(array $filters = [], int $perPage = 50): LengthAwarePaginator
    {
        return $this->donors->paginateWithFilters($filters, $perPage);
    }

    public function getDonorById(int $id): ?Donor
    {
        $result = $this->donors->findById($id);
        return $result instanceof Donor ? $result : null;
    }

    public function createDonor(array $data): Donor
    {
        return DB::transaction(function () use ($data) {
            $result = $this->donors->create($this->mapInputToAttributes($data));
            return $result instanceof Donor ? $result : throw new \RuntimeException("Failed to create donor");
        });
    }

    public function updateDonor(int $id, array $data): ?Donor
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $result = $this->donors->update($id, $this->mapInputToAttributes($data));
                return $result instanceof Donor ? $result : null;
            } catch (\InvalidArgumentException $e) {
                return null;
            }
        });
    }

    public function deleteDonor(int $id): bool
    {
        return DB::transaction(fn () => $this->donors->delete($id));
    }

    public function searchDonors(string $term, int $limit = 25): Collection
    {
        return $this->donors->search($term, $limit);
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

    protected function mapInputToAttributes(array $data): array
    {
        return [
            'fourdigit' => $data['fourdigit'] ?? null,
            'stripe_id' => $data['stripe_id'] ?? null,
            'email' => $data['email'] ?? null,
            'firstname' => $data['firstName'] ?? $data['firstname'] ?? null,
            'lastname' => $data['lastName'] ?? $data['lastname'] ?? null,
            'add1' => $data['address1'] ?? $data['street'] ?? $data['add1'] ?? null,
            'add2' => $data['address2'] ?? $data['state'] ?? $data['add2'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? null,
            'postcode' => $data['postcode'] ?? null,
            'phone' => $data['phone'] ?? null,
            'organization' => $data['organization'] ?? null,
            'Date_Added' => $data['dateAdded'] ?? $data['Date_Added'] ?? null,
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
