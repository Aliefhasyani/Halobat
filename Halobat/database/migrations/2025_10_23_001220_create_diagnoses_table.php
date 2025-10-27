<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('symptoms');
            $table->text('diagnosis');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('diagnoses');
    }
};
