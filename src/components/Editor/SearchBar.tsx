import React from 'react';
import { useVersionStore } from '@/store';

interface SearchBarProps {
  onClose: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const { content, setContent } = useVersionStore();
  const [searchText, setSearchText] = React.useState('');
  const [replaceText, setReplaceText] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const handleSearch = () => {
    if (!searchText) return;
    
    const results: number[] = [];
    let index = content.indexOf(searchText);
    while (index !== -1) {
      results.push(index);
      index = content.indexOf(searchText, index + 1);
    }
    
    setSearchResults(results);
    setCurrentIndex(results.length > 0 ? 0 : -1);
  };

  const handleReplace = () => {
    if (!searchText || !replaceText || currentIndex === -1) return;
    
    const newContent = content.substring(0, searchResults[currentIndex]) +
      replaceText +
      content.substring(searchResults[currentIndex] + searchText.length);
    
    setContent(newContent);
    handleSearch(); // 更新搜索结果
  };

  const handleReplaceAll = () => {
    if (!searchText || !replaceText) return;
    const newContent = content.replace(new RegExp(searchText, 'g'), replaceText);
    setContent(newContent);
    setSearchResults([]);
    setCurrentIndex(-1);
  };

  const handleNext = () => {
    if (currentIndex < searchResults.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="search-bar">
      <div className="search-input">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜索..."
        />
        <button onClick={handleSearch}>搜索</button>
        <button onClick={handlePrevious} disabled={currentIndex <= 0}>上一个</button>
        <button onClick={handleNext} disabled={currentIndex >= searchResults.length - 1}>下一个</button>
      </div>

      <div className="replace-input">
        <input
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="替换为..."
        />
        <button onClick={handleReplace} disabled={currentIndex === -1}>替换</button>
        <button onClick={handleReplaceAll}>全部替换</button>
      </div>

      <div className="search-status">
        {searchResults.length > 0 && (
          <span>
            {currentIndex + 1} / {searchResults.length} 个结果
          </span>
        )}
      </div>

      <button onClick={onClose} className="close-button">关闭</button>
    </div>
  );
}
