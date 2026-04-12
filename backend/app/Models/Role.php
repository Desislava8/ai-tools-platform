<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name', 'description'];

    public function tools()
    {
        return $this->belongsToMany(Tool::class, 'role_tool');
    }
}