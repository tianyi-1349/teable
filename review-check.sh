#!/bin/bash
# review-check.sh - v2 核心代码一致性与稳定性检查脚本

set -e

echo "=========================================="
echo "v2 Core Review Check"
echo "=========================================="

# 1. 检查裸异常
echo ""
echo "=== 1. 检查裸异常 (throw new Error) ==="
THROW_COUNT=$(grep -r "throw new Error" packages/v2/core/src/application/services/ --include="*.ts" | grep -v ".spec.ts" | wc -l)
echo "发现 $THROW_COUNT 处裸异常"
grep -r "throw new Error" packages/v2/core/src/application/services/ --include="*.ts" | grep -v ".spec.ts" || true

# 2. 检查 _unsafeUnwrap 残留
echo ""
echo "=== 2. 检查 _unsafeUnwrap 残留 ==="
UNSAFE_COUNT=$(grep -r "_unsafeUnwrap" packages/v2/ --include="*.ts" | wc -l)
echo "发现 $UNSAFE_COUNT 处 _unsafeUnwrap"
if [ "$UNSAFE_COUNT" -gt 0 ]; then
    grep -r "_unsafeUnwrap" packages/v2/ --include="*.ts" || true
fi

# 3. 检查关键依赖版本一致性
echo ""
echo "=== 3. 检查依赖版本一致性 ==="
echo "ts-pattern 版本分布:"
grep -r '"ts-pattern":' packages/*/package.json packages/v2/*/package.json 2>/dev/null | sort | uniq -c

echo ""
echo "zod 版本分布:"
grep -r '"zod":' packages/*/package.json packages/v2/*/package.json 2>/dev/null | grep -v "zod-validation-error" | sort | uniq -c

echo ""
echo "neverthrow 版本分布:"
grep -r '"neverthrow":' packages/*/package.json packages/v2/*/package.json 2>/dev/null | sort | uniq -c

# 4. 检查事务边界
echo ""
echo "=== 4. 检查 withTransaction 使用 ==="
TRANS_COUNT=$(grep -r "withTransaction" packages/v2/core/src/application/services/ --include="*.ts" | grep -v ".spec.ts" | wc -l)
echo "发现 $TRANS_COUNT 处 withTransaction 调用"

# 5. 检查 VERSION_COLUMN 递增
echo ""
echo "=== 5. 检查版本控制 ==="
VERSION_COUNT=$(grep -r "VERSION_COLUMN\|__version" packages/v2/adapter-table-repository-postgres/src/ --include="*.ts" | grep -v ".spec.ts" | wc -l)
echo "发现 $VERSION_COUNT 处版本相关代码"

# 6. 检查错误码规范
echo ""
echo "=== 6. 检查错误码规范 (Top 20) ==="
grep -r "code:" packages/v2/core/src/application/services/ --include="*.ts" | grep -v ".spec.ts" | grep -o "code: ['\"][^'\"]*['\"]" | sed "s/code: ['\"]//;s/['\"]$//" | sort | uniq -c | sort -rn | head -20

# 7. 运行类型检查
echo ""
echo "=== 7. 运行类型检查 ==="
if command -v pnpm &> /dev/null; then
    NODE_OPTIONS=--max-old-space-size=6144 pnpm g:typecheck
else
    echo "pnpm 未安装，跳过类型检查"
fi

# 8. 检查 Visitor 守卫
echo ""
echo "=== 8. 检查 Visitor 模式守卫 ==="
VISITOR_COUNT=$(grep -r "instanceof AndSpec\|instanceof OrSpec\|instanceof NotSpec" packages/v2/ --include="*.ts" | wc -l)
echo "发现 $VISITOR_COUNT 处 composition spec 守卫"

echo ""
echo "=========================================="
echo "Review Check 完成"
echo "=========================================="
