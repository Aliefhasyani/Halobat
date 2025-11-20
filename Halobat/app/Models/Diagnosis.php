<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use App\Models\Drug;
use App\Models\RecomendedDrug;

class Diagnosis extends Model
{
    use HasUuids;

    protected $table = 'diagnoses';
    protected $fillable = ['user_id','symptoms','diagnosis'];
    protected $keyType = 'string';
    public $incrementing = false;

    public function user(){
        return $this->belongsTo(User::class);
    }

    /**
     * The drugs recommended for this diagnosis.
     */
    public function recommendedDrugs()
    {
        return $this->belongsToMany(Drug::class, 'recomended_drugs')
                    ->using(RecomendedDrug::class)
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
}
