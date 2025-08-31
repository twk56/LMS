<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'required|string|max:255|unique:course_categories,name,' . $this->route('category')->id,
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
            'order' => 'integer|min:0',
            'is_active' => 'boolean',
        ];
    }
    public function messages(): array {
        return [
            'name.required' => 'Please enter a category name.',
            'name.max' => 'Category name cannot exceed 255 characters.',
            'name.unique' => 'This category name already exists.',
            'color.required' => 'Please select a color.',
            'color.max' => 'Color code cannot exceed 7 characters.',
            'icon.max' => 'Icon name cannot exceed 50 characters.',
            'order.integer' => 'Order must be a number.',
            'order.min' => 'Order cannot be negative.',
        ];
    }
}
