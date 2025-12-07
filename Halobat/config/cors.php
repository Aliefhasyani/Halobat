<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    // Allow your local frontend during development. Add your production
    // frontend origin(s) here when deploying (do NOT use '*').
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // Production frontend origin (allow cookies / CSRF requests)
        'https://halobat-frontend.up.railway.app/',
        'https://halobat-production-1441.up.railway.app/',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,
    // Enable credentials so the browser will accept `Set-Cookie` and
    // send cookies on subsequent requests (required for cookie-based auth).
    'supports_credentials' => true,

];
