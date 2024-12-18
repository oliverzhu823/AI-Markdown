import { useEffect, useState, useRef, useCallback } from 'react';
import { useVersionStore } from '@/store';
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
  const { updateContent } = useVersionStore();

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
      selectMatch(newMatches[0]);
    }
  }, [searchText, editorRef, currentMatchIndex]);

  // 选中匹配项
  const selectMatch = useCallback((match: SearchMatch) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    editor.setSelectionRange(match.start, match.end);
  }, [editorRef]);

  // 下一个匹配
  const nextMatch = useCallback(() => {
    if (matches.length === 0) return;

    const nextIndex = currentMatchIndex >= matches.length - 1 ? 0 : currentMatchIndex + 1;
    setCurrentMatchIndex(nextIndex);
    selectMatch(matches[nextIndex]);
  }, [matches, currentMatchIndex, selectMatch]);

  // 上一个匹配
  const previousMatch = useCallback(() => {
    if (matches.length === 0) return;

    const prevIndex = currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    selectMatch(matches[prevIndex]);
  }, [matches, currentMatchIndex, selectMatch]);

  // 替换当前匹配
  const replaceCurrent = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || matches.length === 0 || currentMatchIndex === -1) return;

    const match = matches[currentMatchIndex];
    const content = editor.value;
    const newContent = content.substring(0, match.start) + replaceText + content.substring(match.end);
    
    updateContent(newContent);
    editor.value = newContent;

    // 更新匹配列表
    findMatches();
  }, [editorRef, matches, currentMatchIndex, replaceText, updateContent, findMatches]);

  // 替换所有匹配
  const replaceAll = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || matches.length === 0) return;

    let content = editor.value;
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      content = content.substring(0, match.start) + replaceText + content.substring(match.end);
    }

    updateContent(content);
    editor.value = content;
    setMatches([]);
    setCurrentMatchIndex(-1);
  }, [editorRef, matches, replaceText, updateContent]);

  // 监听搜索文本变化
  useEffect(() => {
    findMatches();
  }, [searchText, findMatches]);

  // 自动聚焦搜索输入框
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="absolute top-0 right-0 z-10 flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <MdSearch className="w-5 h-5 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜索..."
          className="w-48 px-2 py-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100"
        />
        <span className="text-sm text-gray-500">
          {matches.length > 0 ? `${currentMatchIndex + 1}/${matches.length}` : '无匹配'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={previousMatch}
          disabled={matches.length === 0}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          title="上一个匹配"
        >
          <MdArrowUpward className="w-5 h-5" />
        </button>
        <button
          onClick={nextMatch}
          disabled={matches.length === 0}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          title="下一个匹配"
        >
          <MdArrowDownward className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowReplace(!showReplace)}
          className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
            showReplace ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
          title="替换"
        >
          <MdFindReplace className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="关闭"
        >
          <MdClose className="w-5 h-5" />
        </button>
      </div>

      {showReplace && (
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="替换为..."
            className="w-48 px-2 py-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={replaceCurrent}
            disabled={matches.length === 0 || currentMatchIndex === -1}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            title="替换当前"
          >
            <MdCheck className="w-5 h-5" />
          </button>
          <button
            onClick={replaceAll}
            disabled={matches.length === 0}
            className="px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            全部替换
          </button>
        </div>
      )}
    </div>
  );
}
