# @teddyzhu/clipboard

![CI](https://github.com/Teddy-Zhu/node-clipboard-rs/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/@teddyzhu%2Fclipboard.svg)](https://www.npmjs.com/package/@teddyzhu/clipboard)

基于 clipboard-rs 和 napi-rs 的高性能 Node.js 剪贴板操作库，提供跨平台的剪贴板读写和监听功能。

## ✨ 特性

- 🚀 **高性能**: 基于 Rust 原生实现，性能优越
- 🔄 **实时监听**: 支持剪贴板变化监听，自动检测内容更新
- 🌐 **跨平台**: 支持 Windows、macOS 和 Linux（包括 Wayland(实验)）
- 📝 **多格式**: 支持文本、HTML、RTF、图片、文件等多种数据格式
- ⚡ **异步支持**: 提供同步和异步 API
- 🖼️ **图片处理**: 完整的图片剪贴板支持，包含尺寸和格式信息
- 🔧 **自定义格式**: 支持自定义数据格式的读写

## 📦 安装

```bash
npm install @teddyzhu/clipboard
```

## 🚀 快速开始

### 基本使用

```javascript
const { ClipboardManager } = require('@teddyzhu/clipboard')

const clipboard = new ClipboardManager()

// 设置和获取文本
clipboard.setText('Hello World!')
console.log(clipboard.getText()) // "Hello World!"

// 设置和获取 HTML
clipboard.setHtml('<h1>Hello HTML</h1>')
console.log(clipboard.getHtml())

// 检查格式是否可用
if (clipboard.hasFormat('text')) {
  console.log('剪贴板包含文本内容')
}
```

### 图片操作

```javascript
const { ClipboardManager } = require('@teddyzhu/clipboard')

const clipboard = new ClipboardManager()

// 检查是否有图片
if (clipboard.hasFormat('image')) {
  // 获取图片详细信息
  const imageData = clipboard.getImageData()
  console.log('图片信息:', {
    width: imageData.width,
    height: imageData.height,
    size: imageData.size,
    format: 'PNG (base64)'
  })
  
  // 保存图片到文件
  const fs = require('fs')
  const imageBuffer = Buffer.from(imageData.base64Data, 'base64')
  fs.writeFileSync('clipboard-image.png', imageBuffer)
}

// 从文件设置图片到剪贴板
const fs = require('fs')
const imageBuffer = fs.readFileSync('my-image.png')
const base64Data = imageBuffer.toString('base64')
clipboard.setImageBase64(base64Data)
```

### 剪贴板监听

```javascript
const { ClipboardListener } = require('@teddyzhu/clipboard')

const listener = new ClipboardListener()

listener.watch((data) => {
  console.log('剪贴板内容变化:')
  console.log('可用格式:', data.available_formats)

  // 处理文本内容
  if (data.text) {
    console.log('📝 文本:', data.text)
  }

  // 处理 HTML 内容
  if (data.html) {
    console.log('🌐 HTML:', data.html)
  }

  // 处理富文本内容
  if (data.rtf) {
    console.log('📄 RTF:', data.rtf)
  }

  // 处理图片内容
  if (data.image) {
    console.log('🖼️  图片信息:')
    console.log(`   尺寸: ${data.image.width}x${data.image.height}px`)
    console.log(`   大小: ${data.image.size} bytes`)
    console.log(`   数据长度: ${data.image.base64_data.length} 字符`)
  }

  // 处理文件列表
  if (data.files) {
    console.log('📁 文件列表:', data.files)
  }
})

// 检查监听状态
console.log('监听器类型:', listener.getListenerType()) // "wayland" 或 "generic"
console.log('正在监听:', listener.isWatching())

// 停止监听
// listener.stop()
```

### 异步操作

```javascript
const { ClipboardManager } = require('@teddyzhu/clipboard')

const clipboard = new ClipboardManager()

async function asyncClipboardDemo() {
  try {
    // 异步设置文本
    await clipboard.setTextAsync('异步设置的文本')
    
    // 异步获取文本
    const text = await clipboard.getTextAsync()
    console.log('异步获取的文本:', text)
    
    // 异步获取图片
    if (clipboard.hasFormat('image')) {
      const imageData = await clipboard.getImageDataAsync()
      console.log('异步获取的图片信息:', {
        width: imageData.width,
        height: imageData.height,
        size: imageData.size
      })
    }
  } catch (error) {
    console.error('异步操作失败:', error)
  }
}

asyncClipboardDemo()
```

### 便利函数

```javascript
const {
  getClipboardText,
  setClipboardText,
  getClipboardHtml,
  setClipboardHtml,
  getClipboardImageData,
  setClipboardImage,
  getClipboardFiles,
  setClipboardFiles,
  getFullClipboardData,
  clearClipboard,
  isWaylandClipboardAvailable
} = require('@teddyzhu/clipboard')

// 快速文本操作
setClipboardText('快速设置文本')
console.log(getClipboardText())

// 快速获取完整数据
const fullData = getFullClipboardData()
console.log('完整剪贴板数据:', fullData)

// 检查 Wayland 支持
if (isWaylandClipboardAvailable()) {
  console.log('当前环境支持 Wayland 剪贴板')
}

// 清空剪贴板
clearClipboard()
```

### 复合内容操作

```javascript
const { ClipboardManager } = require('@teddyzhu/clipboard')

const clipboard = new ClipboardManager()

// 同时设置多种格式的内容
const complexData = {
  text: '这是纯文本内容',
  html: '<h1>这是 HTML 内容</h1><p>支持丰富的格式</p>',
  rtf: '{\\rtf1\\ansi 这是 RTF 格式}',
  files: ['/path/to/file1.txt', '/path/to/file2.jpg']
}

clipboard.setContents(complexData)

// 或使用便利函数
const { setClipboardContents } = require('@teddyzhu/clipboard')
setClipboardContents(complexData)
```

## 📖 API 文档

### ClipboardManager 类

用于管理剪贴板操作的主要类。

#### 构造函数

```typescript
new ClipboardManager(): ClipboardManager
```

#### 文本操作

```typescript
getText(): string                    // 获取纯文本
setText(text: string): void          // 设置纯文本
getTextAsync(): Promise<string>      // 异步获取纯文本
setTextAsync(text: string): Promise<void> // 异步设置纯文本
```

#### HTML 操作

```typescript
getHtml(): string                    // 获取 HTML 内容
setHtml(html: string): void          // 设置 HTML 内容
```

#### 富文本操作

```typescript
getRichText(): string                // 获取 RTF 富文本
setRichText(rtf: string): void       // 设置 RTF 富文本
```

#### 图片操作

```typescript
getImageBase64(): string             // 获取图片 base64 数据
getImageData(): ImageData            // 获取图片详细信息
getImageDataAsync(): Promise<ImageData> // 异步获取图片信息
setImageBase64(base64: string): void // 设置图片（base64）
```

#### 文件操作

```typescript
getFiles(): string[]                 // 获取文件路径列表
setFiles(files: string[]): void      // 设置文件路径列表
```

#### 自定义格式操作

```typescript
getBuffer(format: string): Uint8Array    // 获取自定义格式数据
setBuffer(format: string, data: Uint8Array): void // 设置自定义格式数据
```

#### 复合操作

```typescript
setContents(data: ClipboardData): void   // 设置复合内容
```

#### 工具方法

```typescript
hasFormat(format: string): boolean       // 检查格式是否可用
getAvailableFormats(): string[]          // 获取所有可用格式
clear(): void                           // 清空剪贴板
```

### ClipboardListener 类

用于监听剪贴板变化的类。

#### 构造函数

```typescript
new ClipboardListener(): ClipboardListener
```

#### 监听控制

```typescript
watch(callback: (data: ClipboardData) => void): void  // 开始监听
stop(): void                                          // 停止监听
isWatching(): boolean                                 // 检查监听状态
getListenerType(): string                            // 获取监听器类型
```

### 数据类型

#### ClipboardData

```typescript
interface ClipboardData {
  available_formats: string[]     // 可用格式列表
  text?: string                   // 纯文本内容
  rtf?: string                    // RTF 富文本内容
  html?: string                   // HTML 内容
  image?: ImageData               // 图片数据
  files?: string[]                // 文件路径列表
}
```

#### ImageData

```typescript
interface ImageData {
  width: number           // 图片宽度（像素）
  height: number          // 图片高度（像素）
  size: number            // 数据大小（字节）
  base64_data: string     // base64 编码的图片数据
}
```

### 便利函数

```typescript
// 文本操作
getClipboardText(): string
setClipboardText(text: string): void

// HTML 操作
getClipboardHtml(): string
setClipboardHtml(html: string): void

// 图片操作
getClipboardImage(): string                    // 获取 base64
getClipboardImageData(): ImageData             // 获取详细信息
setClipboardImage(base64: string): void

// 文件操作
getClipboardFiles(): string[]
setClipboardFiles(files: string[]): void

// 自定义格式操作
getClipboardBuffer(format: string): Uint8Array
setClipboardBuffer(format: string, data: Uint8Array): void

// 复合操作
getFullClipboardData(): ClipboardData
setClipboardContents(data: ClipboardData): void

// 工具函数
clearClipboard(): void
isWaylandClipboardAvailable(): boolean
```

## 🌟 特殊功能

### Wayland 支持

本库自动检测运行环境，在 Wayland 桌面环境下会使用专门优化的监听器：

```javascript
const { isWaylandClipboardAvailable, ClipboardListener } = require('@teddyzhu/clipboard')

if (isWaylandClipboardAvailable()) {
  console.log('使用 Wayland 优化的剪贴板监听器')
} else {
  console.log('使用通用剪贴板监听器')
}

const listener = new ClipboardListener()
console.log('监听器类型:', listener.getListenerType())
```

### 环境检测

```javascript
// 检测当前环境是否支持 Wayland 剪贴板
if (isWaylandClipboardAvailable()) {
  // Wayland 环境下的特殊处理
}
```

## 🛠️ 开发环境要求

- **Node.js**: >= 12.0.0
- **操作系统**: Windows 7+, macOS 10.9+, Linux
- **Linux 额外要求**:
  - X11: `libxcb`, `libxcb-shape`, `libxcb-xfixes`
  - Wayland: `wl-clipboard` 工具

### Linux 依赖安装

**Ubuntu/Debian:**
```bash
sudo apt install libxcb1-dev libxcb-shape0-dev libxcb-xfixes0-dev wl-clipboard
```

**CentOS/RHEL:**
```bash
sudo yum install libxcb-devel wl-clipboard
```

**Arch Linux:**
```bash
sudo pacman -S libxcb wl-clipboard
```

## 🔧 故障排除

### 常见问题

1. **Linux 环境下无法访问剪贴板**
   - 确保安装了必要的系统依赖
   - 检查桌面环境是否支持剪贴板操作

2. **Wayland 环境下监听不工作**
   - 确保安装了 `wl-clipboard` 工具
   - 检查环境变量 `WAYLAND_DISPLAY` 是否正确设置

3. **图片格式不支持**
   - 目前支持 PNG、JPEG、GIF、BMP 格式
   - 图片数据统一转换为 PNG 格式输出

4. **权限问题**
   - 某些 Linux 发行版可能需要额外的权限配置
   - 确保应用程序有访问剪贴板的权限

### 调试模式

```javascript
const { ClipboardManager } = require('@teddyzhu/clipboard')

const clipboard = new ClipboardManager()

try {
  // 检查可用格式
  const formats = clipboard.getAvailableFormats()
  console.log('可用格式:', formats)
  
  // 逐一测试各种格式
  if (clipboard.hasFormat('text')) {
    console.log('文本内容:', clipboard.getText())
  }
  
  if (clipboard.hasFormat('image')) {
    const imageData = clipboard.getImageData()
    console.log('图片信息:', imageData.width, 'x', imageData.height)
  }
} catch (error) {
  console.error('剪贴板操作失败:', error.message)
}
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如遇问题，请在 [GitHub Issues](https://github.com/Teddy-Zhu/node-clipboard-rs/issues) 中报告。
