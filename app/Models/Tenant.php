<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'domain',
        'subdomain',
        'plan',
        'status',
        'settings',
        'limits',
        'billing_cycle',
        'next_billing_date',
        'payment_method',
        'suspended_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'limits' => 'array',
        'next_billing_date' => 'datetime',
        'suspended_at' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function getSetting(string $key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }

    public function setSetting(string $key, $value): void
    {
        $settings = $this->settings;
        $settings[$key] = $value;
        $this->settings = $settings;
        $this->save();
    }

    public function getLimit(string $key, $default = null)
    {
        return $this->limits[$key] ?? $default;
    }

    public function hasUnlimited(string $key): bool
    {
        return $this->getLimit($key) === -1;
    }
}
