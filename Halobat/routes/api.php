<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DiagnosesController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// THIS IS RUNNING IN PRODUCTION. https://halobat-production.up.railway.app

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Auth endpoints - CSRF-exempt on backend
Route::post('/register',[AuthController::class,'register'])->name('register');
Route::post('/login',[AuthController::class,'login'])->name('login');
Route::post('/logout',[AuthController::class,'logout'])->name('logout')->middleware('auth:sanctum');

Route::apiResource('users', UserController::class);
Route::apiResource('diagnosis', DiagnosesController::class);
Route::apiResource('admin', AdminController::class);