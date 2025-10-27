<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('drugs', function (Blueprint $table) {
            $table->id();
            $table->string('generic_name');
            $table->text('description')->nullable();
            $table->text('picture')->nullable();
            $table->decimal('price', 10, 2);
            $table->foreignId('manufacturer_id')->constrained('manufacturers')->onDelete('cascade');
            $table->foreignId('dosage_form_id')->constrained('dosage_forms')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('drugs');
    }
};
