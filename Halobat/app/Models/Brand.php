<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasUuids;

    protected $table = 'brands';
    protected $fillable = ['id','name','picture','drug_id', 'price'];
    protected $keyType = 'string';
    public $incrementing = false;

    public function drug(){
        return $this->belongsTo(Drug::class);
    }

}
