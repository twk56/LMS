import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  courses_count: number;
}

interface Props {
  categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
  const handleDelete = (categoryId: number) => {
    router.delete(route('categories.destroy', categoryId));
  };

  return (
    <>
      <Head title="หมวดหมู่หลักสูตร" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">หมวดหมู่หลักสูตร</h1>
            <p className="text-muted-foreground">จัดการหมวดหมู่หลักสูตรในระบบ</p>
          </div>
          <Link href={route('categories.create')}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              สร้างหมวดหมู่ใหม่
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>
                    {category.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {category.description || 'ไม่มีคำอธิบาย'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    {category.courses_count} หลักสูตร
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={route('categories.edit', category.id)}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>ยืนยันการลบ</DialogTitle>
                          <DialogDescription>
                            คุณต้องการลบหมวดหมู่ "{category.name}" หรือไม่? 
                            การดำเนินการนี้ไม่สามารถยกเลิกได้
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDelete(category.id)}
                          >
                            ลบ
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มีหมวดหมู่</h3>
            <p className="text-muted-foreground mb-4">
              สร้างหมวดหมู่แรกของคุณเพื่อจัดระเบียบหลักสูตร
            </p>
            <Link href={route('categories.create')}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                สร้างหมวดหมู่แรก
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
} 