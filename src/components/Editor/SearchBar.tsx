import { useEffect, useState, useRef, useCallback } from 'react';
import {
  MdSearch,
  MdArrowUpward,
  MdArrowDownward,
  MdClose,
  MdFindReplace,
  MdCheck,
} from 'react-icons/md';

interface SearchBarProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
  onClose: () => void;
}

interface SearchMatch {
  start: number;
  end: number;
  text: string;
}

export default function SearchBar({ editorRef, onClose }: SearchBarProps) {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 查找所有匹配
  const findMatches = useCallback(() => {
    if (!editorRef.current || !searchText) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const content = editorRef.current.value;
    const newMatches: SearchMatch[] = [];
    const regex = new RegExp(searchText, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
      newMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
    }

    setMatches(newMatches);
    if (newMatches.length > 0 && currentMatchIndex === -1) {
      setCurrentMatchIndex(0);
      highlightMatch(newMatches[0]);
    }
  }, [searchText, editorRef, currentMatchIndex]);

  // 高亮当前匹配
  const highlightMatch = useCallback((match: SearchMatch) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    editorRef.current.setSelectionRange(match.start, match.end);
  }, [editorRef]);

  // 查找下一个
  const findNext = useCallback(() => {
    if (matches.length === 0) return;
    const nextIndex = currentMatchIndex + 1 >= matches.length ? 0 : currentMatchIndex + 1;
    setCurrentMatchIndex(nextIndex);
    highlightMatch(matches[nextIndex]);
  }, [matches, currentMatchIndex, highlightMatch]);

  // 查找上一个
  const findPrev = useCallback(() => {
    if (matches.length === 0) return;
    const prevIndex = currentMatchIndex - 1 < 0 ? matches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    highlightMatch(matches[prevIndex]);
  }, [matches, currentMatchIndex, highlightMatch]);

  // 替换当前匹配
  const replaceCurrent = useCallback(() => {
    if (!editorRef.current || matches.length === 0 || currentMatchIndex === -1) return;

    const editor = editorRef.current;
    const match = matches[currentMatchIndex];
    const content = editor.value;
    const newContent = 
      content.substring(0, match.start) +
      replaceText +
      content.substring(match.end);

    editor.value = newContent;
    editor.dispatchEvent(new Event('change', { bubbles: true }));

    // 更新匹配
    findMatches();
  }, [editorRef, matches, currentMatchIndex, replaceText, findMatches]);

  // 替换所有匹配
  const replaceAll = useCallback(() => {
    if (!editorRef.current || matches.length === 0) return;

    const editor = editorRef.current;
    let content = editor.value;
    const regex = new RegExp(searchText, 'g');
    content = content.replace(regex, replaceText);

    editor.value = content;
    editor.dispatchEvent(new Event('change', { bubbles: true }));

    // 清空匹配
    setMatches([]);
    setCurrentMatchIndex(-1);
  }, [editorRef, matches, searchText, replaceText]);

  // 监听搜索文本变化
  useEffect(() => {
    findMatches();
  }, [searchText, findMatches]);

  // 自动聚焦搜索输入框
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // 快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        findPrev();
      } else {
        findNext();
      }
    } else if (e.key === 'F3') {
      e.preventDefault();
      if (e.shiftKey) {
        findPrev();
      } else {
        findNext();
      }
    }
  }, [findNext, findPrev, onClose]);

  return (
    <div
      className="absolute top-0 right-0 m-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg
                 border border-gray-200 dark:border-gray-700 min-w-[300px]"
      onKeyDown={handleKeyDown}
    >
      {/* 搜索区域 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg
                        border border-gray-200 dark:border-gray-700 px-2">
            <MdSearch className="w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="查找..."
              className="flex-1 py-1 bg-transparent focus:outline-none text-sm"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <MdClose className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={findPrev}
              disabled={matches.length === 0}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded
                       disabled:opacity-50 disabled:cursor-not-allowed"
              title="上一个 (Shift+Enter)"
            >
              <MdArrowUpward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={findNext}
              disabled={matches.length === 0}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded
                       disabled:opacity-50 disabled:cursor-not-allowed"
              title="下一个 (Enter)"
            >
              <MdArrowDownward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowReplace(!showReplace)}
              className={`p-1 rounded transition-colors
                ${showReplace
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400'
                }`}
              title="替换"
            >
              <MdFindReplace className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="关闭 (Esc)"
            >
              <MdClose className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
            {currentMatchIndex + 1} / {matches.length} 个匹配
          </div>
        )}

        {/* 替换区域 */}
        {showReplace && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg
                          border border-gray-200 dark:border-gray-700 px-2">
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="替换为..."
                  className="flex-1 py-1 bg-transparent focus:outline-none text-sm"
                />
              </div>

              <button
                onClick={replaceCurrent}
                disabled={matches.length === 0}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded
                         disabled:opacity-50 disabled:cursor-not-allowed"
                title="替换当前"
              >
                <MdCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <button
              onClick={replaceAll}
              disabled={matches.length === 0}
              className="w-full py-1 px-3 text-sm bg-blue-500 hover:bg-blue-600
                       text-white rounded transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              全部替换 ({matches.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
