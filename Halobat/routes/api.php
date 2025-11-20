<?php

use App\Http\Controllers\ActiveIngredientController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DosageFormController;
use App\Http\Controllers\DrugController;
use App\Http\Controllers\ManufacturerController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// THIS IS RUNNING IN PRODUCTION. https://halobat-production.up.railway.app

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Auth endpoints - CSRF-exempt on backend
Route::post('/register',[AuthController::class,'register'])->name('register');
Route::post('/login',[AuthController::class,'login'])->name('login');
Route::post('/logout',[AuthController::class,'logout'])->middleware('jwt.auth')->name('logout');

Route::post('/chat', [ChatController::class, 'index'])->name('chat');

Route::middleware('jwt.auth')->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('manufacturers', ManufacturerController::class);
    Route::apiResource('dosage-forms', DosageFormController::class);
    Route::apiResource('drugs', DrugController::class);
    Route::apiResource('active-ingredients', ActiveIngredientController::class);
});
