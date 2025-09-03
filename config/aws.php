<?php

return [
    'credentials' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
    ],
    
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    
    'version' => 'latest',
    
    's3' => [
        'bucket' => env('AWS_S3_BUCKET'),
        'region' => env('AWS_S3_REGION', env('AWS_DEFAULT_REGION', 'us-east-1')),
        'endpoint' => env('AWS_S3_ENDPOINT'),
        'use_path_style_endpoint' => env('AWS_S3_USE_PATH_STYLE_ENDPOINT', false),
    ],
    
    'cloudfront' => [
        'distribution_id' => env('AWS_CLOUDFRONT_DISTRIBUTION_ID'),
        'domain' => env('AWS_CLOUDFRONT_DOMAIN'),
        'private_key_path' => env('AWS_CLOUDFRONT_PRIVATE_KEY_PATH'),
        'key_pair_id' => env('AWS_CLOUDFRONT_KEY_PAIR_ID'),
    ],
    
    'media_convert' => [
        'endpoint' => env('AWS_MEDIA_CONVERT_ENDPOINT'),
        'role_arn' => env('AWS_MEDIA_CONVERT_ROLE_ARN'),
        'queue_arn' => env('AWS_MEDIA_CONVERT_QUEUE_ARN'),
    ],
    
    'elastic_transcoder' => [
        'pipeline_id' => env('AWS_ELASTIC_TRANSCODER_PIPELINE_ID'),
    ],
];
