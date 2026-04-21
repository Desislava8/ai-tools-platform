<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tool;
use App\Models\Tag;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Cache;

class ToolController extends Controller
{
    public function index(Request $request)
    {
        $query = Tool::with(['categories', 'roles', 'tags'])
            ->withAvg('ratings', 'score')
            ->withCount('ratings')
            ->withCount('comments')
            ->where('status', 'approved');

        if ($request->has('role_id') && $request->role_id) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('roles.id', $request->role_id);
            });
        }

        $tools = $query->get();

        foreach ($tools as $tool) {
            $tool->ratings_avg_score = round($tool->ratings_avg_score ?? 0, 1);
            $tool->ratings_count = $tool->ratings_count ?? 0;
            $tool->comments_count = $tool->comments_count ?? 0;
        }

        Cache::put('tools_count', $tools->count(), 3600);

        return response()->json($tools);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'link' => 'nullable|url',
            'documentation' => 'nullable|url',
            'video_url' => 'nullable|url',
            'description' => 'nullable|string',
            'how_to_use' => 'nullable|string',
            'examples' => 'nullable|string',
            'difficulty' => 'nullable|in:beginner,intermediate,advanced',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'tags' => 'nullable|array',
        ]);

        $data = $request->json()->all();
        $tool = Tool::create($data);

        if (isset($data['category_ids']) && is_array($data['category_ids'])) {
            $tool->categories()->sync($data['category_ids']);
        }

        if (isset($data['role_ids']) && is_array($data['role_ids'])) {
            $tool->roles()->sync($data['role_ids']);
        }

        if (isset($data['tags']) && is_array($data['tags'])) {
            $tagIds = [];
            foreach ($data['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }
            $tool->tags()->sync($tagIds);
        }

        Cache::forget('tools_count');

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create',
            'model_type' => 'Tool',
            'model_id' => $tool->id,
            'data' => ['name' => $tool->name]
        ]);

        return response()->json(
            $tool->load('categories', 'roles', 'tags'),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'link' => 'nullable|url',
            'documentation' => 'nullable|url',
            'video_url' => 'nullable|url',
            'description' => 'nullable|string',
            'how_to_use' => 'nullable|string',
            'examples' => 'nullable|string',
            'difficulty' => 'nullable|in:beginner,intermediate,advanced',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'tags' => 'nullable|array',
        ]);

        $tool = Tool::findOrFail($id);
        $data = $request->json()->all();
        $tool->update($data);

        if (isset($data['category_ids']) && is_array($data['category_ids'])) {
            $tool->categories()->sync($data['category_ids']);
        }

        if (isset($data['role_ids']) && is_array($data['role_ids'])) {
            $tool->roles()->sync($data['role_ids']);
        }

        if (isset($data['tags']) && is_array($data['tags'])) {
            $tagIds = [];
            foreach ($data['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }
            $tool->tags()->sync($tagIds);
        }

        Cache::forget('tools_count');

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update',
            'model_type' => 'Tool',
            'model_id' => $tool->id,
            'data' => ['name' => $tool->name]
        ]);

        return response()->json(
            $tool->load('categories', 'roles', 'tags')
        );
    }

    public function destroy(Request $request, $id)
    {
        $tool = Tool::findOrFail($id);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete',
            'model_type' => 'Tool',
            'model_id' => $tool->id,
            'data' => ['name' => $tool->name]
        ]);

        $tool->categories()->detach();
        $tool->roles()->detach();
        $tool->tags()->detach();
        $tool->delete();

        Cache::forget('tools_count');

        return response()->json([
            'message' => 'Инструментът е изтрит'
        ]);
    }
}
