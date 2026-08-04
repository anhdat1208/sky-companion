import { vi } from 'vitest'

export const composableErrorMessages: Record<string, string> = {
  'errors.telescope.calcFailed': 'Không thể tính toán mục tiêu. Hãy thử làm mới.',
  'errors.moonCalendar.calcFailed': 'Không thể tính lịch Mặt Trăng. Hãy thử làm mới.',
  'errors.meteor.calcFailed': 'Không thể tính lịch mưa sao băng. Hãy thử làm mới.',
  'errors.astroPhotography.calcFailed': 'Không thể tính lịch chụp ảnh. Hãy thử làm mới.',
  'errors.devicePointing.unsupported': 'Trình duyệt này không hỗ trợ cảm biến hướng thiết bị.',
  'errors.devicePointing.permissionDenied': 'Bạn đã từ chối quyền truy cập cảm biến hướng thiết bị.',
  'errors.devicePointing.enableFailed': 'Không thể bật cảm biến hướng thiết bị.'
}

export function stubComposableI18n() {
  vi.stubGlobal('useI18n', () => ({
    t: (key: string) => composableErrorMessages[key] ?? key
  }))
}
