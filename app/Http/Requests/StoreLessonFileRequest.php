<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class StoreLessonFileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('lesson'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240', // 10MB max
                File::types(['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'zip', 'rar'])
            ],
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'order' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'กรุณาเลือกไฟล์',
            'file.file' => 'ไฟล์ที่อัปโหลดไม่ถูกต้อง',
            'file.max' => 'ขนาดไฟล์ต้องไม่เกิน 10MB',
            'file.mimes' => 'ประเภทไฟล์ไม่ถูกต้อง',
            'title.max' => 'ชื่อไฟล์ต้องไม่เกิน 255 ตัวอักษร',
            'description.max' => 'คำอธิบายต้องไม่เกิน 1000 ตัวอักษร',
            'order.integer' => 'ลำดับต้องเป็นตัวเลข',
            'order.min' => 'ลำดับต้องไม่น้อยกว่า 0',
        ];
    }
}