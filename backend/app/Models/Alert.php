<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $fillable = ['type', 'consumable_id', 'message', 'is_read', 'read_at'];

    public function consumable()
    {
        return $this->belongsTo(Consumable::class);
    }
}
