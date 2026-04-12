<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tool;
use App\Models\ActivityLog;

class AdminController extends Controller
{
    public function tools()
    {
        return response()->json(Tool::with(['categories', 'roles', 'tags'])->get());
    }

    public function logs()
    {
        return response()->json(
            ActivityLog::with('user')
                ->orderBy('created_at', 'desc')
                ->take(100)
                ->get()
        );
    }

    public function approve(Request $request, $id)
    {
        $tool = Tool::findOrFail($id);
        $tool->status = 'approved';
        $tool->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'approve',
            'model_type' => 'Tool',
            'model_id' => $tool->id,
            'data' => ['name' => $tool->name]
        ]);

        return response()->json($tool);
    }

    public function reject(Request $request, $id)
    {
        $tool = Tool::findOrFail($id);
        $tool->status = 'rejected';
        $tool->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'reject',
            'model_type' => 'Tool',
            'model_id' => $tool->id,
            'data' => ['name' => $tool->name]
        ]);

        return response()->json($tool);
    }
}