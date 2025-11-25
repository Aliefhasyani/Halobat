<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('drug_active_ingredients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('drug_id');
            $table->foreign('drug_id')->references('id')->on('drugs')->onDelete('cascade');
            $table->uuid('active_ingredient_id');
            $table->foreign('active_ingredient_id')->references('id')->on('active_ingredients')->onDelete('cascade');
            $table->integer('quantity');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('drug_active_ingredients');
    }
};
