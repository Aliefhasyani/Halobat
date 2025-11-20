<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('drugs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid()'));
            $table->string('generic_name');
            $table->text('description')->nullable();
            $table->text('picture')->nullable();
            $table->decimal('price', 10, 2);
            $table->uuid('manufacturer_id');
            $table->foreign('manufacturer_id')->references('id')->on('manufacturers')->onDelete('cascade');
            $table->uuid('dosage_form_id');
            $table->foreign('dosage_form_id')->references('id')->on('dosage_forms')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('drugs');
    }
};
