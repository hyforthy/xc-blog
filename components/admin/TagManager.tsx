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

interface TagManagerProps {
  initialTags: Record<string, string>;
}

export function TagManager({ initialTags }: TagManagerProps) {
  const [tags, setTags] = useState(initialTags);
  const [open, setOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [tagName, setTagName] = useState("");

  const handleEdit = (id: string, name: string) => {
    setCurrentTag({ id, name });
    setTagName(name);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (tagName.trim()) {
      try {
        const payload = {
          operation: currentTag ? "update" : "create",
          data: currentTag
            ? { id: currentTag.id, name: tagName }
            : { name: tagName },
        };

        const response = await fetch("/admin/api/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(currentTag ? "标签更新成功" : "标签创建成功", {
            description: `标签"${tagName}"已${currentTag ? "更新" : "添加"}`,
          });
          setTags((prev) => ({
            ...prev,
            ...(result.newId ? { [result.newId]: tagName } : {}),
            ...(currentTag ? { [currentTag.id]: tagName } : {}),
          }));
          setOpen(false);
          setCurrentTag(null);
          setTagName("");
        } else {
          const errorData = await response.json();
          toast.error("操作失败", {
            description: errorData.error || "未知错误",
          });
        }
      } catch (error) {
        toast.error("保存标签失败", {
          description: error instanceof Error ? error.message : "未知错误",
        });
      }
    } else {
      toast.error("输入无效", { description: "标签名称不能为空" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">标签管理</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                setCurrentTag(null);
                setTagName("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> 新增标签
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentTag ? "修改标签" : "新增标签"}</DialogTitle>
            </DialogHeader>
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="输入标签名称"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setCurrentTag(null);
                  setTagName("");
                }}
              >
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {currentTag ? "保存" : "新增"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(tags).length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
          <p className="mb-4 text-muted-foreground">暂无标签</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建第一个标签
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 gap-x-4 gap-y-6">
          {Object.entries(tags).map(([id, name]) => (
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
