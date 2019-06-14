# blog-deploy

#创建资源
hexo g

#启动服务
hexo s



# hexo new layout title
hexo new layout 20170922-基于webpack处理js缓存
#{% asset_img 1.jpg %}  



# 发布
```
hexo clean为清除缓存
hexo g 为生成本地文件夹
hexo d为发布到github page上
```

# asset img bug
index.js 26 行添加
```
if(endPos < beginPos) endPos = beginPos
```