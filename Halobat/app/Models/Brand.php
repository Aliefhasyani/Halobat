<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    protected $table = 'brands';
    protected $fillable = ['name','picture','drug_id'];

    public function drug(){
        return $this->belongsTo(Drug::class);
    }

}
