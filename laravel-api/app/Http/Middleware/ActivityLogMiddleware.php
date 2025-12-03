<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ActivityLogMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Placeholder for future logging implementation
        return $next($request);
    }
}
