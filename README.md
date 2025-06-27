# fetch-write-data

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### node版本
```
14.16.1
```

### 遇到electron npm 下载失败问题
```
npm config edit 打开npm配置文件
空白处添加一下代码
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
electron_custom_dir={{ version }}
electron_mirror=https://cdn.npmmirror.com/binaries/electron/v
registry=https://registry.npmmirror.com/
```