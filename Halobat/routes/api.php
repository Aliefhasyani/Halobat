<?php

use App\Http\Controllers\ActiveIngredientController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\DiagnosisController;
use App\Http\Controllers\DosageFormController;
use App\Http\Controllers\DrugController;
use App\Http\Controllers\ManufacturerController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

// THIS IS RUNNING IN PRODUCTION. https://halobat-production.up.railway.app

// Auth endpoints - CSRF-exempt on backend
Route::post('/register',[AuthController::class,'register'])->name('register');
Route::post('/login',[AuthController::class,'login'])->name('login');
Route::post('/logout',[AuthController::class,'logout'])->middleware('jwt.auth')->name('logout');

Route::get('/chat', [ChatController::class, 'index'])->middleware('jwt.auth')->name('chat.index');
Route::post('/chat', [ChatController::class, 'store'])->middleware('jwt.auth')->name('chat.store');

Route::apiResource('roles', RoleController::class);
Route::apiResource('users', UserController::class);
// Profile endpoints for authenticated user
Route::get('/profile', [ProfileController::class, 'show']);
Route::put('/profile', [ProfileController::class, 'update']);
// Upload endpoint for images. Protected by JWT middleware in controller.
Route::post('/upload-image', [UploadController::class, 'uploadImage']);
Route::apiResource('manufacturers', ManufacturerController::class);
Route::apiResource('dosage-forms', DosageFormController::class);
Route::apiResource('drugs', DrugController::class);
Route::apiResource('brands', BrandController::class);
Route::apiResource('active-ingredients', ActiveIngredientController::class);
Route::apiResource('diagnoses', DiagnosisController::class);