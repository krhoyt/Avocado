# http://speccy.io/
# https://blog.runscope.com/posts/how-to-merge-openapi-definition-files
# https://developerjack.com/blog/2018/maintaining-large-design-first-api-specs/ 
speccy resolve main.yaml -o insights.yaml
cp insights.yaml ../public/api/insights.yaml