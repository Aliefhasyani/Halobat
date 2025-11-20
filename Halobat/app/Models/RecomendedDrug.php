<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RecomendedDrug extends Pivot
{
    protected $table = 'recomended_drugs';

    protected $fillable = [
        'diagnosis_id',
        'drug_id',
        'quantity',
    ];

    protected $keyType = 'string';
    public $incrementing = false;
}
