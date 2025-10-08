export const parseChannelCsv = (csvText: string): string[] => {
  return csvText
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(',')[1]?.trim())
    .filter((id): id is string => Boolean(id));
};

export const fetchChannelIds = async (csvUrl: string, init?: RequestInit): Promise<string[]> => {
  const response = await fetch(csvUrl, {
    cache: 'no-store',
    ...(init ?? {}),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch channel CSV (${response.status})`);
  }

  const csvText = await response.text();
  return parseChannelCsv(csvText);
};
