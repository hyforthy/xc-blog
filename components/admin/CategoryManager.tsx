"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CategoryManagerProps {
  initialCategories: Record<string, string>;
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const handleEdit = (id: string, name: string) => {
    setCurrentCategory({ id, name });
    setCategoryName(name);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (categoryName.trim()) {
      try {
        const payload = {
          operation: currentCategory ? "update" : "create",
          data: currentCategory
            ? { id: currentCategory.id, name: categoryName }
            : { name: categoryName },
        };

        const response = await fetch("/admin/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(currentCategory ? "分类更新成功" : "分类创建成功", {
            description: `分类"${categoryName}"已${
              currentCategory ? "更新" : "添加"
            }`,
          });
          setCategories((prev) => ({
            ...prev,
            ...(result.newId ? { [result.newId]: categoryName } : {}),
            ...(currentCategory ? { [currentCategory.id]: categoryName } : {}),
          }));
          setOpen(false);
          setCurrentCategory(null);
          setCategoryName("");
        } else {
          const errorData = await response.json();
          toast.error("操作失败", {
            description: errorData.error || "未知错误",
          });
        }
      } catch (error) {
        toast.error("保存分类失败", {
          description: error instanceof Error ? error.message : "未知错误",
        });
      }
    } else {
      toast.error("输入无效", { description: "分类名称不能为空" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">分类管理</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                setCurrentCategory(null);
                setCategoryName("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> 新增分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentCategory ? "修改分类" : "新增分类"}
              </DialogTitle>
            </DialogHeader>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="输入分类名称"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setCurrentCategory(null);
                  setCategoryName("");
                }}
              >
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {currentCategory ? "保存" : "新增"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(categories).length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
          <p className="mb-4 text-muted-foreground">暂无分类</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建第一个分类
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6  gap-4 gap-x-4 gap-y-6">
          {Object.entries(categories).map(([id, name]) => (
            <div
              key={id}
              className="flex items-center justify-between px-3 py-2 dark:shadow-gray-700 shadow-sm rounded-lg"
            >
              <span>{name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(id, name)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
