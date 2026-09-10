const DIVIDER = /^[\p{Pd}_=—–─\s]{4,}$/u;
const BULLET = /^(?:→|👉|🟢|✅|•|-|🍊|🎯)\s*(.*)$/u;
const NUMBERED = /^(\d+)[.)]\s*(.*)$/;

const SECTION_DEFINITIONS = [
  {
    key: 'benefits',
    label: 'คุณสมบัติและประโยชน์',
    pattern: /^(?:สรรพคุณ|คุณสมบัติเด่น|สรุปภาพรวม|ประโยชน์และสรรพคุณ|\d+\s*ประโยชน์และสรรพคุณ|เมื่อเราดื่มคอลลาเจนเป็นประจำ)/i,
  },
  { key: 'suitableFor', label: 'เหมาะสำหรับ', pattern: /^เหมาะสำหรับ/i },
  { key: 'ingredients', label: 'ส่วนประกอบสำคัญ', pattern: /^ส่วนประกอบ(?:ที่)?สำคัญ/i },
  { key: 'directions', label: 'วิธีรับประทาน', pattern: /^วิธีรับประทาน/i },
  { key: 'package', label: 'ขนาดบรรจุ', pattern: /^(?:ขนาดบรรจุ|รูปแบบผลิตภัณฑ์)/i },
  { key: 'storage', label: 'วิธีเก็บรักษา', pattern: /^วิธี(?:การ)?เก็บรักษา/i },
  { key: 'warning', label: 'คำเตือน', pattern: /^คำเตือน/i },
  { key: 'fda', label: 'เลข อย.', pattern: /^(?:ใบอนุญาต\s*)?เลข(?:ที่)?\s*อย\.?/i },
];

const SECTION_ORDER = new Map(
  SECTION_DEFINITIONS.map((definition, index) => [definition.key, index])
);

function normalizeLines(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !DIVIDER.test(line));
}

function stripLeadingMarker(line) {
  return line.replace(/^(?:→|👉|🟢|✅|•|-|🍊|🎯|🧪)\s*/u, '').trim();
}

function identifySection(line) {
  const candidate = stripLeadingMarker(line).replace(/:\s*$/, '').trim();
  const definition = SECTION_DEFINITIONS.find(({ pattern }) => pattern.test(candidate));
  if (!definition) return null;

  const inlineContent = definition.key === 'fda'
    ? candidate.match(/\d[\d-]+/)?.[0]
    : null;
  return { ...definition, inlineContent };
}

function groupSections(text) {
  const sections = [{ key: 'intro', label: null, lines: [], sourceIndex: -1 }];
  let current = sections[0];

  normalizeLines(text).forEach((line, sourceIndex) => {
    const heading = identifySection(line);
    if (!heading) {
      current.lines.push(line);
      return;
    }

    current = sections.find((section) => section.key === heading.key);
    if (!current) {
      current = {
        key: heading.key,
        label: heading.label,
        lines: [],
        sourceIndex,
      };
      sections.push(current);
    }
    if (heading.inlineContent && !current.lines.includes(heading.inlineContent)) {
      current.lines.push(heading.inlineContent);
    }
  });

  return sections
    .filter((section) => section.lines.length > 0)
    .sort((left, right) => {
      if (left.key === 'intro') return -1;
      if (right.key === 'intro') return 1;
      const leftRank = SECTION_ORDER.get(left.key) ?? SECTION_ORDER.size;
      const rightRank = SECTION_ORDER.get(right.key) ?? SECTION_ORDER.size;
      return leftRank - rightRank || left.sourceIndex - right.sourceIndex;
    });
}

function parseContent(lines) {
  const blocks = [];

  lines.forEach((line) => {
    const bulletMatch = line.match(BULLET);
    const content = bulletMatch ? bulletMatch[1].trim() : line;
    const numberedMatch = content.match(NUMBERED);

    if (numberedMatch) {
      blocks.push({ type: 'numbered', number: numberedMatch[1], text: numberedMatch[2] });
      return;
    }
    if (bulletMatch) {
      const previous = blocks.at(-1);
      if (previous?.type === 'list') previous.items.push(content);
      else blocks.push({ type: 'list', items: [content] });
      return;
    }
    blocks.push({ type: 'paragraph', text: content });
  });

  return blocks;
}

function ContentBlocks({ lines }) {
  return parseContent(lines).map((block, index) => {
    if (block.type === 'numbered') {
      return (
        <div key={index} className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-2.5 dark:bg-navy-800">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">
            {block.number}
          </span>
          <p className="pt-0.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {block.text}
          </p>
        </div>
      );
    }

    if (block.type === 'list') {
      return (
        <ul key={index} className="space-y-2">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {block.text}
      </p>
    );
  });
}

export default function ProductDescription({ text, compact = false }) {
  if (!text) return null;

  return (
    <div className={compact ? 'space-y-5' : 'space-y-7'}>
      {groupSections(text).map((section) => (
        <section key={section.key} className="space-y-3">
          {section.label && (
            <h3 className="border-b border-gray-100 pb-2 text-base font-semibold text-navy-900 dark:border-navy-800 dark:text-white">
              {section.label}
            </h3>
          )}
          <ContentBlocks lines={section.lines} />
        </section>
      ))}
    </div>
  );
}

export { groupSections, identifySection, normalizeLines, parseContent };
