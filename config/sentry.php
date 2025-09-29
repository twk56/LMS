<?php

return [
    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),
    
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.2),
    
    'profiles_sample_rate' => env('SENTRY_PROFILES_SAMPLE_RATE', 0.2),
    
    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),
    
    'breadcrumbs' => [
        'logs' => env('SENTRY_BREADCRUMBS_LOGS', true),
        'sql_queries' => env('SENTRY_BREADCRUMBS_SQL_QUERIES', true),
        'sql_bindings' => env('SENTRY_BREADCRUMBS_SQL_BINDINGS', true),
        'queue_info' => env('SENTRY_BREADCRUMBS_QUEUE_INFO', true),
        'command_info' => env('SENTRY_BREADCRUMBS_COMMAND_INFO', true),
    ],
    
    'ignore_exceptions' => [
        \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException::class,
    ],
    
    'ignore_transactions' => [
        'health',
        'metrics',
    ],
    
    // Commented out to fix configuration cache issue
    // 'before_send' => function (\Sentry\Event $event): ?\Sentry\Event {
    //     // Filter out sensitive data
    //     if (isset($event->getUser()['email'])) {
    //         $event->getUser()['email'] = '***@***.***';
    //     }
    //     
    //     return $event;
    // },
];
