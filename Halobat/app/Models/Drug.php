<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Drug extends Model
{
    protected $table = 'drugs';
    protected $fillable = ['generic_name','description','picture','price','manufacturer_id','dosage_form_id'];

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
        return $this->belongsToMany(ActiveIngredient::class, 'drug_active_ingredients');
    }
}
