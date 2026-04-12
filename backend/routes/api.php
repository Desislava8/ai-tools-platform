<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ToolController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\RatingController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/two-factor/verify', [AuthController::class, 'verifyTwoFactor']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/roles', [RoleController::class, 'index']);
Route::get('/tools', [ToolController::class, 'index']); // 👈 тук

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me/update', [AuthController::class, 'update']);
    Route::post('/me/two-factor', [AuthController::class, 'toggleTwoFactor']);

    Route::middleware('role:owner,backend,frontend')->group(function () {
        Route::post('/tools', [ToolController::class, 'store']);
        Route::put('/tools/{id}', [ToolController::class, 'update']);
    });

    Route::middleware('role:owner')->group(function () {
        Route::delete('/tools/{id}', [ToolController::class, 'destroy']);
        Route::get('/admin/tools', [AdminController::class, 'tools']);
        Route::get('/admin/logs', [AdminController::class, 'logs']);
        Route::put('/admin/tools/{id}/approve', [AdminController::class, 'approve']);
        Route::put('/admin/tools/{id}/reject', [AdminController::class, 'reject']);
    });

    Route::get('/tools/{toolId}/comments', [CommentController::class, 'index']);
    Route::post('/tools/{toolId}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    Route::get('/tools/{toolId}/ratings', [RatingController::class, 'index']);
    Route::post('/tools/{toolId}/ratings', [RatingController::class, 'store']);
});