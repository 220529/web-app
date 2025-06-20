#!/bin/bash

echo "running..."

SCRIPT_DIR=$(dirname "$0")  # 获取当前脚本所在目录
source "$SCRIPT_DIR/save.sh"       # 执行同级目录的 .sh

text=$(cat "$SCRIPT_DIR/text")
echo $text

echo ${a}
echo "done."
