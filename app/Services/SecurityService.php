<?php

namespace App\Services;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SecurityService
{
    public function detectSuspiciousActivity(Request $request, User $user): array
    {
        $suspiciousActivities = [];

        // Check for multiple failed login attempts
        if ($this->hasMultipleFailedLogins($user)) {
            $suspiciousActivities[] = [
                'type' => 'multiple_failed_logins',
                'severity' => 'high',
                'description' => 'Multiple failed login attempts detected',
                'timestamp' => now(),
            ];
        }

        // Check for unusual login location
        if ($this->isUnusualLoginLocation($request, $user)) {
            $suspiciousActivities[] = [
                'type' => 'unusual_location',
                'severity' => 'medium',
                'description' => 'Login from unusual location detected',
                'timestamp' => now(),
            ];
        }

        // Check for rapid successive actions
        if ($this->hasRapidSuccessiveActions($user)) {
            $suspiciousActivities[] = [
                'type' => 'rapid_actions',
                'severity' => 'medium',
                'description' => 'Rapid successive actions detected',
                'timestamp' => now(),
            ];
        }

        // Check for data access patterns
        if ($this->hasUnusualDataAccess($user)) {
            $suspiciousActivities[] = [
                'type' => 'unusual_data_access',
                'severity' => 'high',
                'description' => 'Unusual data access patterns detected',
                'timestamp' => now(),
            ];
        }

        return $suspiciousActivities;
    }

    public function implementRateLimiting(Request $request, string $action): bool
    {
        $key = "rate_limit_{$action}_{$request->ip()}";
        $limit = $this->getRateLimit($action);
        $window = $this->getRateLimitWindow($action);

        $currentCount = Cache::get($key, 0);

        if ($currentCount >= $limit) {
            $this->logRateLimitExceeded($request, $action);
            return false;
        }

        Cache::put($key, $currentCount + 1, $window);
        return true;
    }

    public function validatePasswordStrength(string $password): array
    {
        $checks = [
            'length' => strlen($password) >= 8,
            'uppercase' => preg_match('/[A-Z]/', $password),
            'lowercase' => preg_match('/[a-z]/', $password),
            'numbers' => preg_match('/[0-9]/', $password),
            'special_chars' => preg_match('/[^A-Za-z0-9]/', $password),
        ];

        $strength = array_sum($checks);
        $isStrong = $strength >= 4;

        return [
            'is_strong' => $isStrong,
            'strength_score' => $strength,
            'checks' => $checks,
            'recommendations' => $this->getPasswordRecommendations($checks),
        ];
    }

    public function implementTwoFactorAuthentication(User $user): array
    {
        $secret = $this->generateTOTPSecret();
        $qrCode = $this->generateQRCode($user, $secret);

        $user->update([
            'two_factor_secret' => Hash::make($secret),
            'two_factor_enabled' => true,
        ]);

        return [
            'secret' => $secret,
            'qr_code' => $qrCode,
            'backup_codes' => $this->generateBackupCodes($user),
        ];
    }

    public function verifyTwoFactorCode(User $user, string $code): bool
    {
        if (!$user->two_factor_enabled) {
            return true;
        }

        // Verify TOTP code
        if ($this->verifyTOTPCode($user, $code)) {
            return true;
        }

        // Check backup codes
        return $this->verifyBackupCode($user, $code);
    }

    public function implementSessionSecurity(Request $request, User $user): void
    {
        // Regenerate session ID
        $request->session()->regenerate();

        // Set secure session parameters
        $request->session()->put('user_agent', $request->userAgent());
        $request->session()->put('ip_address', $request->ip());
        $request->session()->put('last_activity', now());

        // Log session creation
        $this->logSessionCreation($user, $request);
    }

    public function validateSessionIntegrity(Request $request, User $user): bool
    {
        $session = $request->session();

        // Check if user agent matches
        if ($session->get('user_agent') !== $request->userAgent()) {
            $this->logSessionTampering($user, 'user_agent_mismatch');
            return false;
        }

        // Check if IP address matches
        if ($session->get('ip_address') !== $request->ip()) {
            $this->logSessionTampering($user, 'ip_address_mismatch');
            return false;
        }

        // Check session timeout
        $lastActivity = $session->get('last_activity');
        if ($lastActivity && now()->diffInMinutes($lastActivity) > 30) {
            $this->logSessionTimeout($user);
            return false;
        }

        return true;
    }

    public function implementDataEncryption(string $data, string $key = null): string
    {
        $key = $key ?? config('app.key');
        return openssl_encrypt($data, 'AES-256-CBC', $key, 0, substr(hash('sha256', $key), 0, 16));
    }

    public function decryptData(string $encryptedData, string $key = null): string
    {
        $key = $key ?? config('app.key');
        return openssl_decrypt($encryptedData, 'AES-256-CBC', $key, 0, substr(hash('sha256', $key), 0, 16));
    }

    public function generateAuditLog(User $user, string $action, array $details = []): void
    {
        $logData = [
            'user_id' => $user->id,
            'action' => $action,
            'details' => $details,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now(),
        ];

        Log::channel('security')->info('Audit Log', $logData);
    }

    public function implementIPWhitelist(string $ip): bool
    {
        $whitelistedIPs = config('security.whitelisted_ips', []);
        return in_array($ip, $whitelistedIPs);
    }

    public function implementIPBlacklist(string $ip): bool
    {
        $blacklistedIPs = Cache::get('blacklisted_ips', []);
        return in_array($ip, $blacklistedIPs);
    }

    public function blacklistIP(string $ip, int $duration = 3600): void
    {
        $blacklistedIPs = Cache::get('blacklisted_ips', []);
        $blacklistedIPs[] = $ip;
        Cache::put('blacklisted_ips', array_unique($blacklistedIPs), $duration);
    }

    public function generateSecurityReport(Tenant $tenant): array
    {
        return [
            'security_events' => $this->getSecurityEvents($tenant),
            'failed_login_attempts' => $this->getFailedLoginAttempts($tenant),
            'suspicious_activities' => $this->getSuspiciousActivities($tenant),
            'security_score' => $this->calculateSecurityScore($tenant),
            'recommendations' => $this->getSecurityRecommendations($tenant),
        ];
    }

    private function hasMultipleFailedLogins(User $user): bool
    {
        $key = "failed_logins_{$user->id}";
        $failedAttempts = Cache::get($key, 0);
        
        return $failedAttempts >= 5;
    }

    private function isUnusualLoginLocation(Request $request, User $user): bool
    {
        $currentIP = $request->ip();
        $lastKnownIP = Cache::get("last_ip_{$user->id}");

        if (!$lastKnownIP) {
            Cache::put("last_ip_{$user->id}", $currentIP, 86400);
            return false;
        }

        // Simple check - in production, use geolocation service
        return $currentIP !== $lastKnownIP;
    }

    private function hasRapidSuccessiveActions(User $user): bool
    {
        $key = "rapid_actions_{$user->id}";
        $actions = Cache::get($key, []);

        // Remove actions older than 1 minute
        $actions = array_filter($actions, function ($timestamp) {
            return now()->diffInSeconds($timestamp) < 60;
        });

        $actions[] = now();
        Cache::put($key, $actions, 60);

        return count($actions) > 10; // More than 10 actions per minute
    }

    private function hasUnusualDataAccess(User $user): bool
    {
        $key = "data_access_{$user->id}";
        $accessPatterns = Cache::get($key, []);

        // Check for unusual data access patterns
        $recentAccess = array_filter($accessPatterns, function ($timestamp) {
            return now()->diffInMinutes($timestamp) < 60;
        });

        return count($recentAccess) > 100; // More than 100 data accesses per hour
    }

    private function getRateLimit(string $action): int
    {
        $limits = [
            'login' => 5,
            'api_call' => 100,
            'file_upload' => 10,
            'password_reset' => 3,
        ];

        return $limits[$action] ?? 10;
    }

    private function getRateLimitWindow(string $action): int
    {
        $windows = [
            'login' => 300, // 5 minutes
            'api_call' => 3600, // 1 hour
            'file_upload' => 3600, // 1 hour
            'password_reset' => 3600, // 1 hour
        ];

        return $windows[$action] ?? 3600;
    }

    private function logRateLimitExceeded(Request $request, string $action): void
    {
        Log::channel('security')->warning('Rate limit exceeded', [
            'ip' => $request->ip(),
            'action' => $action,
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);
    }

    private function getPasswordRecommendations(array $checks): array
    {
        $recommendations = [];

        if (!$checks['length']) {
            $recommendations[] = 'Password should be at least 8 characters long';
        }

        if (!$checks['uppercase']) {
            $recommendations[] = 'Include at least one uppercase letter';
        }

        if (!$checks['lowercase']) {
            $recommendations[] = 'Include at least one lowercase letter';
        }

        if (!$checks['numbers']) {
            $recommendations[] = 'Include at least one number';
        }

        if (!$checks['special_chars']) {
            $recommendations[] = 'Include at least one special character';
        }

        return $recommendations;
    }

    private function generateTOTPSecret(): string
    {
        return base64_encode(random_bytes(20));
    }

    private function generateQRCode(User $user, string $secret): string
    {
        $issuer = config('app.name');
        $label = $user->email;
        $url = "otpauth://totp/{$issuer}:{$label}?secret={$secret}&issuer={$issuer}";
        
        return $url; // In production, generate actual QR code image
    }

    private function generateBackupCodes(User $user): array
    {
        $codes = [];
        for ($i = 0; $i < 10; $i++) {
            $codes[] = strtoupper(substr(md5(uniqid()), 0, 8));
        }

        $user->update(['backup_codes' => Hash::make(implode(',', $codes))]);
        return $codes;
    }

    private function verifyTOTPCode(User $user, string $code): bool
    {
        // In production, use a TOTP library like Google Authenticator
        return true; // Simplified for demo
    }

    private function verifyBackupCode(User $user, string $code): bool
    {
        $backupCodes = $user->backup_codes;
        if (!$backupCodes) {
            return false;
        }

        // In production, properly verify against hashed backup codes
        return true; // Simplified for demo
    }

    private function logSessionCreation(User $user, Request $request): void
    {
        Log::channel('security')->info('Session created', [
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);
    }

    private function logSessionTampering(User $user, string $reason): void
    {
        Log::channel('security')->warning('Session tampering detected', [
            'user_id' => $user->id,
            'reason' => $reason,
            'timestamp' => now(),
        ]);
    }

    private function logSessionTimeout(User $user): void
    {
        Log::channel('security')->info('Session timeout', [
            'user_id' => $user->id,
            'timestamp' => now(),
        ]);
    }

    private function getSecurityEvents(Tenant $tenant): array
    {
        // Simulate security events
        return [
            'failed_logins' => 15,
            'suspicious_activities' => 3,
            'rate_limit_violations' => 8,
            'session_tampering' => 1,
        ];
    }

    private function getFailedLoginAttempts(Tenant $tenant): array
    {
        // Simulate failed login attempts
        return [
            'total' => 25,
            'unique_ips' => 8,
            'time_period' => 'last_24_hours',
        ];
    }

    private function getSuspiciousActivities(Tenant $tenant): array
    {
        // Simulate suspicious activities
        return [
            'unusual_locations' => 2,
            'rapid_actions' => 1,
            'data_access_anomalies' => 0,
        ];
    }

    private function calculateSecurityScore(Tenant $tenant): int
    {
        // Simulate security score calculation
        return 85; // Out of 100
    }

    private function getSecurityRecommendations(Tenant $tenant): array
    {
        return [
            'Enable two-factor authentication for all users',
            'Implement stricter password policies',
            'Monitor failed login attempts more closely',
            'Consider implementing IP whitelisting',
        ];
    }
}
