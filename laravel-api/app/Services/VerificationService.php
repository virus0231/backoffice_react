<?php

namespace App\Services;

use App\Repositories\Contracts\VerificationRepositoryInterface;

class VerificationService
{
    public function __construct(
        private readonly VerificationRepositoryInterface $verificationRepository
    ) {
    }

    public function verify(array $data): array
    {
        $result = $this->verificationRepository->verify($data);

        return [
            'success' => true,
            'data' => $result,
            'message' => 'Verification queued',
            'error' => null,
        ];
    }
}
