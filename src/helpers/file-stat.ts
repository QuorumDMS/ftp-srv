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

//@ts-ignore
import { padStart, compact } from "lodash";
import { FileSystemError } from "../errors";

const FORMATS = {
  ls,
  ep
};

export function getFileStat(fileStat, format) {
  if (typeof format === 'function') return format(fileStat);
  if (!FORMATS.hasOwnProperty(format)) {
    throw new FileSystemError('Bad file stat formatter');
  }
  return FORMATS[format](fileStat);
}
;

function ls(fileStat) {
  let nowDate = new Date();
  const now = new Date(Date.UTC(
    nowDate.getUTCFullYear(),
    nowDate.getUTCMonth(),
    nowDate.getUTCDate(),
    nowDate.getUTCHours(),
    nowDate.getUTCMinutes(),
    nowDate.getUTCSeconds(),
    nowDate.getUTCMilliseconds()
  ));
  let fileStatDate = new Date(fileStat.mtime);
  const mtime = new Date(Date.UTC(
    fileStatDate.getUTCFullYear(),
    fileStatDate.getUTCMonth(),
    fileStatDate.getUTCDate(),
    fileStatDate.getUTCHours(),
    fileStatDate.getUTCMinutes(),
    fileStatDate.getUTCSeconds(),
    fileStatDate.getUTCMilliseconds()
  ));
  const timeDiff = diffInMonths(now, mtime);
  let mTimeString = "";
  if (timeDiff < 6) {
    //获取'MMM DD HH:mm'格式的日期
    mTimeString = mtime.toLocaleString('default', {
      month: 'short', //月份缩写
      day: 'numeric', //日期
      hour: 'numeric', //小时(24小时制)
      minute: 'numeric', //分钟
      hour12: false//使用24小时制，而不是12小时制
    });
  } else {
    //获取‘MMM DD YYYY’格式的日期
    mTimeString = mtime.toLocaleString('default', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  //Linux系统中ls-l命令中不包含逗号分隔，移除所有逗号
  mTimeString = mTimeString.replace(/,/g, '');
  return [
    fileStat.mode ? [
      fileStat.isDirectory() ? 'd' : '-',
      fileStat.mode & 256 ? 'r' : '-',
      fileStat.mode & 128 ? 'w' : '-',
      fileStat.mode & 64 ? 'x' : '-',
      fileStat.mode & 32 ? 'r' : '-',
      fileStat.mode & 16 ? 'w' : '-',
      fileStat.mode & 8 ? 'x' : '-',
      fileStat.mode & 4 ? 'r' : '-',
      fileStat.mode & 2 ? 'w' : '-',
      fileStat.mode & 1 ? 'x' : '-',
    ].join('') : fileStat.isDirectory() ? 'drwxr-xr-x' : '-rwxr-xr-x',
    '1',
    fileStat.uid || 1,
    fileStat.gid || 1,
    padStart(fileStat.size, 12),
    padStart(mTimeString, 12),
    fileStat.name
  ].join(' ');
}

function ep(fileStat) {
  let nowDate = new Date(fileStat.mtime);
  const now = new Date(Date.UTC(
    nowDate.getUTCFullYear(),
    nowDate.getUTCMonth(),
    nowDate.getUTCDate(),
    nowDate.getUTCHours(),
    nowDate.getUTCMinutes(),
    nowDate.getUTCSeconds(),
    nowDate.getUTCMilliseconds()
  ));
  const unixTimestampInSeconds = Math.floor(now.getTime() / 1000); //转换为秒级时间戳
  const facts = compact([
    fileStat.dev && fileStat.ino ? `i${fileStat.dev.toString(16)}.${fileStat.ino.toString(16)}` : null,
    fileStat.size ? `s${fileStat.size}` : null,
    fileStat.mtime ? `m${unixTimestampInSeconds}` : null,
    fileStat.mode ? `up${(fileStat.mode & 4095).toString(8)}` : null,
    fileStat.isDirectory() ? '/' : 'r'
  ]).join(',');
  return `+${facts}\t${fileStat.name}`;
}

function diffInMonths(dateLeft: Date, dateRight: Date): number {
  const yearsDiff = dateLeft.getFullYear() - dateRight.getFullYear();
  const monthsDiff = dateLeft.getMonth() - dateRight.getMonth();
  return yearsDiff * 12 + monthsDiff;
}
