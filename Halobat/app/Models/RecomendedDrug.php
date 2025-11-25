<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RecomendedDrug extends Pivot
{
    use HasUuids;

    protected $table = 'recomended_drugs';

    protected $fillable = [
        'diagnosis_id',
        'drug_id',
        'quantity',
    ];

    protected $keyType = 'string';
    public $incrementing = false;
}
