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
        Schema::table('disputes', function (Blueprint $table) {
            // Rename columns to match controller expectations
            $table->renameColumn('raised_by', 'complainant_id');
            $table->renameColumn('against_user', 'respondent_id');
            
            // Add missing columns
            $table->string('type')->after('project_id');
            $table->json('evidence')->nullable()->after('description');
            
            // Remove title column as it's not used
            $table->dropColumn('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disputes', function (Blueprint $table) {
            $table->renameColumn('complainant_id', 'raised_by');
            $table->renameColumn('respondent_id', 'against_user');
            $table->dropColumn(['type', 'evidence']);
            $table->string('title')->after('project_id');
        });
    }
};
