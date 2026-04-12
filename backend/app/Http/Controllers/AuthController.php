<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Грешен email или парола'], 401);
        }

        if ($user->two_factor_enabled) {
            $code = rand(100000, 999999);
            $user->two_factor_code = $code;
            $user->two_factor_expires_at = now()->addMinutes(10);
            $user->save();

            Mail::raw("Вашият код за вход е: $code", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Код за двуфакторна автентикация');
            });

            return response()->json([
                'two_factor_required' => true,
                'email' => $user->email,
                'message' => 'Изпратихме код на вашия имейл'
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    public function verifyTwoFactor(Request $request)
    {
        $email = $request->input('email');
        $code = $request->input('code');

        $user = User::where('email', $email)->first();

        if (!$user || $user->two_factor_code !== $code) {
            return response()->json(['message' => 'Грешен код'], 401);
        }

        if ($user->two_factor_expires_at < now()) {
            return response()->json(['message' => 'Кодът е изтекъл'], 401);
        }

        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $user->name = $request->input('name', $user->name);
        $user->email = $request->input('email', $user->email);
        if ($request->input('password')) {
            $user->password = Hash::make($request->input('password'));
        }
        $user->save();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }

    public function toggleTwoFactor(Request $request)
    {
        $user = $request->user();
        $user->two_factor_enabled = !$user->two_factor_enabled;
        $user->save();

        return response()->json([
            'two_factor_enabled' => $user->two_factor_enabled,
            'message' => $user->two_factor_enabled ? '2FA е активирана' : '2FA е деактивирана'
        ]);
    }
}