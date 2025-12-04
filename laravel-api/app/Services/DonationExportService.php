<?php

namespace App\Services;

use App\Repositories\Contracts\DonationExportRepositoryInterface;

class DonationExportService
{
    public function __construct(
        protected DonationExportRepositoryInterface $donationExportRepository
    ) {
    }

    public function getData(array $params): mixed
    {
        $filters = $this->mapFilters($params);

        if (array_key_exists('loadData', $params)) {
            $offset = (int) $params['loadData'];
            $limit = min((int) ($params['chunkSize'] ?? 50), 1000);
            $data = $this->donationExportRepository->getPaginatedData($filters, $offset, $limit);

            if ($data instanceof \Illuminate\Support\Collection && $data->isNotEmpty()) {
                $ids = $data->pluck('id')->unique()->values()->all();
                $details = $this->donationExportRepository
                    ->getDetailsForTransactions($filters, $ids)
                    ->groupBy('transaction_id');

                $data = $data->map(function ($item) use ($details) {
                    $item->details = ($details[$item->id] ?? collect())->values()->all();
                    return $item;
                });
            }

            return $data;
        }

        return $this->donationExportRepository->getCountWithFilters($filters);
    }

    public function generateSummaryCsv(array $params): array
    {
        $filters = $this->mapFilters($params);
        $rows = $this->donationExportRepository->getSummaryData($filters);

        $csvRows = [];
        $i = 1;
        foreach ($rows as $row) {
            $csvRows[] = [
                $i++,
                $row->date,
                $row->firstname,
                $row->lastname,
                $row->email,
                $row->phone,
                $row->city,
                $row->country,
                $row->state,
                $row->postcode,
                $row->card_fee,
                $row->totalamount,
                $row->charge_amount,
                $row->TID,
                $row->order_id,
                $row->status,
                $row->notes,
            ];
        }

        return $csvRows;
    }

    public function generateDetailCsv(array $params): array
    {
        $filters = $this->mapFilters($params);
        $rows = $this->donationExportRepository->getDetailData($filters);

        $csvRows = [];
        $i = 1;
        foreach ($rows as $row) {
            $sub = ($row->amount ?? 0) * ($row->quantity ?? 0);
            $card = ($row->card_fee ?? 0) != 0 ? ($sub * 0.03) : 0;
            $freqLabel = $this->mapFrequency((string) $row->freq);

            $csvRows[] = [
                $i++,
                $row->date,
                $row->appeal_name,
                $row->amount_name,
                $row->fund_name,
                $row->order_id,
                $freqLabel,
                $row->TID,
                $row->amount,
                $row->quantity,
                $sub,
                $card,
                $sub + $card,
                $row->firstname,
                $row->lastname,
                $row->email,
                $row->phone,
                $row->add1,
                $row->city,
                $row->country,
                $row->add2,
                $row->postcode,
                $row->notes,
                $row->paymenttype,
                $row->status,
            ];
        }

        return $csvRows;
    }

    protected function mapFilters(array $params): array
    {
        $donationType = $params['donationType'] ?? [];
        if (!is_array($donationType)) {
            $donationType = [$donationType];
        }

        return [
            'startDate' => $params['startDate'] ?? null,
            'endDate' => $params['endDate'] ?? null,
            'status' => (string) ($params['status'] ?? '0'),
            'paymentType' => (string) ($params['paymentType'] ?? '0'),
            'frequency' => (string) ($params['frequency'] ?? ''),
            'txtsearch' => (string) ($params['txtsearch'] ?? ''),
            'orderid' => (string) ($params['orderid'] ?? ''),
            'donationType' => array_values(array_filter(array_map('intval', $donationType))),
        ];
    }

    protected function mapFrequency(string $code): string
    {
        return match ($code) {
            '0' => 'One-Off',
            '1' => 'Monthly',
            '2' => 'Yearly',
            '3' => 'Daily',
            default => $code,
        };
    }
}
