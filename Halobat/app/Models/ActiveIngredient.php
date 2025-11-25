<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ActiveIngredient extends Model
{
    use HasUuids;

    protected $table = 'active_ingredients';
    protected $fillable = ['name'];
    protected $keyType = 'string';
    public $incrementing = false;

    public function drugs(){
        return $this->belongsToMany(Drug::class, 'drug_active_ingredients');
    }
}
