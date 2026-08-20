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
        Schema::table('reviews', function (Blueprint $table) {
            $table->integer('skills_rating')->nullable()->after('rating');
            $table->integer('communication_rating')->nullable()->after('skills_rating');
            $table->integer('timeliness_rating')->nullable()->after('communication_rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['skills_rating', 'communication_rating', 'timeliness_rating']);
        });
    }
};
