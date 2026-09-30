<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The payment code writes values the payments columns did not allow:
 *  - status "refund_requested" (PaymentController::requestRefund)
 *  - type "deposit" and "withdrawal" (PaymentController and WalletController)
 * PostgreSQL enforces Laravel's enum() as a CHECK constraint, so those writes
 * failed in production; SQLite did not enforce it, so they worked locally.
 * This widens both constraints to what the code actually writes.
 */
return new class extends Migration
{
    private const STATUSES = ['pending', 'held', 'completed', 'failed', 'refunded', 'refund_requested'];
    private const TYPES = ['escrow', 'direct', 'refund', 'deposit', 'withdrawal'];

    private const OLD_STATUSES = ['pending', 'held', 'completed', 'failed', 'refunded'];
    private const OLD_TYPES = ['escrow', 'direct', 'refund'];

    public function up(): void
    {
        $this->apply(self::STATUSES, self::TYPES);
    }

    public function down(): void
    {
        // Fails if rows already use the new values; move them first.
        $this->apply(self::OLD_STATUSES, self::OLD_TYPES);
    }

    private function apply(array $statuses, array $types): void
    {
        $connection = Schema::getConnection();

        if ($connection->getDriverName() === 'pgsql') {
            // Laravel names these constraints {table}_{column}_check.
            $this->replaceCheck($connection, 'status', $statuses);
            $this->replaceCheck($connection, 'type', $types);

            return;
        }

        // SQLite (and MySQL): let the schema builder redefine the columns.
        Schema::table('payments', function (Blueprint $table) use ($statuses, $types) {
            $table->enum('status', $statuses)->default('pending')->change();
            $table->enum('type', $types)->default('direct')->change();
        });
    }

    private function replaceCheck($connection, string $column, array $values): void
    {
        $list = implode(', ', array_map(fn ($v) => $connection->getPdo()->quote($v), $values));

        DB::statement("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_{$column}_check");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_{$column}_check CHECK ({$column}::text IN ({$list}))");
    }
};
