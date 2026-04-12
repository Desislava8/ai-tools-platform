<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tool extends Model
{
    protected $fillable = [
        'name',
        'link',
        'description',
        'how_to_use',
        'examples',
        'documentation',
        'video_url',
        'difficulty',
        'screenshots',
        'status'
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_tool');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_tool');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tag_tool');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(\App\Models\Rating::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(\App\Models\Comment::class);
    }
}