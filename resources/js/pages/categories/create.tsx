import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TextLink from '@/components/text-link';

const colorOptions = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#84cc16', // lime
  '#6366f1', // indigo
];

export default function CategoriesCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '',
    order: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('categories.store'));
  };

  return (
    <>
      <Head title="สร้างหมวดหมู่ใหม่" />
      
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <TextLink href={route('categories.index')}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
            </TextLink>
            <div>
              <h1 className="text-3xl font-bold">สร้างหมวดหมู่ใหม่</h1>
              <p className="text-muted-foreground">เพิ่มหมวดหมู่ใหม่สำหรับจัดระเบียบหลักสูตร</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลหมวดหมู่</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">ชื่อหมวดหมู่ *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="เช่น การพัฒนาเว็บ, การออกแบบ, การตลาด"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">คำอธิบาย</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="อธิบายเกี่ยวกับหมวดหมู่นี้..."
                    className="mt-1"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <Label>สีของหมวดหมู่</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          data.color === color 
                            ? 'border-gray-900 scale-110' 
                            : 'border-gray-300 hover:border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setData('color', color)}
                      />
                    ))}
                  </div>
                  {errors.color && (
                    <p className="text-sm text-red-600 mt-1">{errors.color}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="icon">ไอคอน (ไม่บังคับ)</Label>
                  <Input
                    id="icon"
                    type="text"
                    value={data.icon}
                    onChange={(e) => setData('icon', e.target.value)}
                    placeholder="ชื่อไอคอน เช่น book, code, design"
                    className="mt-1"
                  />
                  {errors.icon && (
                    <p className="text-sm text-red-600 mt-1">{errors.icon}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="order">ลำดับการแสดง</Label>
                  <Input
                    id="order"
                    type="number"
                    value={data.order}
                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="mt-1"
                    min="0"
                  />
                  {errors.order && (
                    <p className="text-sm text-red-600 mt-1">{errors.order}</p>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <TextLink href={route('categories.index')}>
                    <Button type="button" variant="outline">
                      ยกเลิก
                    </Button>
                  </TextLink>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'กำลังสร้าง...' : 'สร้างหมวดหมู่'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 