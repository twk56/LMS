# 🚀 Enterprise Setup Guide

## 📋 Prerequisites

- PHP 8.2+
- Laravel 12+
- MySQL 8.0+
- Redis (optional)
- AWS Account
- Sentry Account

## 🔧 Environment Variables

Add these variables to your `.env` file:

### AWS Configuration
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1

# S3 Configuration
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1
AWS_S3_ENDPOINT=
AWS_S3_USE_PATH_STYLE_ENDPOINT=false

# CloudFront Configuration
AWS_CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
AWS_CLOUDFRONT_PRIVATE_KEY_PATH=/path/to/private/key.pem
AWS_CLOUDFRONT_KEY_PAIR_ID=your_key_pair_id

# MediaConvert Configuration
AWS_MEDIA_CONVERT_ENDPOINT=https://mediaconvert.us-east-1.amazonaws.com
AWS_MEDIA_CONVERT_ROLE_ARN=arn:aws:iam::account:role/MediaConvert_Role
AWS_MEDIA_CONVERT_QUEUE_ARN=arn:aws:mediaconvert:us-east-1:account:queues/Default

# Elastic Transcoder (Alternative)
AWS_ELASTIC_TRANSCODER_PIPELINE_ID=your_pipeline_id
```

### Sentry Configuration
```bash
SENTRY_LARAVEL_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=0.2
SENTRY_PROFILES_SAMPLE_RATE=0.2
SENTRY_SEND_DEFAULT_PII=false
```

### Swagger Configuration
```bash
L5_SWAGGER_GENERATE_ALWAYS=true
L5_SWAGGER_UI_DOC_EXPANSION=list
L5_SWAGGER_UI_OPERATIONS_SORTER=alpha
L5_SWAGGER_UI_TAGS_SORTER=alpha
```

## 🚀 Installation Steps

### 1. Install Dependencies
```bash
composer install
npm install
```

### 2. Generate Application Key
```bash
php artisan key:generate
```

### 3. Run Migrations
```bash
php artisan migrate
```

### 4. Generate Swagger Documentation
```bash
php artisan l5-swagger:generate
```

### 5. Clear Cache
```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

## 🔐 AWS IAM Setup

### S3 Bucket Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PrivateAccess",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": "arn:aws:s3:::your-bucket-name/*",
            "Condition": {
                "StringNotEquals": {
                    "aws:PrincipalArn": "arn:aws:iam::account:role/your-role"
                }
            }
        }
    ]
}
```

### MediaConvert Role
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "mediaconvert:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## 📱 Video Streaming Setup

### 1. Create S3 Bucket
```bash
aws s3 mb s3://your-video-bucket
aws s3api put-bucket-cors --bucket your-video-bucket --cors-configuration file://cors.json
```

### 2. CORS Configuration (cors.json)
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### 3. CloudFront Distribution
- Create CloudFront distribution
- Set S3 bucket as origin
- Configure behaviors for video files
- Set up signed URLs for private content

## 📊 Monitoring Setup

### 1. Sentry
- Create project in Sentry
- Get DSN from project settings
- Configure environment variables
- Test error reporting

### 2. Application Monitoring
- Set up performance monitoring
- Configure alerting rules
- Monitor error rates and response times

## 🧪 Testing

### 1. Test Video Upload
```bash
curl -X POST http://localhost:8000/videos \
  -H "Authorization: Bearer your-token" \
  -F "video=@test-video.mp4" \
  -F "title=Test Video" \
  -F "description=Test Description"
```

### 2. Test Video Streaming
```bash
curl -X GET http://localhost:8000/videos/stream/video-key
```

### 3. Test API Documentation
```bash
curl -X GET http://localhost:8000/api/documentation
```

## 🔍 Troubleshooting

### Common Issues

1. **AWS Credentials Error**
   - Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   - Check IAM permissions

2. **S3 Upload Fails**
   - Verify bucket exists and is accessible
   - Check bucket policy and CORS settings

3. **CloudFront Signed URLs Not Working**
   - Verify private key file path
   - Check key pair ID configuration

4. **Sentry Not Reporting**
   - Verify DSN configuration
   - Check network connectivity

### Debug Commands
```bash
# Check AWS configuration
php artisan tinker
config('aws')

# Check Sentry configuration
config('sentry')

# Generate Swagger docs
php artisan l5-swagger:generate

# Clear all caches
php artisan optimize:clear
```

## 📈 Performance Optimization

### 1. Video Processing
- Use MediaConvert for large files
- Implement chunked uploads
- Cache transcoded videos

### 2. CDN Optimization
- Configure CloudFront caching
- Use signed URLs for security
- Implement adaptive bitrate streaming

### 3. Database Optimization
- Add indexes for video queries
- Implement pagination
- Use database connection pooling

## 🔒 Security Considerations

### 1. Access Control
- Implement proper authentication
- Use signed URLs for private content
- Validate file uploads

### 2. Data Protection
- Encrypt sensitive data
- Implement audit logging
- Regular security updates

### 3. Network Security
- Use HTTPS everywhere
- Implement rate limiting
- Monitor for suspicious activity

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS MediaConvert Documentation](https://docs.aws.amazon.com/mediaconvert/)
- [Sentry Documentation](https://docs.sentry.io/)
- [L5-Swagger Documentation](https://github.com/DarkaOnLine/L5-Swagger)
