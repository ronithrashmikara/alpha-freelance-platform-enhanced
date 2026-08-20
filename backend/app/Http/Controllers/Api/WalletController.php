<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WalletController extends Controller
{
    /**
     * Display the user's wallet.
     */
    public function show(Request $request)
    {
        $wallet = $request->user()->wallet;
        
        if (!$wallet) {
            return response()->json([
                'message' => 'Wallet not found'
            ], 404);
        }

        return response()->json([
            'wallet' => $wallet
        ]);
    }

    /**
     * Get wallet transaction history.
     */
    public function transactions(Request $request)
    {
        $user = $request->user();
        
        // Get payments where user is involved
        $transactions = DB::table('payments')
            ->select([
                'id',
                'amount',
                'type',
                'status',
                'transaction_hash',
                'created_at',
                DB::raw('CASE WHEN payer_id = ? THEN "outgoing" ELSE "incoming" END as direction'),
                DB::raw('CASE WHEN payer_id = ? THEN payee_id ELSE payer_id END as other_party_id')
            ])
            ->where('payer_id', $user->id)
            ->orWhere('payee_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($transactions);
    }

    /**
     * Add funds to wallet (simulation for MVP).
     */
    public function addFunds(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1|max:10000',
            'payment_method' => 'required|in:credit_card,bank_transfer,crypto',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $wallet = $request->user()->wallet;
        
        DB::beginTransaction();
        try {
            // Simulate payment processing
            $wallet->increment('balance_usdt', $request->amount);
            
            // Create a record of the deposit (using payments table)
            DB::table('payments')->insert([
                'payer_id' => $request->user()->id,
                'payee_id' => $request->user()->id, // Self-deposit
                'amount' => $request->amount,
                'type' => 'deposit',
                'status' => 'completed',
                'transaction_hash' => '0x' . bin2hex(random_bytes(32)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Funds added successfully',
                'wallet' => $wallet->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to add funds'
            ], 500);
        }
    }

    /**
     * Withdraw funds from wallet (simulation for MVP).
     */
    public function withdraw(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'withdrawal_method' => 'required|in:bank_transfer,crypto',
            'destination' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $wallet = $request->user()->wallet;
        
        // Check sufficient balance
        if ($wallet->balance_usdt < $request->amount) {
            return response()->json([
                'message' => 'Insufficient balance'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Deduct from wallet
            $wallet->decrement('balance_usdt', $request->amount);
            
            // Create withdrawal record
            DB::table('payments')->insert([
                'payer_id' => $request->user()->id,
                'payee_id' => $request->user()->id, // Self-withdrawal
                'amount' => $request->amount,
                'type' => 'withdrawal',
                'status' => 'pending', // Withdrawals need processing
                'transaction_hash' => '0x' . bin2hex(random_bytes(32)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Withdrawal request submitted successfully',
                'wallet' => $wallet->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to process withdrawal'
            ], 500);
        }
    }

    /**
     * Get wallet statistics.
     */
    public function statistics(Request $request)
    {
        $user = $request->user();
        
        $stats = [
            'current_balance' => $user->wallet->balance_usdt,
            'total_earned' => DB::table('payments')
                ->where('payee_id', $user->id)
                ->where('type', 'escrow')
                ->where('status', 'completed')
                ->sum('amount'),
            'total_spent' => DB::table('payments')
                ->where('payer_id', $user->id)
                ->where('type', 'escrow')
                ->sum('amount'),
            'pending_payments' => DB::table('payments')
                ->where(function($query) use ($user) {
                    $query->where('payer_id', $user->id)
                          ->orWhere('payee_id', $user->id);
                })
                ->where('status', 'held')
                ->sum('amount'),
            'total_deposits' => DB::table('payments')
                ->where('payer_id', $user->id)
                ->where('type', 'deposit')
                ->sum('amount'),
            'total_withdrawals' => DB::table('payments')
                ->where('payer_id', $user->id)
                ->where('type', 'withdrawal')
                ->sum('amount'),
        ];

        return response()->json($stats);
    }

    /**
     * Generate new wallet address (for security).
     */
    public function regenerateAddress(Request $request)
    {
        $wallet = $request->user()->wallet;
        
        $wallet->update([
            'address' => '0x' . bin2hex(random_bytes(20)),
            'private_key' => bin2hex(random_bytes(32)),
        ]);

        return response()->json([
            'message' => 'Wallet address regenerated successfully',
            'wallet' => $wallet->fresh()
        ]);
    }

    /**
     * Get wallet balance (quick endpoint).
     */
    public function balance(Request $request)
    {
        $balance = $request->user()->wallet->balance_usdt;
        
        return response()->json([
            'balance' => $balance
        ]);
    }
}