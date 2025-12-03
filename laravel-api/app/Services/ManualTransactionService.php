<?php

namespace App\Services;

use App\Repositories\Contracts\DonorRepositoryInterface;
use App\Repositories\Contracts\TransactionDetailRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\ScheduleRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ManualTransactionService
{
    public function __construct(
        private readonly DonorRepositoryInterface $donorRepository,
        private readonly TransactionRepositoryInterface $transactionRepository,
        private readonly TransactionDetailRepositoryInterface $transactionDetailRepository,
        private readonly ScheduleRepositoryInterface $scheduleRepository
    ) {
    }

    public function createManualTransaction(array $data): array
    {
        try {
            DB::beginTransaction();

            $donor = $this->getOrCreateDonor($data);
            if (!$donor) {
                throw new Exception('Failed to get or create donor');
            }

            $totalAmount = 0;
            $transactionDetails = [];

            foreach ($data['items'] as $item) {
                $itemTotal = $item['amount'] * $item['quantity'];
                $totalAmount += $itemTotal;
                $transactionDetails[] = $item;
            }

            $transaction = $this->createTransaction($donor['id'], $data, $totalAmount);

            foreach ($transactionDetails as $detail) {
                $tdId = $this->createTransactionDetail($transaction['id'], $detail, $data['date']);

                if ($detail['freq'] !== 'onetime') {
                    $this->createSchedule(
                        $donor['id'],
                        $transaction['id'],
                        $tdId,
                        $transaction['tr_no'],
                        $transaction['order_id'],
                        $detail,
                        $data['date']
                    );
                }
            }

            DB::commit();

            return [
                'success' => true,
                'message' => 'Manual transaction created successfully',
                'data' => [
                    'transaction_id' => $transaction['id'],
                    'order_id' => $transaction['order_id'],
                    'tr_no' => $transaction['tr_no'],
                ],
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Manual transaction creation failed', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'error' => 'server_error',
                'message' => 'Failed to create manual transaction: ' . $e->getMessage(),
            ];
        }
    }

    private function getOrCreateDonor(array $data): ?array
    {
        $existing = $this->donorRepository->findByEmailAndLastname(
            $data['email'],
            $data['last_name']
        );

        if ($existing) {
            return ['id' => (int) ($existing['id'] ?? 0)];
        }

        $id = $this->donorRepository->createDonor([
            'firstname' => $data['first_name'],
            'lastname' => $data['last_name'],
            'email' => $data['email'],
            'add1' => $data['add1'] ?? '',
            'add2' => $data['add2'] ?? '',
            'city' => $data['city'] ?? '',
            'country' => $data['country'] ?? '',
            'state' => $data['state'] ?? '',
            'postcode' => $data['zip'] ?? '',
            'phone' => $data['phone'] ?? '',
            'fourdigit' => $data['card_digits'] ?? '',
            'stripe_id' => $data['customer_id'] ?? '',
            'Date_Added' => $data['date'],
        ]);

        return ['id' => $id];
    }

    private function createTransaction(int $donorId, array $data, float $totalAmount): array
    {
        $invoiceId = uniqid('acc-');
        $orderId = date('mdYHis', time()) . rand(0, 1000);

        $paymentIntent = $data['payment_intent'] ?? $data['charge_id'] ?? '';
        $chargeId = !empty($data['payment_intent']) ? ($data['charge_id'] ?? '') : '';

        $id = $this->transactionRepository->createTransaction([
            'DID' => $donorId,
            'TID' => $invoiceId,
            'order_id' => $orderId,
            'paya_reference' => $paymentIntent,
            'charge_id' => $chargeId,
            'paymenttype' => $data['payment_type'] ?? 'manual',
            'charge_amount' => $totalAmount,
            'totalamount' => $totalAmount,
            'refund' => 'success',
            'reason' => 'approved',
            'status' => 'completed',
            'date' => $data['date'],
        ]);

        return [
            'id' => $id,
            'tr_no' => $invoiceId,
            'order_id' => $orderId,
        ];
    }

    private function createTransactionDetail(int $transactionId, array $detail, string $date): int
    {
        $freqN = match($detail['freq']) {
            'monthly' => 1,
            'yearly' => 2,
            default => 0,
        };

        $interval = match($freqN) {
            1 => 60,
            2 => 1825,
            default => 0,
        };

        return $this->transactionDetailRepository->createTransactionDetail([
            'TID' => $transactionId,
            'appeal_id' => $detail['appeal_id'],
            'amount_id' => $detail['amount_id'] ?? 0,
            'fundlist_id' => $detail['fundlist_id'] ?? 0,
            'amount' => $detail['amount'],
            'quantity' => $detail['quantity'],
            'freq' => $freqN,
            'startdate' => $date,
            'totalcount' => $interval,
            'currency' => 'USD',
        ]);
    }

    private function createSchedule(
        int $donorId,
        int $transactionId,
        int $tdId,
        string $trNo,
        string $orderId,
        array $detail,
        string $date
    ): void {
        $isMonthly = $detail['freq'] === 'monthly';
        $interval = $isMonthly ? 1 : 12;
        $totalCount = $isMonthly ? 60 : 5;
        $remainingCount = $totalCount - 1;

        $nextRunDate = $isMonthly
            ? date('Y-m-d', strtotime('+1 month', strtotime($date)))
            : date('Y-m-d', strtotime('+12 months', strtotime($date)));

        $this->scheduleRepository->createSchedule([
            'did' => $donorId,
            'tid' => $transactionId,
            'tr_no' => $trNo,
            'td_id' => $tdId,
            'order_id' => $orderId,
            'plan_id' => $detail['plan_id'] ?? '',
            'sub_id' => $detail['sub_id'] ?? '',
            'amount' => $detail['amount'],
            'quantity' => $detail['quantity'],
            'frequency' => $detail['freq'],
            'startdate' => $date,
            'r_interval' => $interval,
            'totalcount' => $totalCount,
            'remainingcount' => $remainingCount,
            'nextrun_date' => $nextRunDate,
            'status' => 'active',
        ]);
    }
}
