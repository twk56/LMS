<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|string|max:500',
            'category_option' => 'required|in:existing,new',
            'status' => 'required|in:draft,published',
        ];

        // Conditional validation based on category_option
        if ($this->input('category_option') === 'existing') {
            $rules['category_id'] = 'required|exists:course_categories,id';
        } elseif ($this->input('category_option') === 'new') {
            $rules['new_category_name'] = 'required|string|max:255|unique:course_categories,name';
        }

        return $rules;
    }
    public function messages(): array {
        return [
            'title.required' => 'กรุณาใส่ชื่อหลักสูตร',
            'title.max' => 'ชื่อหลักสูตรไม่สามารถเกิน 255 ตัวอักษร',
            'description.max' => 'คำอธิบายหลักสูตรไม่สามารถเกิน 1000 ตัวอักษร',
            'image.max' => 'URL รูปภาพไม่สามารถเกิน 500 ตัวอักษร',
            'category_id.required' => 'กรุณาเลือกหมวดหมู่',
            'category_id.exists' => 'หมวดหมู่ที่เลือกไม่มีอยู่',
            'new_category_name.required' => 'กรุณาใส่ชื่อหมวดหมู่ใหม่',
            'new_category_name.max' => 'ชื่อหมวดหมู่ใหม่ไม่สามารถเกิน 255 ตัวอักษร',
            'new_category_name.unique' => 'ชื่อหมวดหมู่นี้มีอยู่แล้ว',
            'category_option.required' => 'กรุณาเลือกตัวเลือกหมวดหมู่',
            'category_option.in' => 'ตัวเลือกหมวดหมู่ต้องเป็น existing หรือ new',
            'status.required' => 'กรุณาเลือกสถานะ',
            'status.in' => 'สถานะต้องเป็น draft หรือ published',
        ];
    }
}
