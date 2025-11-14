<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActiveIngredient extends Model
{
    protected $table = 'active_ingredients';
    protected $fillable = ['name'];

    public function drugs(){
        return $this->belongsToMany(Drug::class, 'drug_active_ingredients');
    }
}
