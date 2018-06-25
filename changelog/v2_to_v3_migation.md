# Migration Guide - v2 to v3

The `FtpServer` constructor has been changed to only take one object option. Combining the two just made sense.

### From:

```js
const server = new FtpServer('ftp://0.0.0.0:21');
```

### To:

```js
const server = new FtpServer({
  url: 'ftp://0.0.0.0:21'
});
```

----

The `pasv_range` option has been changed to separate integer variables: `pasv_min`, `pasv_max`.

### From:

```js
const server = new FtpServer(..., {
  pasv_range: '1000-2000'
});
```

### To:

```js
const server = new FtpServer({
  pasv_min: 1000,
  pasv_max: 2000
})
```

----

The default passive port range has been changed to `1024` - `65535`

----