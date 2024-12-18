import { saveAs } from 'file-saver';

export interface Version {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

export interface ExportData {
  versions: Version[];
  exportTime: number;
  appVersion: string;
}

// 导出单个版本
export const exportVersion = (version: Version) => {
  const data: ExportData = {
    versions: [version],
    exportTime: Date.now(),
    appVersion: '1.0.0',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  saveAs(blob, `${version.name}-${new Date().toISOString().split('T')[0]}.json`);
};

// 导出多个版本
export const exportVersions = (versions: Version[]) => {
  const data: ExportData = {
    versions,
    exportTime: Date.now(),
    appVersion: '1.0.0',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  saveAs(blob, `markdown-versions-${new Date().toISOString().split('T')[0]}.json`);
};

// 导入版本文件
export const importVersions = async (file: File): Promise<{
  versions: Version[];
  error?: string;
}> => {
  try {
    const text = await file.text();
    const data: ExportData = JSON.parse(text);

    // 验证导入的数据格式
    if (!Array.isArray(data.versions)) {
      throw new Error('无效的版本数据格式');
    }

    // 验证每个版本的数据结构
    const validVersions = data.versions.every(
      (v) =>
        typeof v.id === 'string' &&
        typeof v.name === 'string' &&
        typeof v.content === 'string' &&
        typeof v.timestamp === 'number'
    );

    if (!validVersions) {
      throw new Error('版本数据格式不正确');
    }

    // 为导入的版本生成新的ID和时间戳
    const importedVersions = data.versions.map((v) => ({
      ...v,
      id: `${v.id}-${Date.now()}`,
      timestamp: Date.now(),
      name: `${v.name} (导入)`,
    }));

    return { versions: importedVersions };
  } catch (error) {
    return {
      versions: [],
      error: error instanceof Error ? error.message : '导入失败',
    };
  }
};
