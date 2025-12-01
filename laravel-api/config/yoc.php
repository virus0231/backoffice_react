<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Legacy Table Prefixes
    |--------------------------------------------------------------------------
    | Many endpoints need to work against either pw_* or wp_yoc_* tables.
    | Set these from .env so the same build works across environments.
    */
    'prefix_primary' => env('DB_PREFIX_PRIMARY', 'pw_'),
    'prefix_fallback' => env('DB_PREFIX_FALLBACK', 'wp_yoc_'),
];
