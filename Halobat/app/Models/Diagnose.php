<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnose extends Model
{
    protected $table = 'diagnoses';
    protected $fillable = ['user_id','symptomps','diagnosis'];

    public function user(){
        return $this->hasMany(User::class);
    }
}
