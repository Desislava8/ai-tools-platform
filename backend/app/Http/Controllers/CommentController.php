<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    public function index($toolId)
    {
        return response()->json(
            Comment::with('user')
                ->where('tool_id', $toolId)
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function store(Request $request, $toolId)
    {
        $request->validate([
            'content' => 'required|string|max:1000'
        ]);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'tool_id' => $toolId,
            'content' => $request->input('content')
        ]);

        return response()->json($comment->load('user'), 201);
    }

    public function destroy(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);

        if ($comment->user_id !== $request->user()->id && $request->user()->role !== 'owner') {
            return response()->json(['message' => 'Нямате право да изтриете този коментар'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Коментарът е изтрит']);
    }
}