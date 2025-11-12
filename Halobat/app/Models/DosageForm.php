<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DosageForm extends Model
{
    protected $table = 'dosage_forms';
    protected $fillable = ['name'];

    public function drugs(){
        return $this->hasMany(Drug::class);
    }
}
