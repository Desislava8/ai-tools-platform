<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create(['name' => 'owner', 'description' => 'Собственик']);
        Role::create(['name' => 'backend', 'description' => 'Backend разработчик']);
        Role::create(['name' => 'frontend', 'description' => 'Frontend разработчик']);
        Role::create(['name' => 'designer', 'description' => 'Дизайнер']);
        Role::create(['name' => 'qa', 'description' => 'QA инженер']);
        Role::create(['name' => 'pm', 'description' => 'Проектен мениджър']);
    }
}