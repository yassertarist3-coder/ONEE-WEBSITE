<?php
namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'admin@onee.ma'],
            ['name' => 'Admin ONEE', 'password' => 'Admin@2026']
        );

        Admin::updateOrCreate(
            ['email' => 'yassertarist99@gmail.com'],
            ['name' => 'System Admin', 'password' => 'yasser123']
        );
    }
}
