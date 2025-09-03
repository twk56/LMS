<?php

namespace App\Services;

use Aws\S3\S3Client;
use Aws\CloudFront\CloudFrontClient;
use Aws\MediaConvert\MediaConvertClient;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VideoService
{
    protected S3Client $s3Client;
    protected CloudFrontClient $cloudFrontClient;
    protected MediaConvertClient $mediaConvertClient;

    public function __construct()
    {
        // Only initialize AWS clients if credentials are configured
        if (config('aws.credentials.key') && config('aws.credentials.secret')) {
            $this->s3Client = new S3Client([
                'version' => 'latest',
                'region' => config('aws.s3.region'),
                'credentials' => [
                    'key' => config('aws.credentials.key'),
                    'secret' => config('aws.credentials.secret'),
                ],
            ]);

            $this->cloudFrontClient = new CloudFrontClient([
                'version' => 'latest',
                'region' => config('aws.region'),
                'credentials' => [
                    'key' => config('aws.credentials.key'),
                    'secret' => config('aws.credentials.secret'),
                ],
            ]);

            if (config('aws.media_convert.endpoint')) {
                $this->mediaConvertClient = new MediaConvertClient([
                    'version' => 'latest',
                    'region' => config('aws.region'),
                    'endpoint' => config('aws.media_convert.endpoint'),
                    'credentials' => [
                        'key' => config('aws.credentials.key'),
                        'secret' => config('aws.credentials.secret'),
                    ],
                ]);
            }
        }
    }

    /**
     * Upload video to S3
     */
    public function uploadVideo($file, string $path = 'videos'): array
    {
        if (!isset($this->s3Client)) {
            throw new \Exception('AWS S3 client not configured. Please set AWS credentials.');
        }

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $fullPath = $path . '/' . $filename;

        $result = $this->s3Client->putObject([
            'Bucket' => config('aws.s3.bucket'),
            'Key' => $fullPath,
            'Body' => fopen($file->getRealPath(), 'r'),
            'ContentType' => $file->getMimeType(),
            'ACL' => 'private',
        ]);

        return [
            'key' => $fullPath,
            'url' => $result['ObjectURL'],
            'filename' => $filename,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    /**
     * Generate CloudFront signed URL for private content
     */
    public function generateSignedUrl(string $key, int $expires = 3600): string
    {
        if (!config('aws.cloudfront.private_key_path') || !config('aws.cloudfront.key_pair_id')) {
            return $this->getPublicUrl($key);
        }

        $resourceKey = config('aws.cloudfront.domain') . '/' . $key;
        $expires = time() + $expires;

        $signature = $this->generateSignature($resourceKey, $expires);

        return config('aws.cloudfront.domain') . '/' . $key . '?' . http_build_query([
            'Expires' => $expires,
            'Key-Pair-Id' => config('aws.cloudfront.key_pair_id'),
            'Signature' => $signature,
        ]);
    }

    /**
     * Get public URL for public content
     */
    public function getPublicUrl(string $key): string
    {
        return config('aws.cloudfront.domain') . '/' . $key;
    }

    /**
     * Generate CloudFront signature
     */
    protected function generateSignature(string $resource, int $expires): string
    {
        $privateKey = file_get_contents(config('aws.cloudfront.private_key_path'));
        
        $policy = json_encode([
            'Statement' => [
                [
                    'Resource' => $resource,
                    'Condition' => [
                        'DateLessThan' => [
                            'AWS:EpochTime' => $expires,
                        ],
                    ],
                ],
            ],
        ]);

        $signature = '';
        openssl_sign($policy, $signature, $privateKey, OPENSSL_ALGO_SHA1);
        
        return strtr(base64_encode($signature), '+=/', '-_~');
    }

    /**
     * Transcode video using MediaConvert
     */
    public function transcodeVideo(string $inputKey, array $outputs = []): ?string
    {
        if (!isset($this->mediaConvertClient)) {
            return null;
        }

        $defaultOutputs = [
            'mp4_720p' => [
                'NameModifier' => '_720p',
                'OutputGroupSettings' => [
                    'Type' => 'FILE_GROUP_SETTINGS',
                    'FileGroupSettings' => [
                        'Destination' => 's3://' . config('aws.s3.bucket') . '/transcoded/',
                    ],
                ],
                'VideoDescription' => [
                    'Width' => 1280,
                    'Height' => 720,
                    'CodecSettings' => [
                        'Codec' => 'H_264',
                        'H264Settings' => [
                            'Profile' => 'MAIN',
                            'Level' => 'AUTO',
                            'MaxBitrate' => 2000000,
                        ],
                    ],
                ],
                'AudioDescription' => [
                    'CodecSettings' => [
                        'Codec' => 'AAC',
                        'AacSettings' => [
                            'Profile' => 'LC',
                            'Bitrate' => 128000,
                        ],
                    ],
                ],
            ],
        ];

        $outputs = array_merge($defaultOutputs, $outputs);

        $result = $this->mediaConvertClient->createJob([
            'Role' => config('aws.media_convert.role_arn'),
            'Queue' => config('aws.media_convert.queue_arn'),
            'Settings' => [
                'Inputs' => [
                    [
                        'FileInput' => 's3://' . config('aws.s3.bucket') . '/' . $inputKey,
                    ],
                ],
                'OutputGroups' => array_map(function ($output, $key) {
                    return array_merge($output, [
                        'Name' => $key,
                        'Outputs' => [$output],
                    ]);
                }, $outputs, array_keys($outputs)),
            ],
        ]);

        return $result['Job']['Id'] ?? null;
    }

    /**
     * Delete video from S3
     */
    public function deleteVideo(string $key): bool
    {
        try {
            $this->s3Client->deleteObject([
                'Bucket' => config('aws.s3.bucket'),
                'Key' => $key,
            ]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get video metadata
     */
    public function getVideoMetadata(string $key): array
    {
        try {
            $result = $this->s3Client->headObject([
                'Bucket' => config('aws.s3.bucket'),
                'Key' => $key,
            ]);

            return [
                'size' => $result['ContentLength'] ?? 0,
                'mime_type' => $result['ContentType'] ?? '',
                'last_modified' => $result['LastModified'] ?? null,
                'etag' => $result['ETag'] ?? '',
            ];
        } catch (\Exception $e) {
            return [];
        }
    }
}
