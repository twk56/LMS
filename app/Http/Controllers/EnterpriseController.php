<?php

namespace App\Http\Controllers;

use App\Services\TenantService;
use App\Services\SecurityService;
use App\Services\ComplianceService;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EnterpriseController extends Controller
{
    public function __construct(
        private TenantService $tenantService,
        private SecurityService $securityService,
        private ComplianceService $complianceService
    ) {}

    public function dashboard()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        if (!$tenant) {
            return redirect()->route('tenant.select');
        }

        $usage = $this->tenantService->getTenantUsage($tenant);
        $billing = $this->tenantService->getTenantBillingInfo($tenant);
        $securityReport = $this->securityService->generateSecurityReport($tenant);
        $complianceCertificate = $this->complianceService->generateComplianceCertificate($tenant);

        return Inertia::render('Enterprise/Dashboard', [
            'tenant' => $tenant,
            'usage' => $usage,
            'billing' => $billing,
            'securityReport' => $securityReport,
            'complianceCertificate' => $complianceCertificate,
        ]);
    }

    public function tenantManagement()
    {
        $tenants = Tenant::with(['users', 'courses'])->get();
        
        return Inertia::render('Enterprise/TenantManagement', [
            'tenants' => $tenants,
        ]);
    }

    public function createTenant(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|unique:tenants,domain',
            'subdomain' => 'nullable|string|unique:tenants,subdomain',
            'plan' => 'required|in:basic,professional,enterprise',
            'admin' => 'required|array',
            'admin.name' => 'required|string|max:255',
            'admin.email' => 'required|email|unique:users,email',
            'admin.password' => 'required|string|min:8',
        ]);

        $tenant = $this->tenantService->createTenant($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tenant created successfully',
            'tenant' => $tenant,
        ]);
    }

    public function updateTenant(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'plan' => 'sometimes|in:basic,professional,enterprise',
            'status' => 'sometimes|in:active,suspended',
            'settings' => 'sometimes|array',
        ]);

        if (isset($validated['plan']) && $validated['plan'] !== $tenant->plan) {
            $this->tenantService->upgradeTenantPlan($tenant, $validated['plan']);
        }

        $tenant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tenant updated successfully',
            'tenant' => $tenant,
        ]);
    }

    public function suspendTenant(Tenant $tenant)
    {
        $this->tenantService->suspendTenant($tenant);

        return response()->json([
            'success' => true,
            'message' => 'Tenant suspended successfully',
        ]);
    }

    public function activateTenant(Tenant $tenant)
    {
        $this->tenantService->activateTenant($tenant);

        return response()->json([
            'success' => true,
            'message' => 'Tenant activated successfully',
        ]);
    }

    public function tenantUsage(Tenant $tenant)
    {
        $usage = $this->tenantService->getTenantUsage($tenant);
        $report = $this->tenantService->generateTenantReport($tenant, 'usage');

        return Inertia::render('Enterprise/TenantUsage', [
            'tenant' => $tenant,
            'usage' => $usage,
            'report' => $report,
        ]);
    }

    public function securityDashboard()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $securityReport = $this->securityService->generateSecurityReport($tenant);

        return Inertia::render('Enterprise/SecurityDashboard', [
            'securityReport' => $securityReport,
        ]);
    }

    public function securitySettings()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        return Inertia::render('Enterprise/SecuritySettings', [
            'tenant' => $tenant,
        ]);
    }

    public function updateSecuritySettings(Request $request)
    {
        $validated = $request->validate([
            'two_factor_required' => 'boolean',
            'password_policy' => 'array',
            'session_timeout' => 'integer|min:5|max:480',
            'ip_whitelist' => 'array',
            'rate_limiting' => 'array',
        ]);

        $tenant = $this->tenantService->getCurrentTenant();
        $this->tenantService->updateTenantSettings($tenant, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Security settings updated successfully',
        ]);
    }

    public function complianceDashboard()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $gdprReport = $this->complianceService->generateGDPRReport($tenant);
        $ferpaReport = $this->complianceService->generateFERPAReport($tenant);
        $certificate = $this->complianceService->generateComplianceCertificate($tenant);

        return Inertia::render('Enterprise/ComplianceDashboard', [
            'gdprReport' => $gdprReport,
            'ferpaReport' => $ferpaReport,
            'certificate' => $certificate,
        ]);
    }

    public function gdprReport()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $report = $this->complianceService->generateGDPRReport($tenant);

        return Inertia::render('Enterprise/GDPRReport', [
            'report' => $report,
        ]);
    }

    public function ferpaReport()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $report = $this->complianceService->generateFERPAReport($tenant);

        return Inertia::render('Enterprise/FERPAReport', [
            'report' => $report,
        ]);
    }

    public function dataSubjectRequest(Request $request)
    {
        $validated = $request->validate([
            'request_type' => 'required|in:access,rectification,erasure,portability,restriction',
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $result = $this->complianceService->processDataSubjectRequest($user, $validated['request_type']);

        return response()->json([
            'success' => true,
            'message' => 'Data subject request processed successfully',
            'result' => $result,
        ]);
    }

    public function consentManagement()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $users = User::where('tenant_id', $tenant->id)->get();

        return Inertia::render('Enterprise/ConsentManagement', [
            'users' => $users,
        ]);
    }

    public function updateUserConsent(Request $request, User $user)
    {
        $validated = $request->validate([
            'consents' => 'required|array',
            'consents.marketing' => 'boolean',
            'consents.analytics' => 'boolean',
            'consents.third_party' => 'boolean',
            'consents.research' => 'boolean',
        ]);

        $this->complianceService->implementConsentManagement($user, $validated['consents']);

        return response()->json([
            'success' => true,
            'message' => 'User consent updated successfully',
        ]);
    }

    public function auditLogs()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $auditData = $this->complianceService->auditDataAccess($tenant);

        return Inertia::render('Enterprise/AuditLogs', [
            'auditData' => $auditData,
        ]);
    }

    public function billingManagement()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $billing = $this->tenantService->getTenantBillingInfo($tenant);

        return Inertia::render('Enterprise/BillingManagement', [
            'billing' => $billing,
        ]);
    }

    public function upgradePlan(Request $request)
    {
        $validated = $request->validate([
            'new_plan' => 'required|in:basic,professional,enterprise',
        ]);

        $tenant = $this->tenantService->getCurrentTenant();
        $this->tenantService->upgradeTenantPlan($tenant, $validated['new_plan']);

        return response()->json([
            'success' => true,
            'message' => 'Plan upgraded successfully',
        ]);
    }

    public function apiTenantUsage(Tenant $tenant)
    {
        $usage = $this->tenantService->getTenantUsage($tenant);
        
        return response()->json([
            'data' => $usage,
        ]);
    }

    public function apiSecurityReport()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $report = $this->securityService->generateSecurityReport($tenant);
        
        return response()->json([
            'data' => $report,
        ]);
    }

    public function apiComplianceReport()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $gdprReport = $this->complianceService->generateGDPRReport($tenant);
        $ferpaReport = $this->complianceService->generateFERPAReport($tenant);
        
        return response()->json([
            'data' => [
                'gdpr' => $gdprReport,
                'ferpa' => $ferpaReport,
            ],
        ]);
    }

    public function apiTenantReport(Tenant $tenant, Request $request)
    {
        $type = $request->get('type', 'comprehensive');
        $report = $this->tenantService->generateTenantReport($tenant, $type);
        
        return response()->json([
            'data' => $report,
        ]);
    }
}
