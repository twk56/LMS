<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;

    /**
     * Disable CSRF token verification for tests
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Configure session for tests
        config(['session.driver' => 'array']);
        config(['session.lifetime' => 120]);
        
        // Disable only CSRF middleware for tests
        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }
}
