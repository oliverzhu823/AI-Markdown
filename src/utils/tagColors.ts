// 预定义的标签颜色
export const TAG_COLORS = {
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    hoverBg: 'hover:bg-gray-200',
    darkBg: 'dark:bg-gray-700',
    darkText: 'dark:text-gray-300',
    darkHoverBg: 'dark:hover:bg-gray-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    hoverBg: 'hover:bg-red-200',
    darkBg: 'dark:bg-red-900',
    darkText: 'dark:text-red-300',
    darkHoverBg: 'dark:hover:bg-red-800',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    hoverBg: 'hover:bg-blue-200',
    darkBg: 'dark:bg-blue-900',
    darkText: 'dark:text-blue-300',
    darkHoverBg: 'dark:hover:bg-blue-800',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    hoverBg: 'hover:bg-green-200',
    darkBg: 'dark:bg-green-900',
    darkText: 'dark:text-green-300',
    darkHoverBg: 'dark:hover:bg-green-800',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    hoverBg: 'hover:bg-yellow-200',
    darkBg: 'dark:bg-yellow-900',
    darkText: 'dark:text-yellow-300',
    darkHoverBg: 'dark:hover:bg-yellow-800',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    hoverBg: 'hover:bg-purple-200',
    darkBg: 'dark:bg-purple-900',
    darkText: 'dark:text-purple-300',
    darkHoverBg: 'dark:hover:bg-purple-800',
  },
};

// 获取标签颜色
export const getTagColor = (tag: string) => {
  // 使用标签字符串的哈希值来确定颜色
  const colors = Object.keys(TAG_COLORS).filter(key => key !== 'default');
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % colors.length;
  return TAG_COLORS[colors[index] as keyof typeof TAG_COLORS];
};
