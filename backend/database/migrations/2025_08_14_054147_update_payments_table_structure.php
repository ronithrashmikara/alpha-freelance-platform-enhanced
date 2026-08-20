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
        Schema::table('payments', function (Blueprint $table) {
            // Rename columns
            $table->renameColumn('from_user_id', 'payer_id');
            $table->renameColumn('to_user_id', 'payee_id');
            
            // Add missing columns
            $table->enum('type', ['escrow', 'direct', 'refund'])->default('direct')->after('amount');
            $table->string('refund_reason')->nullable()->after('notes');
            $table->timestamp('released_at')->nullable()->after('refund_reason');
            $table->timestamp('refunded_at')->nullable()->after('released_at');
            
            // Update status enum
            $table->dropColumn('status');
        });
        
        Schema::table('payments', function (Blueprint $table) {
            $table->enum('status', ['pending', 'held', 'completed', 'failed', 'refunded'])->default('pending')->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['type', 'refund_reason', 'released_at', 'refunded_at', 'status']);
            $table->renameColumn('payer_id', 'from_user_id');
            $table->renameColumn('payee_id', 'to_user_id');
        });
        
        Schema::table('payments', function (Blueprint $table) {
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
        });
    }
};
