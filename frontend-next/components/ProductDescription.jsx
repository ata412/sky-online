const SECTION_HEADING = /^(?:สรรพคุณ|คุณสมบัติเด่น(?:ของเครื่องดื่มสูตรนี้)?|สรุปภาพรวม(?:\s*\([^)]*\))?|ส่วนประกอบที่สำคัญ|วิธีรับประทาน|วิธีการเก็บรักษา|ขนาดบรรจุ|คำเตือน|ประโยชน์และสรรพคุณ|\d+\s*ประโยชน์และสรรพคุณ)/i;
const DIVIDER = /^-{4,}$/;

function normalizeLines(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ProductDescription({ text, compact = false }) {
  if (!text) return null;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-2'}>
      {normalizeLines(text).map((line, index) => {
        if (DIVIDER.test(line)) return null;

        const headingText = line.replace(/^[•🎯💡📌🌿☕]+\s*/, '').replace(/:$/, '');
        if (SECTION_HEADING.test(headingText)) {
          return (
            <h3
              key={index}
              className={`${index > 0 ? 'pt-4' : ''} text-base font-bold leading-relaxed text-navy-900 dark:text-white`}
            >
              {headingText}
            </h3>
          );
        }

        if (/^\d+[.)]\s/.test(line)) {
          return (
            <p key={index} className="pt-3 font-semibold leading-relaxed text-navy-800 dark:text-gray-200">
              {line}
            </p>
          );
        }

        if (/^(?:→|👉|🟢|✅|•|-\s)/.test(line)) {
          return (
            <p key={index} className="pl-4 font-light leading-relaxed text-gray-600 dark:text-gray-300">
              {line}
            </p>
          );
        }

        return (
          <p key={index} className="font-light leading-relaxed text-gray-600 dark:text-gray-300">
            {line}
          </p>
        );
      })}
    </div>
  );
}
