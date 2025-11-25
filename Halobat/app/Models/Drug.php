<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use App\Models\Diagnosis;
use App\Models\RecomendedDrug;

class Drug extends Model
{
    use HasUuids;

    protected $table = 'drugs';
    protected $fillable = ['generic_name','description','picture','price','manufacturer_id','dosage_form_id'];
    protected $keyType = 'string';
    public $incrementing = false;

    public function manufacturer(){
        return $this->belongsTo(Manufacturer::class);
    }

    public function dosageForm(){
        return $this->belongsTo(DosageForm::class);
    }

    public function brand(){
        return $this->hasMany(Brand::class);
    }
    
    public function activeIngredients(){
        return $this->belongsToMany(ActiveIngredient::class, 'drug_active_ingredients')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }

    /**
     * The diagnoses that this drug is recommended for.
     */
    public function recommendedDiagnoses()
    {
        return $this->belongsToMany(Diagnosis::class, 'recomended_drugs')
                    ->using(RecomendedDrug::class)
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
}
