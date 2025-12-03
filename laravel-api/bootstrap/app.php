<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Removed statefulApi() to use Bearer token authentication only
        $middleware->append(HandleCors::class);

        // Disable auth redirect for API routes
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('api/*')) {
                throw new \Illuminate\Auth\AuthenticationException('Unauthenticated');
            }
            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON responses for API routes
        $exceptions->shouldRenderJsonWhen(function ($request) {
            return $request->is('api/*');
        });

        // Handle unauthenticated API requests
        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                    'error' => 'authentication'
                ], 401);
            }
        });
    })->create();
