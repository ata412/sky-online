export function localizeContent(records, translations) {
  const byId = new Map(translations.map((item) => [Number(item.content_id), item]));
  return records.map((record) => {
    const translated = byId.get(Number(record.id));
    if (!translated) return record;
    return {
      ...record,
      title: translated.title || record.title,
      description: translated.description || record.description,
      location: translated.location || record.location,
    };
  });
}
