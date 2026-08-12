const SECTION_HEADING = /^(?:สรรพคุณ|คุณสมบัติเด่น(?:ของเครื่องดื่มสูตรนี้)?|สรุปภาพรวม(?:\s*\([^)]*\))?|ส่วนประกอบที่สำคัญ|วิธีรับประทาน|วิธีการเก็บรักษา|ขนาดบรรจุ|คำเตือน|ประโยชน์และสรรพคุณ|\d+\s*ประโยชน์และสรรพคุณ)/i;
const DIVIDER = /^-{4,}$/;
const BULLET = /^(→|👉|🟢|✅|•|-)\s*(.*)$/;
const NUMBERED = /^(\d+)[.)]\s*(.*)$/;

function normalizeLines(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !DIVIDER.test(line));
}

function parseDescription(text) {
  const blocks = [];

  for (const line of normalizeLines(text)) {
    const headingText = line.replace(/^[•🎯💡📌🌿☕]+\s*/, '').replace(/:$/, '');
    if (SECTION_HEADING.test(headingText)) {
      blocks.push({ type: 'heading', text: headingText });
      continue;
    }

    const numbered = line.match(NUMBERED);
    if (numbered) {
      blocks.push({ type: 'numbered', number: numbered[1], text: numbered[2] });
      continue;
    }

    const bullet = line.match(BULLET);
    if (bullet) {
      const previous = blocks.at(-1);
      const item = { marker: bullet[1], text: bullet[2] };
      if (previous?.type === 'list') previous.items.push(item);
      else blocks.push({ type: 'list', items: [item] });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  return blocks;
}

export default function ProductDescription({ text, compact = false }) {
  if (!text) return null;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {parseDescription(text).map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h3
              key={index}
              className={`${index > 0 ? 'mt-6' : ''} border-l-4 border-gold-500 pl-3 text-base font-bold leading-relaxed text-navy-900 dark:border-gold-400 dark:text-white`}
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === 'numbered') {
          return (
            <div key={index} className="flex items-start gap-3 rounded-xl bg-gold-50/70 px-4 py-3 dark:bg-navy-800/80">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-gold-400 dark:bg-gold-400 dark:text-navy-950">
                {block.number}
              </span>
              <p className="pt-0.5 font-semibold leading-relaxed text-navy-800 dark:text-gray-200">
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={index} className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-navy-800 dark:bg-navy-950/40">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2.5 text-[15px] font-light leading-relaxed text-gray-600 dark:text-gray-300">
                  <span aria-hidden="true" className="mt-0.5 w-5 shrink-0 text-center">
                    {item.marker === '-' || item.marker === '•' ? '•' : item.marker}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-[15px] font-light leading-7 text-gray-600 dark:text-gray-300">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
