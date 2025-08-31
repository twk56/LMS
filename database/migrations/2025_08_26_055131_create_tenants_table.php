<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('domain')->unique();
            $table->string('subdomain')->unique();
            $table->string('plan')->default('basic');
            $table->string('status')->default('active');
            $table->json('settings')->nullable();
            $table->json('limits')->nullable();
            $table->string('billing_cycle')->default('monthly');
            $table->timestamp('next_billing_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
