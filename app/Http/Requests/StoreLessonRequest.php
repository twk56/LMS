<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool { return true; } // adjust if you use policies
    public function rules(): array {
        return [
            'title'   => ['required','string','max:255'],
            'order'   => ['required','integer','min:1'],
            'content' => ['required','string'],
        ];
    }
    public function messages(): array {
        return [
            'title.required' => 'Please enter a lesson title.',
            'order.required' => 'Please enter the display order.',
            'content.required' => 'Please enter lesson content.',
        ];
    }
}
