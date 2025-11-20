<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recomended_drugs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('diagnosis_id');
            $table->foreign('diagnosis_id')->references('id')->on('diagnoses')->onDelete('cascade');
            $table->uuid('drug_id');
            $table->foreign('drug_id')->references('id')->on('drugs')->onDelete('cascade');
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->unique(['diagnosis_id', 'drug_id'], 'recomended_drugs_diagnosis_drug_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recomended_drugs');
    }
};
