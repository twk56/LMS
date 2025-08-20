import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
    {
        title: 'หลักสูตร',
        href: '/courses',
    },
];

interface Course {
    id: number;
    title: string;
}

interface Lesson {
    id: number;
    title: string;
}

interface QuizQuestion {
    question: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    points: number;
    answers: {
        answer: string;
        is_correct: boolean;
    }[];
}

interface QuizCreateProps {
    course: Course;
    lesson: Lesson;
}

export default function QuizCreate({ course, lesson }: QuizCreateProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        {
            question: '',
            type: 'multiple_choice',
            points: 1,
            answers: [
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
            ],
        },
    ]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question: '',
                type: 'multiple_choice',
                points: 1,
                answers: [
                    { answer: '', is_correct: false },
                    { answer: '', is_correct: false },
                ],
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const newQuestions = [...questions];
        if (field === 'answers') {
            newQuestions[index].answers = value;
        } else {
            (newQuestions[index] as any)[field] = value;
        }
        setQuestions(newQuestions);
    };

    const addAnswer = (questionIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].answers.push({ answer: '', is_correct: false });
        setQuestions(newQuestions);
    };

    const removeAnswer = (questionIndex: number, answerIndex: number) => {
        const newQuestions = [...questions];
        if (newQuestions[questionIndex].answers.length > 2) {
            newQuestions[questionIndex].answers.splice(answerIndex, 1);
            setQuestions(newQuestions);
        }
    };

    const updateAnswer = (questionIndex: number, answerIndex: number, field: keyof typeof questions[0]['answers'][0], value: any) => {
        const newQuestions = [...questions];
        (newQuestions[questionIndex].answers[answerIndex] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', (document.getElementById('title') as HTMLInputElement).value);
        formData.append('description', (document.getElementById('description') as HTMLTextAreaElement).value);
        formData.append('time_limit', (document.getElementById('time_limit') as HTMLInputElement).value);
        formData.append('passing_score', (document.getElementById('passing_score') as HTMLInputElement).value);
        formData.append('questions', JSON.stringify(questions));

        router.post(route('courses.lessons.quizzes.store', [course.id, lesson.id]), formData);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`สร้างแบบทดสอบ - ${lesson.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={route('courses.lessons.show', [course.id, lesson.id])}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับไปบทเรียน
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">สร้างแบบทดสอบ</h1>
                            <p className="text-muted-foreground">
                                บทเรียน: {lesson.title}
                            </p>
                        </div>
                    </div>
                </div>

                <Form onSubmit={handleSubmit} className="space-y-6">
                    {/* Quiz Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>รายละเอียดแบบทดสอบ</CardTitle>
                            <CardDescription>
                                กำหนดชื่อ คำอธิบาย และการตั้งค่าพื้นฐานของแบบทดสอบ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">ชื่อแบบทดสอบ *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="ชื่อแบบทดสอบ"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="passing_score">คะแนนผ่าน (%) *</Label>
                                    <Input
                                        id="passing_score"
                                        name="passing_score"
                                        type="number"
                                        min="1"
                                        max="100"
                                        defaultValue="60"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="description">คำอธิบาย</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="คำอธิบายแบบทดสอบ (ไม่บังคับ)"
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="time_limit">เวลาจำกัด (นาที)</Label>
                                    <Input
                                        id="time_limit"
                                        name="time_limit"
                                        type="number"
                                        min="1"
                                        placeholder="ไม่จำกัดเวลา"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>คำถาม</CardTitle>
                                    <CardDescription>
                                        เพิ่มคำถามและตัวเลือกสำหรับแบบทดสอบ
                                    </CardDescription>
                                </div>
                                <Button type="button" onClick={addQuestion} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    เพิ่มคำถาม
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {questions.map((question, questionIndex) => (
                                <div key={questionIndex} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">คำถามที่ {questionIndex + 1}</h4>
                                        {questions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeQuestion(questionIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>คำถาม *</Label>
                                            <Textarea
                                                placeholder="พิมพ์คำถามของคุณ"
                                                value={question.question}
                                                onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>ประเภทคำถาม *</Label>
                                                <Select
                                                    value={question.type}
                                                    onValueChange={(value: any) => updateQuestion(questionIndex, 'type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="multiple_choice">ตัวเลือกหลายข้อ</SelectItem>
                                                        <SelectItem value="true_false">ถูก/ผิด</SelectItem>
                                                        <SelectItem value="short_answer">ตอบสั้น</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>คะแนน *</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={question.points}
                                                    onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value))}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Answers for multiple choice and true/false */}
                                        {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label>ตัวเลือก</Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addAnswer(questionIndex)}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        เพิ่มตัวเลือก
                                                    </Button>
                                                </div>

                                                {question.answers.map((answer, answerIndex) => (
                                                    <div key={answerIndex} className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={answer.is_correct}
                                                            onCheckedChange={(checked) => 
                                                                updateAnswer(questionIndex, answerIndex, 'is_correct', checked)
                                                            }
                                                        />
                                                        <Input
                                                            placeholder={`ตัวเลือก ${answerIndex + 1}`}
                                                            value={answer.answer}
                                                            onChange={(e) => 
                                                                updateAnswer(questionIndex, answerIndex, 'answer', e.target.value)
                                                            }
                                                            required
                                                        />
                                                        {question.answers.length > 2 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeAnswer(questionIndex, answerIndex)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Note for short answer */}
                                        {question.type === 'short_answer' && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    คำถามประเภทตอบสั้นจะต้องตรวจสอบด้วยตนเอง
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <a href={route('courses.lessons.show', [course.id, lesson.id])}>
                                ยกเลิก
                            </a>
                        </Button>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            สร้างแบบทดสอบ
                        </Button>
                    </div>
                </Form>
            </div>
        </AppLayout>
    );
}
