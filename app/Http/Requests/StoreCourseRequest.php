<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|string|max:500',
            'category_id' => 'nullable|exists:course_categories,id',
            'status' => 'required|in:draft,published',
        ];
    }
    public function messages(): array {
        return [
            'title.required' => 'Please enter a course title.',
            'title.max' => 'Course title cannot exceed 255 characters.',
            'description.max' => 'Course description cannot exceed 1000 characters.',
            'image.max' => 'Image URL cannot exceed 500 characters.',
            'category_id.exists' => 'Selected category does not exist.',
            'status.required' => 'Please select a status.',
            'status.in' => 'Status must be either draft or published.',
        ];
    }
}
