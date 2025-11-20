<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Manufacturer extends Model
{
    protected $table = 'manufacturers';
    protected $fillable = ['name'];
    protected $keyType = 'string';
    public $incrementing = false;


    public function drugs(){
        return $this->hasMany(Drug::class);
    }
}
