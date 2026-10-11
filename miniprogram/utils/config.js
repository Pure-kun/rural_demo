/**
 * 全局配置
 */
const BASE_URL = 'http://localhost:8080'

// 后端接口还没齐，先全量走本地 mock 数据。
// 后端就绪后改成 false，即可切到真实接口。
const USE_MOCK = true

// 模拟网络延迟（毫秒），用来观察弱网下的 loading / 骨架屏效果
const MOCK_DELAY = 400

module.exports = {
  BASE_URL,
  USE_MOCK,
  MOCK_DELAY,
}
