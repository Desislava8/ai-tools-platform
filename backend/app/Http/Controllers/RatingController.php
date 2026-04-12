<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rating;

class RatingController extends Controller
{
    public function store(Request $request, $toolId)
    {
        $request->validate([
            'score' => 'required|integer|min:1|max:5'
        ]);

        $rating = Rating::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'tool_id' => $toolId
            ],
            ['score' => $request->input('score')]
        );

        $average = Rating::where('tool_id', $toolId)->avg('score');

        return response()->json([
            'rating' => $rating,
            'average' => round($average, 1)
        ]);
    }

    public function index($toolId)
    {
        $average = Rating::where('tool_id', $toolId)->avg('score');
        $count = Rating::where('tool_id', $toolId)->count();

        return response()->json([
            'average' => round($average, 1),
            'count' => $count
        ]);
    }
}