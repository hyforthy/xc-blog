"use client";

import { useState, use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveManageArticle, getManageArticle } from "@/lib/api-client";
import { useRouter, useSearchParams } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Upload } from "@/components/ui/upload";
import { useTheme } from "../../theme-context";

import imageCompression from "browser-image-compression";

interface FormData {
  title: string;
  category: string;
  tags: string[];
  // Add other form fields as needed
}

export default function ArticleEditor({
  params,
}: {
  params: Promise<{ action: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Unwrap params promise
  const { action } = use(params);
  const id = searchParams.get("id");
  const isNew = action === "new";
  const isEdit = action === "edit";

  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(!isNew && !!id);

  const [categories, setCategories] = useState<Record<string, string>>({});
  const [allTags, setAllTags] = useState<Record<string, string>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 添加图片上传区域折叠状态
  const [isUploadExpanded, setIsUploadExpanded] = useState(false);
  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState(false);

  // 在组件内部
  const { theme } = useTheme();

  // 监听窗口大小变化
  useEffect(() => {
    const checkIsMobile = () => {
      // 使用 rem 单位检测，48rem 约等于 768px (假设 1rem = 16px)
      const remToPixel = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      setIsMobile(window.innerWidth < 48 * remToPixel);
    };

    // 初始检查
    checkIsMobile();

    // 添加窗口大小变化监听
    window.addEventListener("resize", checkIsMobile);

    // 清理监听器
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // 获取分类和标签数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch("/admin/api/categories"),
          fetch("/admin/api/tags"),
        ]);

        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        if (tagsRes.ok) setAllTags(await tagsRes.json());
      } catch (error) {
        console.error("获取分类或标签失败:", error);
      }
    };
    fetchData();
  }, []);

  // 修改表单默认值获取
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: async () => {
      if (isNew) return { title: "", category: "", tags: [] };

      if (isEdit) {
        if (!id) {
          toast.error("编辑失败", { description: "找不到要编辑的文章" });
          return { title: "", category: "", tags: [] };
        }

        try {
          setIsLoadingArticle(true);
          const article = await getManageArticle(id);
          setContent(article.content || "");

          // 设置选中的标签
          const tags = Array.isArray(article.tags) ? article.tags : [];
          setSelectedTags(tags);

          return {
            ...article,
            category: article.category || "",
            tags,
          };
        } catch (error) {
          console.error("获取文章失败:", error);
          toast.error("获取文章失败", { description: "无法加载文章数据" });
          return { title: "", category: "", tags: [] };
        } finally {
          setIsLoadingArticle(false);
        }
      }
      return { title: "", category: "", tags: [] };
    },
  });

  // 标签选择处理
  const handleTagSelect = (tagId: string) => {
    const newSelected = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelected);
    setValue("tags", newSelected);
  };

  const onSubmit = async (data: FormData) => {
    if (!content.trim()) {
      toast.error("内容不能为空", {
        description: "请输入文章内容",
      });
      return;
    }

    try {
      setIsLoading(true);
      await saveManageArticle({
        ...data,
        content,
        id: isNew ? null : id,
      });
      toast.success(isNew ? "文章创建成功" : "文章更新成功", {
        description: isNew ? "已成功创建新文章" : "文章已成功更新",
      });
      router.push("/admin/articles");
    } catch (error) {
      console.error("保存文章失败:", error);
      toast.error("保存失败", {
        description: "保存文章时出现错误，请重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 移除 handleDelete 函数，因为删除操作已在列表页完成

  if (!isNew && !isEdit) {
    return <div className="ml-64 pt-16 p-6">无效的操作</div>;
  }

  if (isLoadingArticle) {
    {
      /* 加载动画 */
    }
    return (
      <div className="inset-0 flex justify-center pt-25 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
        <div className="relative w-16 h-16">
          <div className="absolute w-full h-full rounded-full border-4 border-blue-100"></div>
          <div className="absolute w-full h-full rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  // 图片上传处理函数
  const handleImageUpload = async (file: File) => {
    try {
      // 压缩选项 - 保持高质量的同时减小文件大小
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920, // 限制最大边长
        useWebWorker: true,
        alwaysKeepResolution: true, // 保持比例
        fileType: "image/webp",
        initialQuality: 0.8,
      };

      // 执行压缩
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("file", compressedFile, file.name); // 保留原始文件名

      const response = await fetch("/admin/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("上传失败");

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("图片上传失败:", error);
      toast.error("图片上传失败");
      return null;
    }
  };

  // 修改布局部分
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 select-none">
        {isNew ? "新建文章" : "编辑文章"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 第一组：标题、分类、标签 */}
          <div className="space-y-6 p-3 rounded-md dark:shadow-gray-700 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                {...register("title", {
                  required: { value: true, message: "标题不能为空" },
                })}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message?.toString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>分类</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {categories[watch("category")] || "选择分类"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  align="start"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandInput placeholder="搜索分类..." />
                    <CommandEmpty>未找到分类</CommandEmpty>
                    <CommandGroup className="text-left">
                      {Object.entries(categories).map(([id, name]) => (
                        <CommandItem
                          key={id}
                          value={name}
                          onSelect={() => {
                            setValue("category", id);
                          }}
                          className="pl-4"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              watch("category") === id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">请选择分类</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>标签</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedTags.length > 0
                      ? selectedTags.map((id) => allTags[id]).join(", ")
                      : "选择标签"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  align="start"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandInput placeholder="搜索标签..." />
                    <CommandEmpty>未找到标签</CommandEmpty>
                    <CommandGroup className="text-left">
                      {Object.entries(allTags).map(([id, name]) => (
                        <CommandItem
                          key={id}
                          value={name}
                          onSelect={() => handleTagSelect(id)}
                          className="pl-4"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTags.includes(id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 第二组：图片上传 - 修改为可折叠 */}
          <div className="px-3 py-2 rounded-md dark:shadow-gray-700 shadow-sm">
            <div className="flex justify-between items-center">
              <Label>上传图片</Label>
              {isMobile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUploadExpanded(!isUploadExpanded)}
                  className="flex items-center h-5"
                >
                  {isUploadExpanded ? (
                    <>
                      <span className="mr-1 text-xs">收起</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span className="mr-1 text-xs">展开</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            <div
              className={`not-first:transition-all duration-300 ${
                isMobile && !isUploadExpanded
                  ? "h-0 overflow-hidden opacity-0"
                  : "opacity-100"
              } ${!isMobile || isUploadExpanded ? "mt-4" : "mt-0"}`}
            >
              <Upload
                onUpload={handleImageUpload}
                accept="image/*"
                maxSize={10 * 1024 * 1024} // 5MB
              />
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="space-y-2 rounded-md shadow-md">
          <Label htmlFor="content">内容</Label>
          <div>
            <MDEditor
              value={content}
              onChange={(value) => setContent(value || "")}
              height={500}
              minHeight={500}
              preview="edit"
              data-color-mode={theme === "dark" ? "dark" : "light"}
              textareaProps={{
                id: "content",
                disabled: isLoading,
              }}
            />
          </div>
          {!content.trim() && (
            <p className="text-amber-500 text-sm mt-1">请输入文章内容</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "保存中..." : "保存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
