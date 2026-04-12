<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::create(["name" => "Frontend", "description" => "Frontend инструменти"]);
        Category::create(["name" => "Backend", "description" => "Backend инструменти"]);
        Category::create(["name" => "Design", "description" => "Дизайн инструменти"]);
        Category::create(["name" => "QA", "description" => "QA инструменти"]);
        Category::create(["name" => "AI", "description" => "AI инструменти"]);
        Category::create(["name" => "Productivity", "description" => "Продуктивност"]);
    }
}