<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DosageForm extends Model
{
    protected $table = 'dosage_forms';
    protected $fillable = ['name'];
    protected $keyType = 'string';
    public $incrementing = false;

    public function drugs(){
        return $this->hasMany(Drug::class);
    }
}
