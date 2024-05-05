/*
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export function normalizePath(path: string): string {
  const segments = path.split('/');
  const normalizedSegments: string[] = [];
  for (const segment of segments) {
    if (segment === '.') {
      //当前目录，忽略
      continue;
    } else if (segment === '..') {
      //上一级目录，如果normalizedSegments非空则移除最后一个元素
      if (normalizedSegments.length > 0) {
        normalizedSegments.pop();
      }
    } else {
      //正常的路径段，添加到normalizedSegments中
      normalizedSegments.push(segment);
    }
  }
  //将normalizedSegments数组中的元素用斜杠连接起来，并确保不以斜杆结尾（除非路径本身就是根目录）
  const normalizedPath = normalizedSegments.join('/');
  if (path.startsWith('/') && !normalizedPath.startsWith('/')) {
    return '/' + normalizedPath;
  }
  return normalizedPath
}

export function resolvePath(...paths: string[]): string {
  let resolvedPath = '';
  let isAbsolute = false;
  for (const path of paths) {
    //跳过空路径
    if (path === '') continue;
    // 如果路径是绝对的，重置resolvedPath和isAbsolute 标志
    if (path[0] === '/' || // UNIX 绝对路径
      (path.length > 1 && path[1] === ':' && // Windows UNC 路径,
        (path[0] === '\\' || path[0] === '/'))) {
      resolvedPath = path;
      isAbsolute = true;
    } else {
      //如果是相对路径，根据当前是否绝对路径进行处理
      if (isAbsolute) {
        //如果当前是绝对的，则只拼接路径的最后一部分
        resolvedPath = path.split('/').pop() || '.';
      } else {
        //如果当前不是绝对的，则使用目录分隔符拼接路径
        resolvedPath = (resolvedPath === '' ? '.' : resolvedPath) + '/' + path;
      }
    }
  }
  // 规范化路径，移除多余的'’和'..'
  const segments = resolvedPath.split('/');
  const normalizedSegments = [];
  for (let segment of segments) {
    if (segment === '.'||segment ==='') {
      continue;
    } else if (segment === '..') {
      normalizedSegments.pop();
    } else {
      normalizedSegments.push(segment);
    }
  }
  //返回最终的规范化路径
  return normalizedSegments.join('/');
}

export function isAbsolutePath(path: string): boolean {
  //在UNIX和POSIX系统上，如果路径以正斜杠(/)开头。则它是绝对的
  if (path[0] === '/') {
    return true;
  }
  //在 Windows 上，如果路径以双反斜杠(\\)后跟一个或多个字母开头。则它是绝对的
  // 例:\\server\share 或c:folder
  if (path.length >= 2 && path[1] === ':' && (path[0] === '\\' || path[0] === '/')) {
    const secondChar = path.charCodeAt(1);
    return (secondChar >= 65 && secondChar <= 90) || (secondChar >= 97 && secondChar <= 122);
  }
  //其他情况都是相对路径
  return false;
}

export function joinPath(...paths: string[]): string {
  //使用正斜杠作为路径分隔符，适用于类Unix系统
  const separator = '/';
  //使用数组的reduce 方法连接路径片段，并使用指定的分隔符
  return paths.reduce((prev, curr) => {
    //移除prev结尾的杠和r 开头的斜杠，以避免出现重复的斜杠
    const prevTrimmed = prev.endsWith(separator) ? prev.slice(0, -1) : prev;
    const currTrimmed = curr.startsWith(separator) ? curr.slice(1) : curr;
    return prevTrimmed + separator + currTrimmed;
  }, '');
}

