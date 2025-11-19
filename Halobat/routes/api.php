<?php

use App\Http\Controllers\ActiveIngredientController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\DosageFormController;
use App\Http\Controllers\DrugController;
use App\Http\Controllers\ManufacturerController;
use App\Http\Controllers\RoleController;
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

Route::apiResource('roles', RoleController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('manufacturers', ManufacturerController::class);
Route::apiResource('dosage-forms', DosageFormController::class);
Route::apiResource('drugs', DrugController::class);
Route::apiResource('brands', BrandController::class);
Route::apiResource('active_ingredients', ActiveIngredientController::class);
