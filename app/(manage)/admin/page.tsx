import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <div className="pt-6"> {/* 添加左边距和顶部内边距 */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">管理控制台</h1>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>欢迎使用管理后台</CardTitle>
              </CardHeader>
              <CardContent>
                <p>请从侧边栏选择要管理的内容</p>
              </CardContent>
            </Card>
            
            {/* 添加统计卡片示例 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>文章统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">x</p>
                  <p className="text-sm text-muted-foreground">总文章数</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>分类统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">x</p>
                  <p className="text-sm text-muted-foreground">总分类数</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>标签统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">x</p>
                  <p className="text-sm text-muted-foreground">总标签数</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}