export function normalizePath(path: string): string {
  const segments = path.split('/');
  const normalizedSegments: string[] = [];
  for (const segment of segments) {
    if (segment === '.') {
      //当前目录，忽略
      continue;
    } else if (segment === '..') {
      //上一级目录，如果normalizedSegments非空则移除末尾一个元素
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
        //如果当前是绝对的，则只拼接路径的尾部一部分
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
  //返回结果的规范化路径
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
  //其它情况都是相对路径
  return false;
}

export function joinPath(...paths: string[]): string {
  // 使用正斜杠作为路径分隔符，适用于类Unix系统
  const separator = '/';

  // 过滤掉空字符串和只包含空白字符的字符串
  const nonEmptyPaths = paths.filter(path => path.trim() !== '');

  // 使用数组的 reduce 方法连接路径片段，并使用指定的分隔符
  // 同时处理 '.' 和 '..' 的情况
  return nonEmptyPaths.reduce((prev, curr) => {
    // 移除 prev 结尾的分隔符（如果有）
    const prevTrimmed = prev.endsWith(separator) ? prev.slice(0, -1) : prev;

    // 如果 curr 是 '.'，则忽略它
    if (curr === '.') {
      return prevTrimmed;
    }

    // 如果 curr 是 '..'，则尝试移除 prev 中的末尾一个路径段
    if (curr === '..') {
      // 查找 prev 中末尾一个分隔符的位置
      const lastIndex = prevTrimmed.lastIndexOf(separator);
      // 如果没有分隔符（即 prev 是根目录或空字符串），则保持 prev 不变
      // 否则，移除末尾一个路径段
      if (lastIndex !== -1) {
        return prevTrimmed.slice(0, lastIndex);
      }
      // 如果 prev 是空字符串或已经是根目录，则返回 '/' 或 ''
      return prevTrimmed === '' ? separator : prevTrimmed;
    }

    // 移除 curr 开头的分隔符（如果有）
    const currTrimmed = curr.startsWith(separator) ? curr.slice(1) : curr;

    // 将处理后的 prev 和 curr 用分隔符连接起来
    return prevTrimmed + separator + currTrimmed;
  }, '');
}

