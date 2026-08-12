/**
 * 应用入口（art-admin）
 *
 * 真正的启动逻辑在 `./bootstrap`，这里只负责最早期的副作用处理，
 * 保持入口足够薄，方便按需插入 mock、sentry 等。
 */

// 解决移动端 touchstart 被动监听告警
document.addEventListener('touchstart', function () {}, { passive: false });

import('./bootstrap').then(({ bootstrap }) => {
  bootstrap();
});
