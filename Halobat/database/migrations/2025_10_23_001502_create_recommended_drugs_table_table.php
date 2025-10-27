<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('recommended_drugs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diagnoses_id')->constrained('diagnoses')->onDelete('cascade');
            $table->foreignId('drug_id')->constrained('drugs')->onDelete('cascade');
            $table->integer('quantity');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('recommended_drugs');
    }
};
