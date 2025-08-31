<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class TenantService
{
    public function createTenant(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            $tenant = Tenant::create([
                'name' => $data['name'],
                'domain' => $data['domain'],
                'subdomain' => $data['subdomain'] ?? Str::slug($data['name']),
                'plan' => $data['plan'] ?? 'basic',
                'status' => 'active',
                'settings' => $data['settings'] ?? [],
                'limits' => $this->getPlanLimits($data['plan'] ?? 'basic'),
            ]);

            // Create default admin user for tenant
            $this->createTenantAdmin($tenant, $data['admin'] ?? []);

            // Initialize tenant database schema
            $this->initializeTenantSchema($tenant);

            return $tenant;
        });
    }

    public function getTenantByDomain(string $domain): ?Tenant
    {
        return Cache::remember("tenant_domain_{$domain}", 3600, function () use ($domain) {
            return Tenant::where('domain', $domain)
                ->orWhere('subdomain', $domain)
                ->first();
        });
    }

    public function getTenantBySubdomain(string $subdomain): ?Tenant
    {
        return Cache::remember("tenant_subdomain_{$subdomain}", 3600, function () use ($subdomain) {
            return Tenant::where('subdomain', $subdomain)->first();
        });
    }

    public function switchTenant(Tenant $tenant): void
    {
        // Set tenant context for current request
        app()->instance('current_tenant', $tenant);
        
        // Update database connection for tenant
        $this->setTenantDatabase($tenant);
        
        // Cache tenant context
        Cache::put("current_tenant_{$tenant->id}", $tenant, 3600);
    }

    public function getCurrentTenant(): ?Tenant
    {
        return app('current_tenant') ?? Cache::get('current_tenant');
    }

    public function updateTenantSettings(Tenant $tenant, array $settings): bool
    {
        $tenant->settings = array_merge($tenant->settings, $settings);
        $tenant->save();

        // Clear tenant cache
        $this->clearTenantCache($tenant);

        return true;
    }

    public function upgradeTenantPlan(Tenant $tenant, string $newPlan): bool
    {
        $oldPlan = $tenant->plan;
        $tenant->plan = $newPlan;
        $tenant->limits = $this->getPlanLimits($newPlan);
        $tenant->save();

        // Log plan upgrade
        $this->logPlanUpgrade($tenant, $oldPlan, $newPlan);

        // Clear tenant cache
        $this->clearTenantCache($tenant);

        return true;
    }

    public function suspendTenant(Tenant $tenant): bool
    {
        $tenant->status = 'suspended';
        $tenant->suspended_at = now();
        $tenant->save();

        // Clear tenant cache
        $this->clearTenantCache($tenant);

        return true;
    }

    public function activateTenant(Tenant $tenant): bool
    {
        $tenant->status = 'active';
        $tenant->suspended_at = null;
        $tenant->save();

        // Clear tenant cache
        $this->clearTenantCache($tenant);

        return true;
    }

    public function getTenantUsage(Tenant $tenant): array
    {
        return [
            'users' => [
                'current' => $this->getTenantUserCount($tenant),
                'limit' => $tenant->limits['users'] ?? 100,
                'percentage' => $this->calculateUsagePercentage(
                    $this->getTenantUserCount($tenant),
                    $tenant->limits['users'] ?? 100
                ),
            ],
            'courses' => [
                'current' => $this->getTenantCourseCount($tenant),
                'limit' => $tenant->limits['courses'] ?? 50,
                'percentage' => $this->calculateUsagePercentage(
                    $this->getTenantCourseCount($tenant),
                    $tenant->limits['courses'] ?? 50
                ),
            ],
            'storage' => [
                'current' => $this->getTenantStorageUsage($tenant),
                'limit' => $tenant->limits['storage_gb'] ?? 10,
                'percentage' => $this->calculateUsagePercentage(
                    $this->getTenantStorageUsage($tenant),
                    $tenant->limits['storage_gb'] ?? 10
                ),
            ],
            'api_calls' => [
                'current' => $this->getTenantApiCallCount($tenant),
                'limit' => $tenant->limits['api_calls'] ?? 10000,
                'percentage' => $this->calculateUsagePercentage(
                    $this->getTenantApiCallCount($tenant),
                    $tenant->limits['api_calls'] ?? 10000
                ),
            ],
        ];
    }

    public function checkTenantLimits(Tenant $tenant, string $resource): bool
    {
        $usage = $this->getTenantUsage($tenant);
        
        if (!isset($usage[$resource])) {
            return false;
        }

        return $usage[$resource]['current'] < $usage[$resource]['limit'];
    }

    public function getTenantBillingInfo(Tenant $tenant): array
    {
        return [
            'plan' => $tenant->plan,
            'plan_price' => $this->getPlanPrice($tenant->plan),
            'billing_cycle' => $tenant->billing_cycle ?? 'monthly',
            'next_billing_date' => $tenant->next_billing_date,
            'total_charges' => $this->calculateTotalCharges($tenant),
            'payment_method' => $tenant->payment_method,
            'invoices' => $this->getTenantInvoices($tenant),
        ];
    }

    public function generateTenantReport(Tenant $tenant, string $type = 'comprehensive'): array
    {
        switch ($type) {
            case 'usage':
                return $this->generateUsageReport($tenant);
            case 'performance':
                return $this->generatePerformanceReport($tenant);
            case 'financial':
                return $this->generateFinancialReport($tenant);
            case 'comprehensive':
            default:
                return [
                    'usage' => $this->generateUsageReport($tenant),
                    'performance' => $this->generatePerformanceReport($tenant),
                    'financial' => $this->generateFinancialReport($tenant),
                    'generated_at' => now(),
                    'tenant_id' => $tenant->id,
                ];
        }
    }

    private function createTenantAdmin(Tenant $tenant, array $adminData): User
    {
        return User::create([
            'name' => $adminData['name'] ?? 'Admin',
            'email' => $adminData['email'],
            'password' => bcrypt($adminData['password'] ?? 'password'),
            'role' => 'admin',
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);
    }

    private function initializeTenantSchema(Tenant $tenant): void
    {
        // Create tenant-specific database schema
        $schema = [
            'courses' => $this->getCourseSchema(),
            'users' => $this->getUserSchema(),
            'lessons' => $this->getLessonSchema(),
            'quizzes' => $this->getQuizSchema(),
        ];

        foreach ($schema as $table => $columns) {
            $this->createTenantTable($tenant, $table, $columns);
        }
    }

    private function setTenantDatabase(Tenant $tenant): void
    {
        // Configure database connection for tenant
        config([
            'database.connections.tenant.database' => "tenant_{$tenant->id}",
        ]);

        DB::purge('tenant');
        DB::reconnect('tenant');
    }

    private function getPlanLimits(string $plan): array
    {
        $limits = [
            'basic' => [
                'users' => 100,
                'courses' => 50,
                'storage_gb' => 10,
                'api_calls' => 10000,
                'support_level' => 'email',
            ],
            'professional' => [
                'users' => 500,
                'courses' => 200,
                'storage_gb' => 50,
                'api_calls' => 50000,
                'support_level' => 'priority',
            ],
            'enterprise' => [
                'users' => -1, // Unlimited
                'courses' => -1, // Unlimited
                'storage_gb' => 500,
                'api_calls' => 1000000,
                'support_level' => 'dedicated',
            ],
        ];

        return $limits[$plan] ?? $limits['basic'];
    }

    private function getPlanPrice(string $plan): float
    {
        $prices = [
            'basic' => 29.99,
            'professional' => 99.99,
            'enterprise' => 299.99,
        ];

        return $prices[$plan] ?? 29.99;
    }

    private function getTenantUserCount(Tenant $tenant): int
    {
        return Cache::remember("tenant_users_{$tenant->id}", 3600, function () use ($tenant) {
            return User::where('tenant_id', $tenant->id)->count();
        });
    }

    private function getTenantCourseCount(Tenant $tenant): int
    {
        return Cache::remember("tenant_courses_{$tenant->id}", 3600, function () use ($tenant) {
            return Course::where('tenant_id', $tenant->id)->count();
        });
    }

    private function getTenantStorageUsage(Tenant $tenant): float
    {
        return Cache::remember("tenant_storage_{$tenant->id}", 3600, function () use ($tenant) {
            // Simulate storage calculation
            return 2.5; // GB
        });
    }

    private function getTenantApiCallCount(Tenant $tenant): int
    {
        return Cache::remember("tenant_api_calls_{$tenant->id}", 3600, function () use ($tenant) {
            // Simulate API call count
            return 1500;
        });
    }

    private function calculateUsagePercentage(int $current, int $limit): float
    {
        if ($limit <= 0) return 0; // Unlimited
        return min(100, ($current / $limit) * 100);
    }

    private function calculateTotalCharges(Tenant $tenant): float
    {
        // Simulate total charges calculation
        return $this->getPlanPrice($tenant->plan) * 12; // Annual
    }

    private function getTenantInvoices(Tenant $tenant): array
    {
        // Simulate invoice data
        return [
            [
                'id' => 'INV-001',
                'amount' => $this->getPlanPrice($tenant->plan),
                'status' => 'paid',
                'date' => now()->subMonth(),
            ],
            [
                'id' => 'INV-002',
                'amount' => $this->getPlanPrice($tenant->plan),
                'status' => 'pending',
                'date' => now(),
            ],
        ];
    }

    private function generateUsageReport(Tenant $tenant): array
    {
        return [
            'period' => 'last_30_days',
            'usage' => $this->getTenantUsage($tenant),
            'trends' => $this->getUsageTrends($tenant),
            'recommendations' => $this->getUsageRecommendations($tenant),
        ];
    }

    private function generatePerformanceReport(Tenant $tenant): array
    {
        return [
            'uptime' => $this->getTenantUptime($tenant),
            'response_time' => $this->getAverageResponseTime($tenant),
            'error_rate' => $this->getErrorRate($tenant),
            'user_satisfaction' => $this->getUserSatisfaction($tenant),
        ];
    }

    private function generateFinancialReport(Tenant $tenant): array
    {
        return [
            'revenue' => $this->getTenantRevenue($tenant),
            'costs' => $this->getTenantCosts($tenant),
            'profit_margin' => $this->getProfitMargin($tenant),
            'projections' => $this->getFinancialProjections($tenant),
        ];
    }

    private function getUsageTrends(Tenant $tenant): array
    {
        // Simulate usage trends
        return [
            'users' => [10, 15, 20, 25, 30, 35, 40],
            'courses' => [5, 8, 12, 15, 18, 22, 25],
            'storage' => [1.2, 1.5, 1.8, 2.1, 2.3, 2.5, 2.7],
        ];
    }

    private function getUsageRecommendations(Tenant $tenant): array
    {
        $recommendations = [];
        $usage = $this->getTenantUsage($tenant);

        if ($usage['users']['percentage'] > 80) {
            $recommendations[] = 'Consider upgrading to accommodate more users';
        }

        if ($usage['storage']['percentage'] > 80) {
            $recommendations[] = 'Storage usage is high. Consider cleanup or upgrade';
        }

        return $recommendations;
    }

    private function getTenantUptime(Tenant $tenant): float
    {
        // Simulate uptime calculation
        return 99.9;
    }

    private function getAverageResponseTime(Tenant $tenant): float
    {
        // Simulate response time calculation
        return 245.5; // ms
    }

    private function getErrorRate(Tenant $tenant): float
    {
        // Simulate error rate calculation
        return 0.1; // %
    }

    private function getUserSatisfaction(Tenant $tenant): float
    {
        // Simulate user satisfaction calculation
        return 4.5; // out of 5
    }

    private function getTenantRevenue(Tenant $tenant): float
    {
        // Simulate revenue calculation
        return $this->getPlanPrice($tenant->plan) * 12;
    }

    private function getTenantCosts(Tenant $tenant): float
    {
        // Simulate cost calculation
        return $this->getPlanPrice($tenant->plan) * 12 * 0.3; // 30% of revenue
    }

    private function getProfitMargin(Tenant $tenant): float
    {
        $revenue = $this->getTenantRevenue($tenant);
        $costs = $this->getTenantCosts($tenant);
        
        return $revenue > 0 ? (($revenue - $costs) / $revenue) * 100 : 0;
    }

    private function getFinancialProjections(Tenant $tenant): array
    {
        // Simulate financial projections
        return [
            'next_month' => $this->getPlanPrice($tenant->plan),
            'next_quarter' => $this->getPlanPrice($tenant->plan) * 3,
            'next_year' => $this->getPlanPrice($tenant->plan) * 12,
        ];
    }

    private function logPlanUpgrade(Tenant $tenant, string $oldPlan, string $newPlan): void
    {
        // Log plan upgrade for audit trail
        \Log::info("Tenant {$tenant->id} upgraded from {$oldPlan} to {$newPlan}");
    }

    private function clearTenantCache(Tenant $tenant): void
    {
        Cache::forget("tenant_domain_{$tenant->domain}");
        Cache::forget("tenant_subdomain_{$tenant->subdomain}");
        Cache::forget("tenant_users_{$tenant->id}");
        Cache::forget("tenant_courses_{$tenant->id}");
        Cache::forget("tenant_storage_{$tenant->id}");
        Cache::forget("tenant_api_calls_{$tenant->id}");
    }

    private function getCourseSchema(): array
    {
        return [
            'id' => 'bigint unsigned',
            'title' => 'string',
            'description' => 'text',
            'status' => 'string',
            'tenant_id' => 'bigint unsigned',
            'created_at' => 'timestamp',
            'updated_at' => 'timestamp',
        ];
    }

    private function getUserSchema(): array
    {
        return [
            'id' => 'bigint unsigned',
            'name' => 'string',
            'email' => 'string',
            'role' => 'string',
            'tenant_id' => 'bigint unsigned',
            'created_at' => 'timestamp',
            'updated_at' => 'timestamp',
        ];
    }

    private function getLessonSchema(): array
    {
        return [
            'id' => 'bigint unsigned',
            'title' => 'string',
            'content' => 'text',
            'course_id' => 'bigint unsigned',
            'tenant_id' => 'bigint unsigned',
            'created_at' => 'timestamp',
            'updated_at' => 'timestamp',
        ];
    }

    private function getQuizSchema(): array
    {
        return [
            'id' => 'bigint unsigned',
            'title' => 'string',
            'lesson_id' => 'bigint unsigned',
            'tenant_id' => 'bigint unsigned',
            'created_at' => 'timestamp',
            'updated_at' => 'timestamp',
        ];
    }

    private function createTenantTable(Tenant $tenant, string $table, array $columns): void
    {
        // Simulate table creation for tenant
        \Log::info("Creating table {$table} for tenant {$tenant->id}");
    }
}
